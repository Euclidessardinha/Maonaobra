from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class PromotionEvent(Base):
    __tablename__ = "promotion_events"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    promotion_id: Mapped[int] = mapped_column(
        ForeignKey("service_promotions.id"),
        nullable=False,
        index=True
    )

    event_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    promotion = relationship(
        "ServicePromotion"
    )