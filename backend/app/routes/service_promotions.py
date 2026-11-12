
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import require_provider
from app.database.connection import get_db

from app.models.provider import ProviderProfile
from app.models.service import Service
from app.models.service_promotion import ServicePromotion
from app.models.user import User
from app.models.promotion_event import PromotionEvent
from app.models.payment import Payment


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

    # Verificar se o serviço pertence ao prestador
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

    # O serviço precisa estar ativo
    if not service.is_active:
        raise HTTPException(
            status_code=400,
            detail="Não é possível promover um serviço desativado."
        )

    # Verificar se já existe promoção pendente ou ativa
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

    # Criar promoção sem iniciar a contagem dos dias
    promotion = ServicePromotion(
        service_id=service.id,
        price=PROMOTION_PRICE,
        duration_days=PROMOTION_DURATION_DAYS,
        starts_at=None,
        expires_at=None,
        status="PENDING"
    )

    try:
        db.add(promotion)
        db.commit()
        db.refresh(promotion)

    except Exception:
        db.rollback()
        raise

    return {
        "message": "Pedido de promoção criado com sucesso! Aguarda a confirmação do pagamento.",
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
    updated = False

    result = []

    for promotion in promotions:

        # Atualizar automaticamente promoções expiradas
        if (
            promotion.status == "ACTIVE"
            and promotion.expires_at is not None
            and promotion.expires_at <= now
        ):
            promotion.status = "EXPIRED"
            updated = True

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

    if updated:
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
        and promotion.expires_at is not None
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
        .with_for_update()
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

    try:
        now = datetime.now(timezone.utc)

        # Guardar o estado original antes do cancelamento
        original_status = promotion.status

        # Cancelar a promoção
        promotion.status = "CANCELLED"

        rejected_payments = 0

        # Rejeitar pagamentos apenas quando a promoção
        # estava PENDING antes de ser cancelada.
        if original_status == "PENDING":

            pending_payments = (
                db.query(Payment)
                .filter(
                    Payment.promotion_id == promotion.id,
                    Payment.payment_type == "PROMOTION",
                    Payment.status == "PENDING"
                )
                .with_for_update()
                .all()
            )

            for payment in pending_payments:

                payment.status = "REJECTED"
                payment.processed_at = now

                cancellation_note = (
                    "Pagamento rejeitado automaticamente porque "
                    "o prestador cancelou a promoção."
                )

                if payment.notes:
                    payment.notes += f"\n{cancellation_note}"
                else:
                    payment.notes = cancellation_note

                # Não foi uma ação administrativa.
                payment.processed_by_admin_id = None

                rejected_payments += 1

        db.commit()
        db.refresh(promotion)

        return {
            "message": "Promoção cancelada com sucesso.",
            "rejected_payments": rejected_payments,
            "promotion": {
                "id": promotion.id,
                "service_id": promotion.service_id,
                "service_title": promotion.service.title,
                "status": promotion.status
            }
        }

    except Exception:
        db.rollback()
        raise


# =========================================================
# REGISTRAR VISUALIZAÇÃO DE PROMOÇÃO
# =========================================================

@router.post("/{promotion_id}/view")
def register_promotion_view(
    promotion_id: int,
    db: Session = Depends(get_db)
):
    promotion = (
        db.query(ServicePromotion)
        .filter(ServicePromotion.id == promotion_id)
        .first()
    )

    if not promotion:
        raise HTTPException(
            status_code=404,
            detail="Promoção não encontrada."
        )

    now = datetime.now(timezone.utc)

    # Só registrar visualizações de promoções ativas
    if promotion.status != "ACTIVE":
        raise HTTPException(
            status_code=400,
            detail="Esta promoção não está ativa."
        )

    if (
        promotion.expires_at is None
        or promotion.expires_at <= now
    ):
        raise HTTPException(
            status_code=400,
            detail="Esta promoção já expirou."
        )

    event = PromotionEvent(
        promotion_id=promotion.id,
        event_type="VIEW"
    )

    db.add(event)
    db.commit()

    return {
        "message": "Visualização registrada."
    }
