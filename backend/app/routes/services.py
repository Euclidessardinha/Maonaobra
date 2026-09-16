from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_provider
from app.database.connection import get_db

from app.models.category import Category
from app.models.provider import ProviderProfile
from app.models.service import Service
from app.models.user import User

from app.schemas.services import ServiceCreate, ServiceUpdate

router = APIRouter(
prefix="/services",
tags=["Services"]
)

@router.post("/")
def create_service(
    service_data: ServiceCreate,
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
    ):
    provider = (
        db.query(ProviderProfile)
            .filter(ProviderProfile.user_id == current_user.id)
            .first()
    )


    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Perfil profissional não encontrado."
        )

    category = (
        db.query(Category)
            .filter(Category.id == service_data.category_id)
            .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Categoria não encontrada."
        )

    service = Service(
    provider_id=provider.id,
    category_id=service_data.category_id,
    title=service_data.title,
    description=service_data.description,
    price=service_data.price
    )

    db.add(service)
    db.commit()
    db.refresh(service)

    return {
        "message": "Serviço criado com sucesso!",
        "service": {
            "id": service.id,
            "title": service.title,
            "description": service.description,
            "price": service.price,
            "category_id": service.category_id,
            "provider_id": service.provider_id,
            "is_active": service.is_active
        }
    }


@router.patch("/{service_id}")
def update_service(
    service_id: int,
    service_data: ServiceUpdate,
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
    ):
    provider = (
        db.query(ProviderProfile)
            .filter(
                ProviderProfile.user_id == current_user.id
            )
            .first()
    )


    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Perfil profissional não encontrado."
        )

    service = (
        db.query(Service)
            .filter(
                Service.id == service_id,
                Service.provider_id == provider.id
            )
            .first()
    )

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Serviço não encontrado ou não pertence ao seu perfil."
        )

    category = (
        db.query(Category)
            .filter(Category.id == service_data.category_id)
            .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Categoria não encontrada."
        )

    service.category_id = service_data.category_id
    service.title = service_data.title
    service.description = service_data.description
    service.price = service_data.price

    db.commit()
    db.refresh(service)

    return {
        "message": "Serviço atualizado com sucesso!",
        "service": {
            "id": service.id,
            "title": service.title,
            "description": service.description,
            "price": service.price,
            "category_id": service.category_id,
            "provider_id": service.provider_id,
            "is_active": service.is_active,
            "category": {
                "id": category.id,
                "name": category.name
            },
            "provider": {
                "id": provider.id,
                "profession": provider.profession,
                "location": provider.location,
                "is_verified": provider.is_verified
            }
        }
    }


@router.patch("/{service_id}/status")
def toggle_service_status(
    service_id: int,
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
    ):
    provider = (
        db.query(ProviderProfile)
            .filter(
                ProviderProfile.user_id == current_user.id
            )
            .first()
    )


    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Perfil profissional não encontrado."
        )

    service = (
        db.query(Service)
            .filter(
                Service.id == service_id,
                Service.provider_id == provider.id
            )
            .first()
    )

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Serviço não encontrado ou não pertence ao seu perfil."
        )

    service.is_active = not service.is_active

    db.commit()
    db.refresh(service)

    return {
        "message": (
            "Serviço ativado com sucesso!"
            if service.is_active
            else "Serviço desativado com sucesso!"
        ),
        "service": {
            "id": service.id,
            "title": service.title,
            "description": service.description,
            "price": service.price,
            "category_id": service.category_id,
            "provider_id": service.provider_id,
            "is_active": service.is_active,
            "category": {
                "id": service.category.id,
                "name": service.category.name
            },
            "provider": {
                "id": provider.id,
                "profession": provider.profession,
                "location": provider.location,
                "is_verified": provider.is_verified
            }
        }
    }


}



@router.get("/my")
def list_my_services(
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
    ):
    provider = (
    db.query(ProviderProfile)
        .filter(
            ProviderProfile.user_id == current_user.id
        )
        .first()
    )


    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Perfil profissional não encontrado."
        )

    services = (
        db.query(Service)
            .join(Category)
            .filter(
                Service.provider_id == provider.id
            )
            .order_by(Service.id.desc())
            .all()
        )

    return [
        {
            "id": service.id,
            "title": service.title,
            "description": service.description,
            "price": service.price,
            "is_active": service.is_active,
            "category": {
                "id": service.category.id,
                "name": service.category.name
            },
            "provider": {
                "id": provider.id,
                "profession": provider.profession,
                "location": provider.location,
                "is_verified": provider.is_verified
            }
        }
        for service in services
    ]


@router.get("/")
def list_services(
    search: str | None = None,
    category_id: int | None = None,
    location: str | None = None,
    db: Session = Depends(get_db)
    ):
    query = (
    db.query(Service)
        .join(ProviderProfile)
        .join(Category)
        .filter(Service.is_active.is_(True))
    )


    if search:
        search_term = f"%{search.strip()}%"

        query = query.filter(
            Service.title.ilike(search_term)
            | Service.description.ilike(search_term)
            | ProviderProfile.profession.ilike(search_term)
            | Category.name.ilike(search_term)
        )

    if category_id is not None:
        category = (
            db.query(Category)
                .filter(Category.id == category_id)
                .first()
        )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Categoria não encontrada."
        )

    query = query.filter(
        Service.category_id == category_id
    )

    if location:
        query = query.filter(
            ProviderProfile.location.ilike(
                f"%{location.strip()}%"
            )
        )

    services = query.all()

    return [
        {
            "id": service.id,
            "title": service.title,
            "description": service.description,
            "price": service.price,
            "category": {
                "id": service.category.id,
                "name": service.category.name
            },
            "provider": {
                "id": service.provider.id,
                "profession": service.provider.profession,
                "location": service.provider.location,
                "is_verified": service.provider.is_verified
            }
        }
        for service in services
    ]

