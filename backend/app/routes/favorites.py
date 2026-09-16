from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db

from app.models.favorite import Favorite
from app.models.provider import ProviderProfile
from app.models.user import User

router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"]
)

@router.post("/{provider_id}")
def add_favorite(
    provider_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    provider = (
        db.query(ProviderProfile)
        .filter(ProviderProfile.id == provider_id)
        .first()
    )


    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Prestador não encontrado."
        )

    if provider.user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Você não pode favoritar o seu próprio perfil."
        )

    existing_favorite = (
        db.query(Favorite)
        .filter(
            Favorite.client_id == current_user.id,
            Favorite.provider_id == provider_id
        )
        .first()
    )

    if existing_favorite:
        raise HTTPException(
            status_code=400,
            detail="Este prestador já está nos seus favoritos."
        )

    favorite = Favorite(
        client_id=current_user.id,
        provider_id=provider_id
    )

    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return {
        "message": "Prestador adicionado aos favoritos!",
        "favorite": {
            "id": favorite.id,
            "provider_id": favorite.provider_id
        }
    }


@router.delete("/{provider_id}")
def remove_favorite(
    provider_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favorite = (
    db.query(Favorite)
    .filter(
    Favorite.client_id == current_user.id,
    Favorite.provider_id == provider_id
    )
    .first()
    )


    if not favorite:
        raise HTTPException(
            status_code=404,
            detail="Prestador não está nos seus favoritos."
        )

    db.delete(favorite)
    db.commit()

    return {
        "message": "Prestador removido dos favoritos."
    }


@router.get("/my")
def get_my_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    favorites = (
    db.query(Favorite)
    .filter(Favorite.client_id == current_user.id)
    .order_by(Favorite.created_at.desc())
    .all()
    )


    result = []

    for favorite in favorites:
        provider = favorite.provider

        if not provider:
            continue

        user = provider.user

        result.append({
            "id": favorite.id,
            "provider": {
                "id": provider.id,
                "name": user.name if user else "Prestador",
                "profession": provider.profession,
                "location": provider.location,
                "experience_years": provider.experience_years,
                "hourly_rate": provider.hourly_rate,
                "is_verified": provider.is_verified
            },
            "created_at": favorite.created_at
        })

    return result

