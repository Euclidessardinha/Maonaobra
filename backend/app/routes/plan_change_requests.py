
import calendar
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import require_provider, require_role
from app.models.plan_change_request import PlanChangeRequest
from app.models.subscription import Subscription
from app.models.plan import Plan
from app.models.user import User


router = APIRouter(
    prefix="/plan-change-requests",
    tags=["Plan Change Requests"]
)


class PlanChangeRequestCreate(BaseModel):
    plan_id: int


class PlanChangeRequestReject(BaseModel):
    admin_notes: str | None = None


def add_one_month(date: datetime) -> datetime:
    month = date.month + 1
    year = date.year

    if month > 12:
        month = 1
        year += 1

    day = min(date.day, calendar.monthrange(year, month)[1])

    return date.replace(year=year, month=month, day=day)


def serialize_request(request, plan, user=None):
    return {
        "id": request.id,
        "user_id": request.user_id,
        "user_email": user.email if user else None,
        "plan_id": request.plan_id,
        "plan_name": plan.name,
        "plan_price": float(plan.price),
        "portfolio_limit": plan.portfolio_limit,
        "status": request.status,
        "requested_at": request.requested_at,
        "processed_at": request.processed_at,
        "processed_by_admin_id": request.processed_by_admin_id,
        "admin_notes": request.admin_notes
    }


# --------------------------------------------------
# PRESTADOR: CONSULTAR OS SEUS PEDIDOS
# --------------------------------------------------

@router.get("/my")
def get_my_plan_change_requests(
    current_user=Depends(require_provider),
    db: Session = Depends(get_db)
):
    results = (
        db.query(PlanChangeRequest, Plan)
        .join(Plan, Plan.id == PlanChangeRequest.plan_id)
        .filter(PlanChangeRequest.user_id == current_user.id)
        .order_by(PlanChangeRequest.requested_at.desc())
        .all()
    )

    return [
        serialize_request(request, plan)
        for request, plan in results
    ]


# --------------------------------------------------
# PRESTADOR: SOLICITAR UM NOVO PLANO
# --------------------------------------------------

@router.post("/")
def create_plan_change_request(
    data: PlanChangeRequestCreate,
    current_user=Depends(require_provider),
    db: Session = Depends(get_db)
):
    # Bloqueia pedidos simultâneos para o mesmo utilizador.
    db.query(User).filter(
        User.id == current_user.id
    ).with_for_update().first()

    plan = db.query(Plan).filter(
        Plan.id == data.plan_id,
        Plan.is_active == True
    ).first()

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Plano não encontrado ou indisponível."
        )

    if float(plan.price) <= 0:
        raise HTTPException(
            status_code=400,
            detail="Não é possível solicitar adesão ao plano gratuito."
        )

    pending_request = db.query(PlanChangeRequest).filter(
        PlanChangeRequest.user_id == current_user.id,
        PlanChangeRequest.status == "PENDING"
    ).first()

    if pending_request:
        raise HTTPException(
            status_code=400,
            detail="Já existe um pedido de adesão pendente."
        )

    now = datetime.now(timezone.utc)

    current_subscription = (
        db.query(Subscription)
        .filter(
            Subscription.user_id == current_user.id,
            Subscription.status == "ACTIVE"
        )
        .order_by(Subscription.created_at.desc())
        .first()
    )

    if current_subscription:
        subscription_is_valid = (
            current_subscription.expires_at is None
            or current_subscription.expires_at > now
        )

        if (
            subscription_is_valid
            and current_subscription.plan_id == plan.id
        ):
            raise HTTPException(
                status_code=400,
                detail="Já possui uma assinatura ativa deste plano."
            )

    request = PlanChangeRequest(
        user_id=current_user.id,
        plan_id=plan.id,
        status="PENDING"
    )

    db.add(request)
    db.commit()
    db.refresh(request)

    return {
        "message": "Pedido de adesão enviado com sucesso. Aguarde a aprovação da administração.",
        "request": serialize_request(request, plan)
    }


# --------------------------------------------------
# ADMINISTRADOR: CONSULTAR TODOS OS PEDIDOS
# --------------------------------------------------

@router.get("/admin")
def get_all_plan_change_requests(
    current_admin=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    results = (
        db.query(PlanChangeRequest, Plan, User)
        .join(Plan, Plan.id == PlanChangeRequest.plan_id)
        .join(User, User.id == PlanChangeRequest.user_id)
        .order_by(PlanChangeRequest.requested_at.desc())
        .all()
    )

    return [
        serialize_request(request, plan, user)
        for request, plan, user in results
    ]


# --------------------------------------------------
# ADMINISTRADOR: APROVAR PEDIDO
# --------------------------------------------------

@router.post("/admin/{request_id}/approve")
def approve_plan_change_request(
    request_id: int,
    current_admin=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    request = (
        db.query(PlanChangeRequest)
        .filter(PlanChangeRequest.id == request_id)
        .with_for_update()
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Pedido não encontrado."
        )

    if request.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Este pedido já foi processado."
        )

    plan = db.query(Plan).filter(
        Plan.id == request.plan_id,
        Plan.is_active == True
    ).first()

    if not plan:
        raise HTTPException(
            status_code=400,
            detail="O plano solicitado já não está disponível."
        )

    now = datetime.now(timezone.utc)

    # Desativar as assinaturas anteriores.
    db.query(Subscription).filter(
        Subscription.user_id == request.user_id,
        Subscription.status == "ACTIVE"
    ).update(
        {"status": "EXPIRED"},
        synchronize_session=False
    )

    # Criar a nova assinatura por um mês.
    new_subscription = Subscription(
        user_id=request.user_id,
        plan_id=plan.id,
        status="ACTIVE",
        starts_at=now,
        expires_at=add_one_month(now)
    )

    db.add(new_subscription)

    request.status = "APPROVED"
    request.processed_at = now
    request.processed_by_admin_id = current_admin.id
    request.admin_notes = None

    db.commit()

    return {
        "message": "Pedido aprovado e assinatura ativada com sucesso.",
        "request_id": request.id,
        "plan_name": plan.name,
        "subscription_expires_at": new_subscription.expires_at
    }


# --------------------------------------------------
# ADMINISTRADOR: REJEITAR PEDIDO
# --------------------------------------------------

@router.post("/admin/{request_id}/reject")
def reject_plan_change_request(
    request_id: int,
    data: PlanChangeRequestReject,
    current_admin=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    request = (
        db.query(PlanChangeRequest)
        .filter(PlanChangeRequest.id == request_id)
        .with_for_update()
        .first()
    )

    if not request:
        raise HTTPException(
            status_code=404,
            detail="Pedido não encontrado."
        )

    if request.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Este pedido já foi processado."
        )

    request.status = "REJECTED"
    request.processed_at = datetime.now(timezone.utc)
    request.processed_by_admin_id = current_admin.id
    request.admin_notes = data.admin_notes

    db.commit()

    return {
        "message": "Pedido rejeitado com sucesso.",
        "request_id": request.id,
        "status": request.status
    }
