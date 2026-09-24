from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.database.connection import get_db

from app.models.user import User
from app.models.provider import ProviderProfile
from app.models.project import Project
from app.models.service import Service
from app.models.service_promotion import ServicePromotion
from app.models.review import Review
from app.models.category import Category

router = APIRouter(
    prefix="/admin",
    tags=["Administração"]
)


# =========================================================
# ESTATÍSTICAS GERAIS
# =========================================================

@router.get("/stats")
def get_admin_stats(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):

    total_users = db.query(User).count()

    total_clients = (
        db.query(User)
        .filter(User.role == "CLIENT")
        .count()
    )

    total_providers = (
        db.query(ProviderProfile)
        .count()
    )

    total_projects = (
        db.query(Project)
        .count()
    )

    total_services = (
        db.query(Service)
        .count()
    )

    total_reviews = (
        db.query(Review)
        .count()
    )

    active_users = (
        db.query(User)
        .filter(User.is_active == True)
        .count()
    )

    inactive_users = (
        db.query(User)
        .filter(User.is_active == False)
        .count()
    )

    return {
        "total_users": total_users,
        "total_clients": total_clients,
        "total_providers": total_providers,
        "total_projects": total_projects,
        "total_services": total_services,
        "total_reviews": total_reviews,
        "active_users": active_users,
        "inactive_users": inactive_users
    }


# =========================================================
# LISTAR USUÁRIOS
# =========================================================

@router.get("/users")
def get_admin_users(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):

    users = (
        db.query(User)
        .order_by(User.created_at.desc())
        .all()
    )

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at
        }
        for user in users
    ]


# =========================================================
# ATIVAR / DESATIVAR USUÁRIO
# =========================================================

@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado."
        )

    if user.id == current_user.id:

        raise HTTPException(
            status_code=400,
            detail="Você não pode desativar a sua própria conta."
        )

    user.is_active = not user.is_active

    db.commit()
    db.refresh(user)

    return {
        "message": (
            "Usuário ativado com sucesso."
            if user.is_active
            else "Usuário desativado com sucesso."
        ),
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active
        }
    }


# =========================================================
# LISTAR PRESTADORES
# =========================================================

@router.get("/providers")
def get_admin_providers(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):

    providers = (
        db.query(ProviderProfile, User)
        .join(
            User,
            ProviderProfile.user_id == User.id
        )
        .order_by(
            ProviderProfile.created_at.desc()
        )
        .all()
    )

    return [
        {
            "provider_id": provider.id,
            "user_id": user.id,

            "name": user.name,
            "email": user.email,
            "phone": user.phone,

            "profession": provider.profession,
            "bio": provider.bio,
            "location": provider.location,
            "experience_years": provider.experience_years,
            "hourly_rate": provider.hourly_rate,

            "is_verified": provider.is_verified,
            "is_active": user.is_active,

            "created_at": provider.created_at
        }
        for provider, user in providers
    ]


# =========================================================
# VERIFICAR / REMOVER VERIFICAÇÃO DO PRESTADOR
# =========================================================

@router.patch("/providers/{provider_id}/verification")
def update_provider_verification(
    provider_id: int,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):

    provider = (
        db.query(ProviderProfile)
        .filter(
            ProviderProfile.id == provider_id
        )
        .first()
    )

    if provider is None:

        raise HTTPException(
            status_code=404,
            detail="Prestador não encontrado."
        )

    provider.is_verified = not provider.is_verified

    db.commit()
    db.refresh(provider)

    return {
        "message": (
            "Prestador verificado com sucesso."
            if provider.is_verified
            else "Verificação do prestador removida."
        ),
        "provider": {
            "provider_id": provider.id,
            "is_verified": provider.is_verified
        }
    }


# =========================================================
# LISTAR PROJETOS
# =========================================================

@router.get("/projects")
def get_admin_projects(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):

    projects = (
        db.query(Project, User)
        .join(
            User,
            Project.client_id == User.id
        )
        .order_by(
            Project.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": project.id,

            "title": project.title,
            "description": project.description,

            "category_id": project.category_id,
            "category": project.category,

            "location": project.location,
            "budget": project.budget,
            "status": project.status,

            "client_id": user.id,
            "client_name": user.name,
            "client_email": user.email,

            "created_at": project.created_at
        }
        for project, user in projects
    ]


# =========================================================
# LISTAR SERVIÇOS
# =========================================================

@router.get("/services")
def get_admin_services(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):

    services = (
        db.query(
            Service,
            ProviderProfile,
            User,
            Category
        )
        .join(
            ProviderProfile,
            Service.provider_id == ProviderProfile.id
        )
        .join(
            User,
            ProviderProfile.user_id == User.id
        )
        .join(
            Category,
            Service.category_id == Category.id
        )
        .order_by(
            Service.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": service.id,

            "title": service.title,
            "description": service.description,
            "price": service.price,
            "is_active": service.is_active,

            "category_id": category.id,
            "category_name": category.name,

            "provider_id": provider.id,
            "provider_name": user.name,
            "provider_email": user.email,

            "created_at": service.created_at
        }
        for service, provider, user, category in services
    ]


# =========================================================
# LISTAR AVALIAÇÕES
# =========================================================

