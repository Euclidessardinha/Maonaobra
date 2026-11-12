
from datetime import datetime, timezone, timedelta
from calendar import monthrange
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import require_role

from app.models.payment import Payment
from app.models.user import User
from app.models.plan import Plan
from app.models.subscription import Subscription
from app.models.service_promotion import ServicePromotion
from app.models.service import Service
from app.models.provider import ProviderProfile


router = APIRouter(
    prefix="/admin/payments",
    tags=["Admin - Payments"]
)


# =========================
# SCHEMAS
# =========================

class PaymentCreate(BaseModel):
    user_id: int
    payment_type: str
    amount: Decimal
    payment_method: str
    reference: str | None = None
    plan_id: int | None = None
    promotion_id: int | None = None
    notes: str | None = None
    confirm_immediately: bool = False


class PaymentReject(BaseModel):
    notes: str | None = None


# =========================
# AUXILIARY FUNCTIONS
# =========================

def add_one_month(date):
    """Adiciona um mês respeitando o último dia do mês."""
    next_month = date.month + 1
    next_year = date.year

    if next_month > 12:
        next_month = 1
        next_year += 1

    last_day = monthrange(next_year, next_month)[1]
    new_day = min(date.day, last_day)

    return date.replace(
        year=next_year,
        month=next_month,
        day=new_day
    )


def get_promotion_owner(db: Session, promotion: ServicePromotion):
    service = db.query(Service).filter(
        Service.id == promotion.service_id
    ).first()

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Serviço associado à promoção não encontrado."
        )

    provider = db.query(ProviderProfile).filter(
        ProviderProfile.id == service.provider_id
    ).first()

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Prestador associado à promoção não encontrado."
        )

    return provider.user_id


def confirm_payment(
    db: Session,
    payment: Payment,
    admin_id: int
):
    """
    Confirma o pagamento e ativa a assinatura ou promoção.
    Não executa commit: a rota controla a transação.
    """

    if payment.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Este pagamento já foi processado."
        )

    now = datetime.now(timezone.utc)

    if payment.payment_type == "SUBSCRIPTION":

        if not payment.plan_id:
            raise HTTPException(
                status_code=400,
                detail="O pagamento não possui um plano associado."
            )

        plan = db.query(Plan).filter(
            Plan.id == payment.plan_id,
            Plan.is_active == True
        ).first()

        if not plan:
            raise HTTPException(
                status_code=404,
                detail="Plano não encontrado ou inativo."
            )

        if Decimal(str(payment.amount)) != Decimal(str(plan.price)):
            raise HTTPException(
                status_code=400,
                detail="O valor do pagamento não corresponde ao preço atual do plano."
            )

        # Desativar assinaturas anteriores ainda ativas
        previous_subscriptions = db.query(Subscription).filter(
            Subscription.user_id == payment.user_id,
            Subscription.status == "ACTIVE"
        ).all()

        for old_subscription in previous_subscriptions:
            old_subscription.status = "EXPIRED"

        # Criar a nova assinatura
        subscription = Subscription(
            user_id=payment.user_id,
            plan_id=plan.id,
            status="ACTIVE",
            starts_at=now,
            expires_at=add_one_month(now)
        )

        db.add(subscription)
        db.flush()

        payment.subscription_id = subscription.id

    elif payment.payment_type == "PROMOTION":

        if not payment.promotion_id:
            raise HTTPException(
                status_code=400,
                detail="O pagamento não possui uma promoção associada."
            )

        promotion = db.query(ServicePromotion).filter(
            ServicePromotion.id == payment.promotion_id
        ).first()

        if not promotion:
            raise HTTPException(
                status_code=404,
                detail="Promoção não encontrada."
            )

        if promotion.status != "PENDING":
            raise HTTPException(
                status_code=400,
                detail="Esta promoção não está pendente de pagamento."
            )

        owner_id = get_promotion_owner(db, promotion)

        if owner_id != payment.user_id:
            raise HTTPException(
                status_code=400,
                detail="O utilizador do pagamento não corresponde ao proprietário da promoção."
            )

        if Decimal(str(payment.amount)) != Decimal(str(promotion.price)):
            raise HTTPException(
                status_code=400,
                detail="O valor do pagamento não corresponde ao preço da promoção."
            )

        promotion.status = "ACTIVE"
        promotion.starts_at = now
        promotion.expires_at = now + timedelta(
            days=promotion.duration_days
        )

    else:
        raise HTTPException(
            status_code=400,
            detail="Tipo de pagamento inválido."
        )

    payment.status = "CONFIRMED"
    payment.processed_by_admin_id = admin_id
    payment.processed_at = now

    db.flush()

    return payment


