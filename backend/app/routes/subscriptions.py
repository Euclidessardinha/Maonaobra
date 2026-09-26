from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.database.connection import get_db
from app.models.subscription import Subscription
from app.models.plan import Plan
from app.models.user import User


router = APIRouter(
    prefix="/admin/subscriptions",
    tags=["Admin - Assinaturas"]
)


@router.get("")
def get_admin_subscriptions(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    subscriptions = (
        db.query(
            Subscription,
            User,
            Plan
        )
        .join(User, Subscription.user_id == User.id)
        .join(Plan, Subscription.plan_id == Plan.id)
        .order_by(Subscription.created_at.desc())
        .all()
    )

    now = datetime.now(timezone.utc)

    result = []

    for subscription, user, plan in subscriptions:

        if (
            subscription.status == "ACTIVE"
            and subscription.expires_at is not None
            and subscription.expires_at <= now
        ):
            subscription.status = "EXPIRED"

        result.append({
            "id": subscription.id,
            "user_id": user.id,
            "user_name": user.name,
            "user_email": user.email,
            "plan_id": plan.id,
            "plan_name": plan.name,
            "plan_price": float(plan.price),
            "status": subscription.status,
            "starts_at": subscription.starts_at,
            "expires_at": subscription.expires_at,
            "created_at": subscription.created_at
        })

    db.commit()

    return result


@router.post("/initialize-free")
def initialize_free_subscriptions(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    # Procurar o plano Gratuito
    free_plan = (
        db.query(Plan)
        .filter(
            Plan.name == "Gratuito",
            Plan.is_active == True
        )
        .first()
    )

    if not free_plan:
        raise HTTPException(
            status_code=404,
            detail="O plano Gratuito não está configurado."
        )

    # Buscar todos os utilizadores
    users = db.query(User).all()

    created = 0

    for user in users:

        # Verificar se o utilizador já possui alguma assinatura
        existing_subscription = (
            db.query(Subscription)
            .filter(
                Subscription.user_id == user.id
            )
            .first()
        )

        # Se já possui, não fazer nada
        if existing_subscription:
            continue

        subscription = Subscription(
            user_id=user.id,
            plan_id=free_plan.id,
            status="ACTIVE"
        )

        db.add(subscription)
        created += 1

    db.commit()

    return {
        "message": "Assinaturas gratuitas inicializadas com sucesso.",
        "created": created
    }


# =========================================================
# ESTATÍSTICAS DE ASSINATURAS
# =========================================================

@router.get("/stats")
def get_subscription_stats(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    now = datetime.now(timezone.utc)

    # Buscar todos os planos ativos
    plans = (
        db.query(Plan)
        .filter(Plan.is_active == True)
        .order_by(Plan.id.asc())
        .all()
    )

    plan_stats = []

    total = 0

    for plan in plans:

        count = (
            db.query(Subscription)
            .filter(
                Subscription.plan_id == plan.id,
                Subscription.status == "ACTIVE",
                (
                    (Subscription.expires_at.is_(None))
                    | (Subscription.expires_at > now)
                )
            )
            .count()
        )

        total += count

        plan_stats.append({
            "plan_id": plan.id,
            "plan_name": plan.name,
            "count": count
        })

    # Calcular percentagens
    for item in plan_stats:
        if total > 0:
            item["percentage"] = round(
                (item["count"] / total) * 100,
                1
            )
        else:
            item["percentage"] = 0

    return {
        "total": total,
        "plans": plan_stats
    }