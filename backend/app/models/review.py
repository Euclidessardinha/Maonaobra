from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Text,
    UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class Review(Base):
    __tablename__ = "reviews"

    __table_args__ = (
        UniqueConstraint(
            "project_id",
            name="uq_review_project"
        ),
        UniqueConstraint(
            "service_request_id",
            name="uq_review_service_request"
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    # Avaliação de projeto
    project_id: Mapped[int | None] = mapped_column(
        ForeignKey("projects.id"),
        nullable=True
    )

    # Avaliação de pedido de serviço
    service_request_id: Mapped[int | None] = mapped_column(
        ForeignKey("service_requests.id"),
        nullable=True
    )

    client_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    provider_id: Mapped[int] = mapped_column(
        ForeignKey("provider_profiles.id"),
        nullable=False
    )

    rating: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    comment: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    project = relationship("Project")

    service_request = relationship("ServiceRequest")

    client = relationship("User")

    provider = relationship("ProviderProfile")