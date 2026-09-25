from datetime import datetime, timezone

from fastapi import APIRouter, Depends
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