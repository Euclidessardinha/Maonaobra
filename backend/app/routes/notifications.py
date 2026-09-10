from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db

from app.models.notification import Notification
from app.models.user import User


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# =========================================================
# OBTER TODAS AS NOTIFICAÇÕES DO UTILIZADOR
# =========================================================

@router.get("")
def get_my_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id
        )
        .order_by(
            Notification.created_at.desc()
        )
        .all()
    )

    return notifications


# =========================================================
# CONTADOR DE NOTIFICAÇÕES NÃO LIDAS
# =========================================================

@router.get("/unread/count")
def get_unread_notifications_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    count = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
        .count()
    )

    return {
        "count": count
    }


# =========================================================
# MARCAR UMA NOTIFICAÇÃO COMO LIDA
# =========================================================

@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notificação não encontrada."
        )

    notification.is_read = True

    db.commit()
    db.refresh(notification)

    return notification


# =========================================================
# MARCAR TODAS AS NOTIFICAÇÕES DE UMA CONVERSA COMO LIDAS
# =========================================================

@router.patch("/conversation/{conversation_id}/read")
def mark_conversation_notifications_as_read(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == current_user.id,
            Notification.conversation_id == conversation_id,
            Notification.type == "NEW_MESSAGE",
            Notification.is_read == False
        )
        .all()
    )

    for notification in notifications:
        notification.is_read = True

    db.commit()

    return {
        "success": True,
        "conversation_id": conversation_id,
        "marked_as_read": len(notifications)
    }