@router.get("/reviews")
def get_admin_reviews(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):

    reviews = (
        db.query(
            Review,
            User,
            ProviderProfile
        )
        .join(
            User,
            Review.client_id == User.id
        )
        .join(
            ProviderProfile,
            Review.provider_id == ProviderProfile.id
        )
        .order_by(
            Review.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": review.id,

            "rating": review.rating,
            "comment": review.comment,

            "project_id": review.project_id,
            "service_request_id": review.service_request_id,

            "client_id": client.id,
            "client_name": client.name,
            "client_email": client.email,

            "provider_id": provider.id,
            "provider_user_id": provider.user_id,

            "created_at": review.created_at
        }
        for review, client, provider in reviews
    ]

# =========================================================
# PROMOÇÕES DE SERVIÇOS
# =========================================================

@router.get("/service-promotions")
def get_admin_service_promotions(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):

    promotions = (
        db.query(
            ServicePromotion,
            Service,
            ProviderProfile,
            User
        )
        .join(
            Service,
            ServicePromotion.service_id == Service.id
        )
        .join(
            ProviderProfile,
            Service.provider_id == ProviderProfile.id
        )
        .join(
            User,
            ProviderProfile.user_id == User.id
        )
        .order_by(
            ServicePromotion.created_at.desc()
        )
        .all()
    )

    now = datetime.now(timezone.utc)

    result = []

    for promotion, service, provider, user in promotions:

        # Atualizar automaticamente promoções expiradas
        if (
            promotion.status == "ACTIVE"
            and promotion.expires_at <= now
        ):
            promotion.status = "EXPIRED"

        result.append({
            "id": promotion.id,

            "service_id": service.id,
            "service_title": service.title,

            "provider_id": provider.id,
            "provider_user_id": user.id,
            "provider_name": user.name,
            "provider_email": user.email,

            "price": promotion.price,
            "duration_days": promotion.duration_days,

            "starts_at": promotion.starts_at,
            "expires_at": promotion.expires_at,

            "status": promotion.status,

            "created_at": promotion.created_at
        })

    db.commit()

    return result


# =========================================================
# ESTATÍSTICAS DE PROMOÇÕES
# =========================================================

@router.get("/service-promotions/stats")
def get_admin_service_promotion_stats(
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):

    promotions = (
        db.query(ServicePromotion)
        .all()
    )

    now = datetime.now(timezone.utc)

    # Atualizar expiradas
    for promotion in promotions:

        if (
            promotion.status == "ACTIVE"
            and promotion.expires_at <= now
        ):
            promotion.status = "EXPIRED"

    db.commit()

    total = len(promotions)

    pending = sum(
        1
        for promotion in promotions
        if promotion.status == "PENDING"
    )

    active = sum(
        1
        for promotion in promotions
        if promotion.status == "ACTIVE"
    )

    expired = sum(
        1
        for promotion in promotions
        if promotion.status == "EXPIRED"
    )

    cancelled = sum(
        1
        for promotion in promotions
        if promotion.status == "CANCELLED"
    )

    rejected = sum(
        1
        for promotion in promotions
        if promotion.status == "REJECTED"
    )

    # Receita apenas das promoções aprovadas/ativas/expiradas
    revenue = sum(
        promotion.price
        for promotion in promotions
        if promotion.status in [
            "ACTIVE",
            "EXPIRED"
        ]
    )

    return {
        "total": total,
        "pending": pending,
        "active": active,
        "expired": expired,
        "cancelled": cancelled,
        "rejected": rejected,
        "revenue": revenue
    }


# =========================================================
# ATUALIZAR STATUS DA PROMOÇÃO
# =========================================================

@router.patch("/service-promotions/{promotion_id}/status")
def update_service_promotion_status(
    promotion_id: int,
    status: str,
    current_user: User = Depends(require_role("ADMIN")),
    db: Session = Depends(get_db)
):

    allowed_statuses = [
        "ACTIVE",
        "REJECTED"
    ]

    status = status.upper()

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Status inválido. "
                "Use ACTIVE ou REJECTED."
            )
        )

    promotion = (
        db.query(ServicePromotion)
        .filter(
            ServicePromotion.id == promotion_id
        )
        .first()
    )

    if not promotion:
        raise HTTPException(
            status_code=404,
            detail="Promoção não encontrada."
        )

    if promotion.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail=(
                "Apenas promoções pendentes "
                "podem ser aprovadas ou rejeitadas."
            )
        )

    # -----------------------------------------------------
    # Aprovar
    # -----------------------------------------------------

    if status == "ACTIVE":

        now = datetime.now(timezone.utc)

        promotion.starts_at = now

        promotion.expires_at = (
            now
            + timedelta(
                days=promotion.duration_days
            )
        )

        promotion.status = "ACTIVE"

    # -----------------------------------------------------
    # Rejeitar
    # -----------------------------------------------------

    elif status == "REJECTED":

        promotion.status = "REJECTED"

    db.commit()
    db.refresh(promotion)

    return {
        "message": (
            "Promoção ativada com sucesso."
            if status == "ACTIVE"
            else "Promoção rejeitada com sucesso."
        ),
        "promotion": {
            "id": promotion.id,
            "service_id": promotion.service_id,
            "price": promotion.price,
            "duration_days": promotion.duration_days,
            "starts_at": promotion.starts_at,
            "expires_at": promotion.expires_at,
            "status": promotion.status,
            "created_at": promotion.created_at
        }
    }
