
from datetime import date, datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File
)
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.dependencies import require_provider, get_current_user
from app.core.storage import (
    upload_portfolio_image,
    delete_portfolio_image
)
from app.database.connection import get_db

from app.models.user import User
from app.models.provider import ProviderProfile
from app.models.portfolio_item import PortfolioItem
from app.models.plan import Plan
from app.models.subscription import Subscription


router = APIRouter(
    prefix="/portfolio",
    tags=["Portfólio"]
)

MAX_IMAGE_SIZE = 5 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp"
}


def detect_image_type(file_bytes: bytes):
    if file_bytes.startswith(b"\xff\xd8\xff"):
        return "jpeg"

    if file_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"

    if (
        len(file_bytes) >= 12
        and file_bytes[:4] == b"RIFF"
        and file_bytes[8:12] == b"WEBP"
    ):
        return "webp"

    return None



def get_portfolio_limit(user_id: int, db: Session) -> int:
    subscription_data = (
        db.query(Subscription, Plan)
        .join(
            Plan,
            Subscription.plan_id == Plan.id
        )
        .filter(
            Subscription.user_id == user_id,
            Subscription.status == "ACTIVE"
        )
        .order_by(Subscription.starts_at.desc())
        .first()
    )

    now = datetime.now(timezone.utc)

    if subscription_data:
        subscription, plan = subscription_data
        expires_at = subscription.expires_at

        if expires_at is None:
            return plan.portfolio_limit

        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at > now:
            return plan.portfolio_limit

    free_plan = (
        db.query(Plan)
        .filter(Plan.name.ilike("Gratuito"))
        .first()
    )

    return free_plan.portfolio_limit if free_plan else 0



def serialize_item(item: PortfolioItem):
    return {
        "id": item.id,
        "provider_id": item.provider_id,
        "title": item.title,
        "description": item.description,
        "category": item.category,
        "location": item.location,
        "completed_at": item.completed_at,
        "image_url": item.image_url,
        "created_at": item.created_at
    }


class PortfolioCreate(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    description: str = Field(min_length=2)
    category: str = Field(min_length=2, max_length=100)
    location: str | None = None
    completed_at: date | None = None


class PortfolioUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = Field(default=None, min_length=2)
    category: str | None = Field(default=None, min_length=2, max_length=100)
    location: str | None = None
    completed_at: date | None = None


# =========================================================
# MEU PORTFÓLIO
# =========================================================

@router.get("/my")
def get_my_portfolio(
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

    items = (
        db.query(PortfolioItem)
        .filter(PortfolioItem.provider_id == provider.id)
        .order_by(PortfolioItem.created_at.desc())
        .all()
    )

    limit = get_portfolio_limit(current_user.id, db)

    return {
        "items": [serialize_item(item) for item in items],
        "total": len(items),
        "portfolio_limit": limit,
        "remaining": max(0, limit - len(items))
    }


# =========================================================
# PORTFÓLIO PÚBLICO
# =========================================================

@router.get("/provider/{provider_id}")
def get_provider_portfolio(
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
            detail="Profissional não encontrado."
        )

    items = (
        db.query(PortfolioItem)
        .filter(PortfolioItem.provider_id == provider_id)
        .order_by(PortfolioItem.created_at.desc())
        .all()
    )

    return [serialize_item(item) for item in items]


# =========================================================
# CRIAR TRABALHO
# =========================================================

@router.post("/")
def create_portfolio_item(
    data: PortfolioCreate,
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

    limit = get_portfolio_limit(current_user.id, db)

    total = (
        db.query(PortfolioItem)
        .filter(PortfolioItem.provider_id == provider.id)
        .count()
    )

    if total >= limit:
        raise HTTPException(
            status_code=403,
            detail=(
                f"O teu plano permite {limit} trabalhos no portfólio. "
                "Actualiza o teu plano para adicionar mais trabalhos."
            )
        )

    item = PortfolioItem(
        provider_id=provider.id,
        title=data.title.strip(),
        description=data.description.strip(),
        category=data.category.strip(),
        location=data.location.strip() if data.location else None,
        completed_at=data.completed_at
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return {
        "message": "Trabalho adicionado ao portfólio com sucesso!",
        "item": serialize_item(item)
    }


# =========================================================
# CARREGAR FOTOGRAFIA
# =========================================================

@router.post("/{item_id}/image")
def upload_portfolio_item_image(
    item_id: int,
    file: UploadFile = File(...),
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

    item = (
        db.query(PortfolioItem)
        .filter(
            PortfolioItem.id == item_id,
            PortfolioItem.provider_id == provider.id
        )
        .first()
    )

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Trabalho não encontrado ou não pertence ao teu perfil."
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

    old_image_url = item.image_url

    try:
        new_image_url = upload_portfolio_image(
            provider_id=provider.id,
            portfolio_id=item.id,
            file_bytes=file_bytes,
            content_type=ALLOWED_IMAGE_TYPES[extension],
            extension=extension
        )
    except RuntimeError:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível guardar a fotografia."
        )

    try:
        item.image_url = new_image_url
        db.commit()
        db.refresh(item)

    except Exception:
        db.rollback()
        delete_portfolio_image(new_image_url)

        raise HTTPException(
            status_code=500,
            detail="Não foi possível actualizar a fotografia."
        )

    if old_image_url and old_image_url != new_image_url:
        delete_portfolio_image(old_image_url)

    return {
        "message": "Fotografia do portfólio actualizada com sucesso!",
        "image_url": item.image_url
    }


# =========================================================
# ACTUALIZAR TRABALHO
# =========================================================

@router.patch("/{item_id}")
def update_portfolio_item(
    item_id: int,
    data: PortfolioUpdate,
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    provider = (
        db.query(ProviderProfile)
        .filter(ProviderProfile.user_id == current_user.id)
        .first()
    )

    item = (
        db.query(PortfolioItem)
        .filter(
            PortfolioItem.id == item_id,
            PortfolioItem.provider_id == provider.id
        )
        .first()
    ) if provider else None

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Trabalho não encontrado ou não pertence ao teu perfil."
        )

    changes = data.model_dump(exclude_unset=True)

    for field, value in changes.items():
        if isinstance(value, str):
            value = value.strip()

        setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return {
        "message": "Trabalho actualizado com sucesso!",
        "item": serialize_item(item)
    }


# =========================================================
# ELIMINAR TRABALHO
# =========================================================

@router.delete("/{item_id}")
def delete_portfolio_item(
    item_id: int,
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):
    provider = (
        db.query(ProviderProfile)
        .filter(ProviderProfile.user_id == current_user.id)
        .first()
    )

    item = (
        db.query(PortfolioItem)
        .filter(
            PortfolioItem.id == item_id,
            PortfolioItem.provider_id == provider.id
        )
        .first()
    ) if provider else None

    if not item:
        raise HTTPException(
            status_code=404,
            detail="Trabalho não encontrado ou não pertence ao teu perfil."
        )

    old_image_url = item.image_url

    db.delete(item)
    db.commit()

    if old_image_url:
        delete_portfolio_image(old_image_url)

    return {
        "message": "Trabalho eliminado com sucesso.",
        "item_id": item_id
    }
