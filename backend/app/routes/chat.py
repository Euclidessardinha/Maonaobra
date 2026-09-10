from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db

from app.models.user import User
from app.models.provider import ProviderProfile
from app.models.conversation import Conversation

from app.models.message import Message
from app.models.notification import Notification

from app.schemas.chat import (
    ConversationCreate,
    ConversationResponse,
    MessageCreate,
    MessageResponse
)


router = APIRouter(
    prefix="/chat/conversations",
    tags=["Chat"]
)


@router.post(
    "",
    response_model=ConversationResponse
)
def create_conversation(
    conversation_data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Apenas clientes podem iniciar uma conversa
    if current_user.role != "CLIENT":
        raise HTTPException(
            status_code=403,
            detail="Apenas clientes podem iniciar conversas."
        )

    # Procurar o profissional
    provider = (
        db.query(ProviderProfile)
        .filter(
            ProviderProfile.id ==
            conversation_data.provider_id
        )
        .first()
    )

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Profissional não encontrado."
        )

    # Impedir conversa consigo mesmo
    if provider.user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Você não pode iniciar uma conversa consigo mesmo."
        )

    # Verificar se já existe conversa
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.client_id == current_user.id,
            Conversation.provider_id == provider.id
        )
        .first()
    )

    # Se já existir, reutilizar
    if conversation:
        return {
            "id": conversation.id,
            "client_id": conversation.client_id,
            "provider_id": conversation.provider_id,
            "provider_name": provider.user.name,
            "provider_profession": provider.profession,
            "provider_location": provider.location,
            "client_name": current_user.name,
            "created_at": conversation.created_at,
        }
        

    # Criar nova conversa
    conversation = Conversation(
        client_id=current_user.id,
        provider_id=provider.id
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return {
        "id": conversation.id,
        "client_id": conversation.client_id,
        "provider_id": conversation.provider_id,
        "provider_name": provider.user.name,
        "provider_profession": provider.profession,
        "provider_location": provider.location,
        "client_name": current_user.name,
        "created_at": conversation.created_at,
    }


@router.get(
    "",
    response_model=list[ConversationResponse]
)
def get_my_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversations = (
        db.query(Conversation)
        .filter(
            (
                Conversation.client_id ==
                current_user.id
            )
            |
            (
                Conversation.provider.has(
                    ProviderProfile.user_id ==
                    current_user.id
                )
            )
        )
        .order_by(
            Conversation.created_at.desc()
        )
        .all()
    )

    result = []

    for conversation in conversations:

        provider = conversation.provider
        client = conversation.client

        result.append(
            {
                "id": conversation.id,
                "client_id": conversation.client_id,
                "provider_id": conversation.provider_id,
                "provider_name": provider.user.name,
                "provider_profession": provider.profession,
                "provider_location": provider.location,
                "client_name": client.name,
                "created_at": conversation.created_at,
            }
        )

    return result


@router.post(
    "/{conversation_id}/messages",
    response_model=MessageResponse
)
def send_message(
    conversation_id: int,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversa não encontrada."
        )

    # Verificar se o utilizador participa da conversa
    is_client = (
        conversation.client_id ==
        current_user.id
    )

    is_provider = (
        conversation.provider.user_id ==
        current_user.id
    )

    if not is_client and not is_provider:
        raise HTTPException(
            status_code=403,
            detail="Você não participa desta conversa."
        )

    message = Message(
        conversation_id=conversation.id,
        sender_id=current_user.id,
        content=message_data.content.strip()
    )

    db.add(message)


    # ==========================================
    # IDENTIFICAR O DESTINATÁRIO DA MENSAGEM
    # ==========================================

    if is_client:

        # Cliente enviou mensagem
        # Portanto, o destinatário é o prestador

        recipient = conversation.provider.user

    else:

        # Prestador enviou mensagem
        # Portanto, o destinatário é o cliente

        recipient = conversation.client


    # ==========================================
    # CRIAR NOTIFICAÇÃO
    # ==========================================

    notification = Notification(
        user_id=recipient.id,
        conversation_id=conversation.id,
        type="NEW_MESSAGE",
        title="Nova mensagem",
        message=f"{current_user.name} enviou uma nova mensagem.",
        is_read=False
    )

    db.add(notification)


    # ==========================================
    # GUARDAR MENSAGEM + NOTIFICAÇÃO
    # ==========================================

    db.commit()

    db.refresh(message)

    return message


@router.get(
    "/{conversation_id}/messages",
    response_model=list[MessageResponse]
)
def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id
        )
        .first()
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversa não encontrada."
        )

    # Verificar se o utilizador participa da conversa
    is_client = (
        conversation.client_id ==
        current_user.id
    )

    is_provider = (
        conversation.provider.user_id ==
        current_user.id
    )

    if not is_client and not is_provider:
        raise HTTPException(
            status_code=403,
            detail="Você não participa desta conversa."
        )

    messages = (
        db.query(Message)
        .filter(
            Message.conversation_id ==
            conversation_id
        )
        .order_by(
            Message.created_at.asc()
        )
        .all()
    )

    return messages