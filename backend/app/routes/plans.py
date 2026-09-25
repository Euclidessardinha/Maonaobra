from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.database.connection import get_db
from app.models.user import User
from app.models.plan import Plan


router = APIRouter(
    prefix="/admin/plans",
    tags=["Admin - Planos"]
)


@router.get("")
def get_admin_plans(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    plans = (
        db.query(Plan)
        .order_by(Plan.price.asc())
        .all()
    )

    return [
        {
            "id": plan.id,
            "name": plan.name,
            "price": float(plan.price),
            "period": plan.period,
            "description": plan.description,
            "badge": plan.badge,
            "is_active": plan.is_active,
            "created_at": plan.created_at,
            "updated_at": plan.updated_at,
        }
        for plan in plans
    ]


@router.post("/initialize")
def initialize_admin_plans(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    existing_plans = db.query(Plan).count()

    if existing_plans > 0:
        return {
            "message": "Os planos já foram inicializados.",
            "created": 0
        }

    plans = [
        Plan(
            name="Gratuito",
            price=0,
            period="mês",
            description="Recursos essenciais para começar.",
            badge="Plano base",
            is_active=True
        ),
        Plan(
            name="Profissional",
            price=499,
            period="mês",
            description="Mais visibilidade e estatísticas.",
            badge="Mais utilizado",
            is_active=True
        ),
        Plan(
            name="Premium",
            price=999,
            period="mês",
            description="Mais recursos para ganhar visibilidade.",
            badge="Mais recursos",
            is_active=True
        )
    ]

    db.add_all(plans)
    db.commit()

    return {
        "message": "Planos inicializados com sucesso.",
        "created": len(plans)
    }


@router.patch("/{plan_id}")
def update_admin_plan(
    plan_id: int,
    name: str | None = None,
    price: float | None = None,
    period: str | None = None,
    description: str | None = None,
    badge: str | None = None,
    is_active: bool | None = None,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):
    plan = (
        db.query(Plan)
        .filter(Plan.id == plan_id)
        .first()
    )

    if not plan:
        raise HTTPException(
            status_code=404,
            detail="Plano não encontrado."
        )

    if name is not None:
        name = name.strip()

        if not name:
            raise HTTPException(
                status_code=400,
                detail="O nome do plano não pode estar vazio."
            )

        existing_plan = (
            db.query(Plan)
            .filter(
                Plan.name == name,
                Plan.id != plan_id
            )
            .first()
        )

        if existing_plan:
            raise HTTPException(
                status_code=400,
                detail="Já existe outro plano com esse nome."
            )

        plan.name = name

    if price is not None:
        if price < 0:
            raise HTTPException(
                status_code=400,
                detail="O preço não pode ser negativo."
            )

        plan.price = price

    if period is not None:
        period = period.strip()

        if not period:
            raise HTTPException(
                status_code=400,
                detail="O período não pode estar vazio."
            )

        plan.period = period

    if description is not None:
        description = description.strip()

        if not description:
            raise HTTPException(
                status_code=400,
                detail="A descrição não pode estar vazia."
            )

        plan.description = description

    if badge is not None:
        plan.badge = badge.strip()

    if is_active is not None:
        plan.is_active = is_active

    db.commit()
    db.refresh(plan)

    return {
        "message": "Plano atualizado com sucesso.",
        "plan": {
            "id": plan.id,
            "name": plan.name,
            "price": float(plan.price),
            "period": plan.period,
            "description": plan.description,
            "badge": plan.badge,
            "is_active": plan.is_active,
            "created_at": plan.created_at,
            "updated_at": plan.updated_at,
        }
    }