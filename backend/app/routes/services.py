
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    File,
    UploadFile
)
from sqlalchemy.orm import Session

from app.core.dependencies import require_provider
from app.core.storage import (
    upload_service_image,
    delete_service_image
)
from app.database.connection import get_db

from datetime import datetime, timezone

from app.models.category import Category
from app.models.provider import ProviderProfile
from app.models.service import Service
from app.models.user import User
from app.models.service_promotion import ServicePromotion

from sqlalchemy import and_, case

from app.schemas.services import ServiceCreate, ServiceUpdate


router = APIRouter(
    prefix="/services",
    tags=["Services"]
)


MAX_IMAGE_SIZE = 5 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp"
}


def detect_image_type(file_bytes: bytes):
    """
    Verifica o formato real da imagem através da sua assinatura.
    Não confia apenas no nome ou no Content-Type enviado pelo cliente.
    """

    if file_bytes.startswith(b"\xff\xd8\xff"):
        return "jpeg"

    if file_bytes.startswith(
        b"\x89PNG\r\n\x1a\n"
    ):
        return "png"

    if (
        len(file_bytes) >= 12
        and file_bytes[:4] == b"RIFF"
        and file_bytes[8:12] == b"WEBP"
    ):
        return "webp"

    return None


@router.post("/")
def create_service(
    service_data: ServiceCreate,
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

    category = (
        db.query(Category)
        .filter(
            Category.id == service_data.category_id
        )
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
    #db.refresh(service)

    return {
        "message": "Serviço criado com sucesso!",
        "service": {
            "id": service.id,
            "title": service.title,
            "description": service.description,
            "price": service.price,
            "image_url": service.image_url,
            "category_id": service.category_id,
            "provider_id": service.provider_id,
            "is_active": service.is_active
        }
    }


# =========================================================
# CARREGAR OU SUBSTITUIR FOTOGRAFIA DO SERVIÇO
# =========================================================

@router.post("/{service_id}/image")
def upload_service_image_endpoint(
    service_id: int,
    file: UploadFile = File(...),
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
            detail=(
                "Serviço não encontrado ou não pertence ao seu perfil."
            )
        )

    file_bytes = file.file.read(MAX_IMAGE_SIZE + 1)

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="O ficheiro enviado está vazio."
        )

    if len(file_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="A imagem não pode ultrapassar 5 MB."
        )

    extension = detect_image_type(file_bytes)

    if not extension:
        raise HTTPException(
            status_code=400,
            detail="Formato inválido. Envie JPEG, PNG ou WebP."
        )

    content_type = ALLOWED_IMAGE_TYPES[extension]

    old_image_url = service.image_url

    try:
        new_image_url = upload_service_image(
            service_id=service.id,
            file_bytes=file_bytes,
            content_type=content_type,
            extension=extension
        )

    except RuntimeError:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível guardar a imagem. Tente novamente."
        )

    try:
        service.image_url = new_image_url

        db.commit()
        #db.refresh(service)

    except Exception:
        db.rollback()

        # Se a base de dados falhar, tentamos remover
        # a nova imagem para evitar ficheiros abandonados.
        delete_service_image(new_image_url)

        raise HTTPException(
            status_code=500,
            detail="Não foi possível actualizar a fotografia do serviço."
        )

    # Só eliminamos a imagem antiga depois de a nova
    # estar guardada e associada ao serviço.
    if old_image_url and old_image_url != new_image_url:
        delete_service_image(old_image_url)

    return {
        "message": "Fotografia do serviço actualizada com sucesso!",
        "service_id": service.id,
        "image_url": service.image_url
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
        .filter(
            Category.id == service_data.category_id
        )
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
    #db.refresh(service)

    return {
        "message": "Serviço actualizado com sucesso!",
        "service": {
            "id": service.id,
            "title": service.title,
            "description": service.description,
            "price": service.price,
            "image_url": service.image_url,
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


@router.delete("/{service_id}")
def delete_service(
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

    service_title = service.title
    old_image_url = service.image_url

    db.delete(service)
    db.commit()

    if old_image_url:
        delete_service_image(old_image_url)

    return {
        "message": "Serviço excluído com sucesso!",
        "service_id": service_id,
        "title": service_title
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
    #db.refresh(service)

    return {
        "message": (
            "Serviço activado com sucesso!"
            if service.is_active
            else "Serviço desactivado com sucesso!"
        ),
        "service": {
            "id": service.id,
            "title": service.title,
            "description": service.description,
            "price": service.price,
            "image_url": service.image_url,
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
            "image_url": service.image_url,
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
    now = datetime.now(timezone.utc)

    query = (
        db.query(Service, ServicePromotion)
        .join(ProviderProfile)
        .join(Category)
        .outerjoin(
            ServicePromotion,
            and_(
                ServicePromotion.service_id == Service.id,
                ServicePromotion.status == "ACTIVE",
                ServicePromotion.starts_at.isnot(None),
                ServicePromotion.starts_at <= now,
                ServicePromotion.expires_at.isnot(None),
                ServicePromotion.expires_at > now
            )
        )
        .filter(
            Service.is_active.is_(True)
        )
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

    results = (
        query
        .order_by(
            case(
                (ServicePromotion.id.isnot(None), 0),
                else_=1
            ),
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
            "image_url": service.image_url,

            "is_promoted": promotion is not None,

            "promotion": (
                {
                    "id": promotion.id,
                    "starts_at": promotion.starts_at,
                    "expires_at": promotion.expires_at
                }
                if promotion else None
            ),

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
        for service, promotion in results
    ]
