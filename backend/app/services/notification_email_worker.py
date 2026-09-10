import asyncio
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.notification import Notification
from app.models.user import User
from app.models.conversation import Conversation

from app.services.email_service import (
    send_new_message_email
)


EMAIL_DELAY_MINUTES = 5

# O worker verifica o banco a cada 30 segundos.
CHECK_INTERVAL_SECONDS = 30


def process_pending_email_notifications():
    """
    Procura notificações de novas mensagens que:

    - ainda não foram lidas;
    - ainda não receberam e-mail;
    - têm pelo menos 5 minutos de existência.

    As notificações são agrupadas por usuário + conversa
    para evitar vários e-mails da mesma conversa.
    """

    db: Session = SessionLocal()

    try:
        now = datetime.now(timezone.utc)

        cutoff_time = (
            now -
            timedelta(minutes=EMAIL_DELAY_MINUTES)
        )

        notifications = (
            db.query(Notification)
            .filter(
                Notification.type == "NEW_MESSAGE",
                Notification.is_read == False,
                Notification.email_sent == False,
                Notification.created_at <= cutoff_time
            )
            .order_by(
                Notification.created_at.asc()
            )
            .all()
        )

        if not notifications:
            return

        # Agrupar notificações por usuário + conversa.
        groups = {}

        for notification in notifications:

            # Notificações de chat devem possuir conversa.
            if notification.conversation_id is None:
                continue

            key = (
                notification.user_id,
                notification.conversation_id
            )

            if key not in groups:
                groups[key] = []

            groups[key].append(notification)

        for (
            user_id,
            conversation_id
        ), group in groups.items():

            user = (
                db.query(User)
                .filter(
                    User.id == user_id
                )
                .first()
            )

            conversation = (
                db.query(Conversation)
                .filter(
                    Conversation.id ==
                    conversation_id
                )
                .first()
            )

            if not user or not conversation:
                continue

            # Verificar novamente antes do envio.
            #
            # Isso é importante porque o usuário pode ter
            # aberto a conversa enquanto o worker estava
            # processando outras notificações.
            unread_notifications = [
                notification
                for notification in group
                if (
                    not notification.is_read
                    and not notification.email_sent
                )
            ]

            if not unread_notifications:
                continue

            # Descobrir quem enviou as mensagens.
            if conversation.client_id == user.id:

                sender = conversation.provider.user

            else:

                sender = conversation.client

            try:

                send_new_message_email(
                    recipient_email=user.email,
                    recipient_name=user.name,
                    sender_name=sender.name,
                    conversation_id=conversation.id,
                    user_role=user.role,
                    message_count=len(
                        unread_notifications
                    )
                )

                # Só marcamos email_sent depois que
                # o Resend aceitar o envio.
                for notification in unread_notifications:
                    notification.email_sent = True

                db.commit()

                print(
                    "[EMAIL WORKER] "
                    f"E-mail enviado para {user.email} "
                    f"(conversa {conversation.id}, "
                    f"{len(unread_notifications)} mensagem(ns))"
                )

            except Exception as error:

                db.rollback()

                print(
                    "[EMAIL WORKER] "
                    f"Erro ao enviar e-mail para "
                    f"{user.email}: {error}"
                )

    except Exception as error:

        db.rollback()

        print(
            "[EMAIL WORKER] "
            f"Erro geral: {error}"
        )

    finally:

        db.close()


async def notification_email_worker():
    """
    Worker contínuo que verifica notificações
    pendentes de e-mail.
    """

    print(
        "[EMAIL WORKER] "
        "Monitor de notificações iniciado."
    )

    while True:

        try:

            # Executar a consulta do banco em uma thread
            # para não bloquear o event loop do FastAPI.
            await asyncio.to_thread(
                process_pending_email_notifications
            )

        except Exception as error:

            print(
                "[EMAIL WORKER] "
                f"Erro no ciclo: {error}"
            )

        await asyncio.sleep(
            CHECK_INTERVAL_SECONDS
        )