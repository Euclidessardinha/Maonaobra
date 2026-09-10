
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text
)

from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class Notification(Base):

    __tablename__ = "notifications"


    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )


    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )


    conversation_id: Mapped[int | None] = mapped_column(
        ForeignKey("conversations.id"),
        nullable=True,
        index=True
    )


    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )


    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )


    message: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )


    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    email_sent: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )


    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

