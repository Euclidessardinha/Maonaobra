
from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class Favorite(Base):
    __tablename__ = "favorites"

    __table_args__ = (
        UniqueConstraint(
            "client_id",
            "provider_id",
            name="uq_client_provider_favorite"
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    client_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    provider_id: Mapped[int] = mapped_column(
        ForeignKey("provider_profiles.id"),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    client = relationship("User")

    provider = relationship("ProviderProfile")

