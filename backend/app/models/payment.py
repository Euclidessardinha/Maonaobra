
from datetime import datetime, timezone

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text
)
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    # Utilizador a quem pertence o pagamento
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # Tipo: SUBSCRIPTION ou PROMOTION
    payment_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        index=True
    )

    # Valor do pagamento
    amount: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    # Método: M-Pesa, e-Mola, transferência, dinheiro, etc.
    payment_method: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    # Referência ou código da operação
    reference: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    # Estado do pagamento
    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="PENDING",
        index=True
    )

    # Plano associado, quando for pagamento de assinatura
    plan_id: Mapped[int | None] = mapped_column(
        ForeignKey("plans.id"),
        nullable=True
    )

    # Assinatura criada após confirmação
    subscription_id: Mapped[int | None] = mapped_column(
        ForeignKey("subscriptions.id"),
        nullable=True
    )

    # Promoção associada, quando for pagamento de promoção
    promotion_id: Mapped[int | None] = mapped_column(
        ForeignKey("service_promotions.id"),
        nullable=True
    )

    # Administrador que registou o pagamento
    created_by_admin_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    # Administrador que confirmou ou rejeitou
    processed_by_admin_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    processed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
