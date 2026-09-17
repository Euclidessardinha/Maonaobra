from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db

from app.models.provider import ProviderProfile
from app.models.user import User
from app.models.review import Review
from app.models.service import Service
from app.models.category import Category

from app.schemas.provider import (
    ProviderProfileCreate,
    ProviderProfileUpdate
)



router = APIRouter(
    prefix="/providers",
    tags=["Providers"]
)


# ============================================================
# CRIAR PERFIL PROFISSIONAL
# ============================================================

@router.post("/profile")
def create_provider_profile(
    profile_data: ProviderProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Verificar se o usuário já possui perfil profissional
    existing_profile = (
        db.query(ProviderProfile)
        .filter(
            ProviderProfile.user_id == current_user.id
        )
        .first()
    )

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Você já possui um perfil profissional."
        )

    # Criar perfil profissional
    profile = ProviderProfile(
        user_id=current_user.id,
        profession=profile_data.profession,
        bio=profile_data.bio,
        location=profile_data.location,
        experience_years=profile_data.experience_years,
        hourly_rate=profile_data.hourly_rate
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return {
        "message": "Perfil profissional criado com sucesso!",
        "profile": {
            "id": profile.id,
            "user_id": profile.user_id,
            "profession": profile.profession,
            "bio": profile.bio,
            "location": profile.location,
            "experience_years": profile.experience_years,
            "hourly_rate": profile.hourly_rate,
            "is_verified": profile.is_verified
        }
    }


# ============================================================
# MEU PERFIL PROFISSIONAL
# ============================================================

@router.get("/me")
def get_my_provider_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    profile = (
        db.query(ProviderProfile)
        .filter(
            ProviderProfile.user_id == current_user.id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Perfil profissional não encontrado."
        )

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "profession": profile.profession,
        "bio": profile.bio,
        "location": profile.location,
        "experience_years": profile.experience_years,
        "hourly_rate": profile.hourly_rate,
        "is_verified": profile.is_verified
    }


# ==========================================================
# ATUALIZAR MEU PERFIL PROFISSIONAL
# ============================================================

@router.patch("/me")
def update_my_provider_profile(
    profile_data: ProviderProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    profile = (
        db.query(ProviderProfile)
        .filter(
            ProviderProfile.user_id == current_user.id
        )
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Perfil profissional não encontrado."
        )

    # Atualizar apenas os dados profissionais
    profile.profession = profile_data.profession
    profile.bio = profile_data.bio
    profile.location = profile_data.location
    profile.experience_years = profile_data.experience_years
    profile.hourly_rate = profile_data.hourly_rate

    db.commit()
    db.refresh(profile)

    return {
        "message": "Perfil profissional atualizado com sucesso!",
        "profile": {
            "id": profile.id,
            "user_id": profile.user_id,
            "profession": profile.profession,
            "bio": profile.bio,
            "location": profile.location,
            "experience_years": profile.experience_years,
            "hourly_rate": profile.hourly_rate,
            "is_verified": profile.is_verified
        }
    }




# ============================================================
# LISTAR PROFISSIONAIS
# ============================================================

@router.get("")
def get_providers(
    search: str | None = None,
    category_id: int | None = None,
    location: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Buscar todos os perfis profissionais
    query = (
        db.query(ProviderProfile)
        .join(
            User,
            ProviderProfile.user_id == User.id
        )
    )

    # ========================================================
    # PESQUISA TEXTUAL
    # ========================================================

    if search:

        search_term = f"%{search.strip()}%"

        query = query.filter(
            User.name.ilike(search_term)
            | ProviderProfile.profession.ilike(search_term)
            | ProviderProfile.bio.ilike(search_term)
        )

    # ========================================================
    # FILTRO POR CATEGORIA
    # ========================================================

    if category_id is not None:

        category = (
            db.query(Category)
            .filter(
                Category.id == category_id
            )
            .first()
        )

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Categoria não encontrada."
            )

        query = (
            query
            .join(
                Service,
                Service.provider_id == ProviderProfile.id
            )
            .filter(
                Service.category_id == category_id,
                Service.is_active.is_(True)
            )
            .distinct()
        )

    # ========================================================
    # FILTRO POR LOCALIZAÇÃO
    # ========================================================

    if location:

        location_term = f"%{location.strip()}%"

        query = query.filter(
            ProviderProfile.location.ilike(
                location_term
            )
        )

    # ========================================================
    # BUSCAR PROFISSIONAIS
    # ========================================================

    providers = query.all()

    result = []

    for provider in providers:

        reviews = (
            db.query(Review)
            .filter(
                Review.provider_id == provider.id
            )
            .all()
        )

        total_reviews = len(reviews)

        if total_reviews > 0:

            average_rating = (
                sum(
                    review.rating
                    for review in reviews
                )
                / total_reviews
            )

        else:

            average_rating = 0

        result.append({
            "id": provider.id,
            "user_id": provider.user_id,
            "name": provider.user.name,
            "email": provider.user.email,
            "phone": provider.user.phone,
            "profession": provider.profession,
            "bio": provider.bio,
            "location": provider.location,
            "experience_years": provider.experience_years,
            "hourly_rate": provider.hourly_rate,
            "is_verified": provider.is_verified,
            "average_rating": round(
                average_rating,
                1
            ),
            "total_reviews": total_reviews
        })

    return result


# ============================================================
# BUSCAR PROFISSIONAL POR ID
# ============================================================

@router.get("/{provider_id}")
def get_provider_by_id(
    provider_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    provider = (
        db.query(ProviderProfile)
        .join(
            User,
            ProviderProfile.user_id == User.id
        )
        .filter(
            ProviderProfile.id == provider_id
        )
        .first()
    )

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Profissional não encontrado."
        )

    # ========================================================
    # BUSCAR AVALIAÇÕES
    # ========================================================

    reviews = (
        db.query(Review)
        .filter(
            Review.provider_id == provider.id
        )
        .all()
    )

    total_reviews = len(reviews)

    if total_reviews > 0:

        average_rating = (
            sum(
                review.rating
                for review in reviews
            )
            / total_reviews
        )

    else:

        average_rating = 0

    # ========================================================
    # RESPOSTA
    # ========================================================

    return {
        "id": provider.id,
        "user_id": provider.user_id,
        "name": provider.user.name,
        "email": provider.user.email,
        "phone": provider.user.phone,
        "profession": provider.profession,
        "bio": provider.bio,
        "location": provider.location,
        "experience_years": provider.experience_years,
        "hourly_rate": provider.hourly_rate,
        "is_verified": provider.is_verified,
        "average_rating": round(
            average_rating,
            1
        ),
        "total_reviews": total_reviews
    }