# =========================
# LIST PAYMENTS
# =========================

@router.get("/")
def list_payments(
    status: str | None = Query(default=None),
    payment_type: str | None = Query(default=None),
    db: Session = Depends(get_db),
    admin=Depends(require_role("ADMIN"))
):
    query = db.query(Payment)

    if status:
        query = query.filter(Payment.status == status.upper())

    if payment_type:
        query = query.filter(
            Payment.payment_type == payment_type.upper()
        )

    payments = query.order_by(
        Payment.created_at.desc()
    ).all()

    return [
        {
            "id": p.id,
            "user_id": p.user_id,
            "payment_type": p.payment_type,
            "amount": float(p.amount),
            "payment_method": p.payment_method,
            "reference": p.reference,
            "status": p.status,
            "plan_id": p.plan_id,
            "subscription_id": p.subscription_id,
            "promotion_id": p.promotion_id,
            "created_by_admin_id": p.created_by_admin_id,
            "processed_by_admin_id": p.processed_by_admin_id,
            "notes": p.notes,
            "created_at": p.created_at,
            "processed_at": p.processed_at
        }
        for p in payments
    ]


# =========================
# REGISTER PAYMENT
# =========================

@router.post("/")
def create_payment(
    data: PaymentCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_role("ADMIN"))
):
    try:
        payment_type = data.payment_type.upper()

        if payment_type not in ["SUBSCRIPTION", "PROMOTION"]:
            raise HTTPException(
                status_code=400,
                detail="Tipo de pagamento inválido."
            )

        if data.amount <= 0:
            raise HTTPException(
                status_code=400,
                detail="O valor do pagamento deve ser superior a zero."
            )

        if not data.payment_method.strip():
            raise HTTPException(
                status_code=400,
                detail="Indique o método de pagamento."
            )

        user = db.query(User).filter(
            User.id == data.user_id
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Utilizador não encontrado."
            )

        if payment_type == "SUBSCRIPTION":

            if not data.plan_id or data.promotion_id:
                raise HTTPException(
                    status_code=400,
                    detail="Indique apenas o plano associado ao pagamento."
                )

            plan = db.query(Plan).filter(
                Plan.id == data.plan_id,
                Plan.is_active == True
            ).first()

            if not plan:
                raise HTTPException(
                    status_code=404,
                    detail="Plano não encontrado ou inativo."
                )

            if Decimal(str(data.amount)) != Decimal(str(plan.price)):
                raise HTTPException(
                    status_code=400,
                    detail="O valor informado não corresponde ao preço do plano."
                )

        else:

            if not data.promotion_id or data.plan_id:
                raise HTTPException(
                    status_code=400,
                    detail="Indique apenas a promoção associada ao pagamento."
                )

            promotion = db.query(ServicePromotion).filter(
                ServicePromotion.id == data.promotion_id
            ).first()

            if not promotion:
                raise HTTPException(
                    status_code=404,
                    detail="Promoção não encontrada."
                )

            if promotion.status != "PENDING":
                raise HTTPException(
                    status_code=400,
                    detail="Só é possível registar pagamento para promoções pendentes."
                )

            owner_id = get_promotion_owner(db, promotion)

            if owner_id != data.user_id:
                raise HTTPException(
                    status_code=400,
                    detail="O utilizador indicado não é proprietário desta promoção."
                )

            if Decimal(str(data.amount)) != Decimal(str(promotion.price)):
                raise HTTPException(
                    status_code=400,
                    detail="O valor informado não corresponde ao preço da promoção."
                )

        payment = Payment(
            user_id=data.user_id,
            payment_type=payment_type,
            amount=data.amount,
            payment_method=data.payment_method.strip(),
            reference=data.reference,
            status="PENDING",
            plan_id=data.plan_id,
            promotion_id=data.promotion_id,
            created_by_admin_id=admin.id,
            notes=data.notes
        )

        db.add(payment)
        db.flush()

        if data.confirm_immediately:
            confirm_payment(db, payment, admin.id)

        db.commit()
        db.refresh(payment)

        return {
            "message": (
                "Pagamento registado e confirmado."
                if payment.status == "CONFIRMED"
                else "Pagamento registado como pendente."
            ),
            "payment_id": payment.id,
            "status": payment.status
        }

    except Exception:
        db.rollback()
        raise


