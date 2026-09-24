from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import require_provider
from app.database.connection import get_db

from app.models.provider import ProviderProfile
from app.models.service import Service
from app.models.service_promotion import ServicePromotion
from app.models.user import User


router = APIRouter(
    prefix="/service-promotions",
    tags=["Service Promotions"]
)


# =========================================================
# CONFIGURAÇÃO INICIAL DA PROMOÇÃO
# =========================================================

PROMOTION_PRICE = 100.0
PROMOTION_DURATION_DAYS = 7


# =========================================================
# CRIAR PROMOÇÃO
# =========================================================

@router.post("/")
def create_service_promotion(
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

    # -----------------------------------------------------
    # Verificar se o serviço pertence ao prestador
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # O serviço precisa estar ativo
    # -----------------------------------------------------

    if not service.is_active:
        raise HTTPException(
            status_code=400,
            detail="Não é possível promover um serviço desativado."
        )

    # -----------------------------------------------------
    # Verificar se já existe promoção pendente ou ativa
    # -----------------------------------------------------

    existing_promotion = (
        db.query(ServicePromotion)
        .filter(
            ServicePromotion.service_id == service.id,
            ServicePromotion.status.in_(["PENDING", "ACTIVE"])
        )
        .first()
    )

    if existing_promotion:
        raise HTTPException(
            status_code=400,
            detail="Este serviço já possui uma promoção pendente ou ativa."
        )

    # -----------------------------------------------------
    # Datas da promoção
    # -----------------------------------------------------

    now = datetime.now(timezone.utc)

    expires_at = now + timedelta(
        days=PROMOTION_DURATION_DAYS
    )

    # -----------------------------------------------------
    # Criar promoção
    #
    # Por enquanto fica PENDING porque ainda não temos
    # integração de pagamento.
    # -----------------------------------------------------

    promotion = ServicePromotion(
        service_id=service.id,
        price=PROMOTION_PRICE,
        duration_days=PROMOTION_DURATION_DAYS,
        starts_at=now,
        expires_at=expires_at,
        status="PENDING"
    )

    db.add(promotion)
    db.commit()
    db.refresh(promotion)

    return {
        "message": "Pedido de promoção criado com sucesso!",
        "promotion": {
            "id": promotion.id,
            "service_id": promotion.service_id,
            "service_title": service.title,
            "price": promotion.price,
            "duration_days": promotion.duration_days,
            "starts_at": promotion.starts_at,
            "expires_at": promotion.expires_at,
            "status": promotion.status,
            "created_at": promotion.created_at
        }
    }


# =========================================================
# LISTAR MINHAS PROMOÇÕES
# =========================================================

@router.get("/my")
def list_my_promotions(
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

    promotions = (
        db.query(ServicePromotion)
        .join(Service)
        .filter(
            Service.provider_id == provider.id
        )
        .order_by(
            ServicePromotion.created_at.desc()
        )
        .all()
    )

    now = datetime.now(timezone.utc)

    result = []

    for promotion in promotions:

        # -------------------------------------------------
        # Atualizar automaticamente promoções expiradas
        # -------------------------------------------------

        if (
            promotion.status == "ACTIVE"
            and promotion.expires_at <= now
        ):
            promotion.status = "EXPIRED"

        result.append({
            "id": promotion.id,
            "service_id": promotion.service_id,
            "service_title": promotion.service.title,
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
# VER DETALHES DE UMA PROMOÇÃO
# =========================================================

@router.get("/{promotion_id}")
def get_service_promotion(
    promotion_id: int,
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

    promotion = (
        db.query(ServicePromotion)
        .join(Service)
        .filter(
            ServicePromotion.id == promotion_id,
            Service.provider_id == provider.id
        )
        .first()
    )

    if not promotion:
        raise HTTPException(
            status_code=404,
            detail="Promoção não encontrada."
        )

    now = datetime.now(timezone.utc)

    if (
        promotion.status == "ACTIVE"
        and promotion.expires_at <= now
    ):
        promotion.status = "EXPIRED"
        db.commit()
        db.refresh(promotion)

    return {
        "id": promotion.id,
        "service_id": promotion.service_id,
        "service_title": promotion.service.title,
        "price": promotion.price,
        "duration_days": promotion.duration_days,
        "starts_at": promotion.starts_at,
        "expires_at": promotion.expires_at,
        "status": promotion.status,
        "created_at": promotion.created_at
    }


# =========================================================
# CANCELAR PROMOÇÃO
# =========================================================

@router.post("/{promotion_id}/cancel")
def cancel_service_promotion(
    promotion_id: int,
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

    promotion = (
        db.query(ServicePromotion)
        .join(Service)
        .filter(
            ServicePromotion.id == promotion_id,
            Service.provider_id == provider.id
        )
        .first()
    )

    if not promotion:
        raise HTTPException(
            status_code=404,
            detail="Promoção não encontrada."
        )

    if promotion.status == "CANCELLED":
        raise HTTPException(
            status_code=400,
            detail="Esta promoção já foi cancelada."
        )

    if promotion.status == "EXPIRED":
        raise HTTPException(
            status_code=400,
            detail="Não é possível cancelar uma promoção expirada."
        )

    promotion.status = "CANCELLED"

    db.commit()
    db.refresh(promotion)

    return {
        "message": "Promoção cancelada com sucesso!",
        "promotion": {
            "id": promotion.id,
            "service_id": promotion.service_id,
            "service_title": promotion.service.title,
            "status": promotion.status
        }
    }