# =========================
# CONFIRM PAYMENT
# =========================

@router.post("/{payment_id}/confirm")
def confirm_payment_endpoint(
    payment_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_role("ADMIN"))
):
    try:
        payment = db.query(Payment).filter(
            Payment.id == payment_id
        ).with_for_update().first()

        if not payment:
            raise HTTPException(
                status_code=404,
                detail="Pagamento não encontrado."
            )

        confirm_payment(db, payment, admin.id)

        db.commit()
        db.refresh(payment)

        return {
            "message": "Pagamento confirmado e benefício ativado com sucesso.",            
            "payment_id": payment.id,
            "status": payment.status,
            "subscription_id": payment.subscription_id,
            "promotion_id": payment.promotion_id
        }

    except Exception:
        db.rollback()
        raise


# =========================
# REJECT PAYMENT
# =========================

@router.post("/{payment_id}/reject")
def reject_payment(
    payment_id: int,
    data: PaymentReject,
    db: Session = Depends(get_db),
    admin=Depends(require_role("ADMIN"))
):
    try:
        payment = db.query(Payment).filter(
            Payment.id == payment_id
        ).with_for_update().first()

        if not payment:
            raise HTTPException(
                status_code=404,
                detail="Pagamento não encontrado."
            )

        if payment.status != "PENDING":
            raise HTTPException(
                status_code=400,
                detail="Só é possível rejeitar pagamentos pendentes."
            )

        now = datetime.now(timezone.utc)

        payment.status = "REJECTED"
        payment.processed_by_admin_id = admin.id
        payment.processed_at = now

        if data.notes:
            payment.notes = data.notes

        if payment.payment_type == "PROMOTION" and payment.promotion_id:
            promotion = db.query(ServicePromotion).filter(
                ServicePromotion.id == payment.promotion_id
            ).first()

            if promotion and promotion.status == "PENDING":
                promotion.status = "REJECTED"

        db.commit()

        return {
            "message": "Pagamento rejeitado.",
            "payment_id": payment.id,
            "status": payment.status
        }

    except Exception:
        db.rollback()
        raise


# =========================
# PAYMENT STATISTICS
# =========================

@router.get("/stats")
def payment_stats(
    db: Session = Depends(get_db),
    admin=Depends(require_role("ADMIN"))
):
    payments = db.query(Payment).all()

    confirmed = [
        p for p in payments if p.status == "CONFIRMED"
    ]

    pending = [
        p for p in payments if p.status == "PENDING"
    ]

    rejected = [
        p for p in payments if p.status == "REJECTED"
    ]

    subscription_revenue = sum(
        (Decimal(str(p.amount)) for p in confirmed
         if p.payment_type == "SUBSCRIPTION"),
        Decimal("0")
    )

    promotion_revenue = sum(
        (Decimal(str(p.amount)) for p in confirmed
         if p.payment_type == "PROMOTION"),
        Decimal("0")
    )

    return {
        "total_payments": len(payments),
        "confirmed_count": len(confirmed),
        "pending_count": len(pending),
        "rejected_count": len(rejected),
        "total_revenue": float(
            subscription_revenue + promotion_revenue
        ),
        "subscription_revenue": float(subscription_revenue),
        "promotion_revenue": float(promotion_revenue)
    }
