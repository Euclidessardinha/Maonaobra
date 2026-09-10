from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_provider
from app.database.connection import get_db

from app.models.provider import ProviderProfile
from app.models.service import Service
from app.models.service_request import ServiceRequest
from app.models.user import User
from app.models.review import Review

from app.schemas.service_request import (
    ServiceRequestCreate,
    ServiceRequestStatusUpdate
)


router = APIRouter(
    prefix="/requests",
    tags=["Service Requests"]
)


# ============================================================
# CLIENTE - CRIAR PEDIDO
# ============================================================

@router.post("/")
def create_service_request(
    request_data: ServiceRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Procurar o serviço
    service = (
        db.query(Service)
        .filter(
            Service.id == request_data.service_id,
            Service.is_active.is_(True)
        )
        .first()
    )

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Serviço não encontrado."
        )

    # Impedir que o dono do serviço solicite o próprio serviço
    if service.provider.user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Você não pode solicitar o seu próprio serviço."
        )

    # Criar pedido
    service_request = ServiceRequest(
        client_id=current_user.id,
        provider_id=service.provider_id,
        service_id=service.id,
        description=request_data.description,
        location=request_data.location,
        requested_date=request_data.requested_date,
        agreed_price=service.price,
        status="PENDING"
    )

    db.add(service_request)
    db.commit()
    db.refresh(service_request)

    return {
        "message": "Solicitação enviada com sucesso!",
        "request": {
            "id": service_request.id,
            "service_id": service_request.service_id,
            "provider_id": service_request.provider_id,
            "agreed_price": service_request.agreed_price,
            "status": service_request.status,
            "location": service_request.location,
            "requested_date": service_request.requested_date
        }
    }


# ============================================================
# CLIENTE - VER OS PRÓPRIOS PEDIDOS
# ============================================================

@router.get("/my")
def get_my_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    requests = (
        db.query(ServiceRequest)
        .filter(
            ServiceRequest.client_id == current_user.id
        )
        .order_by(
            ServiceRequest.created_at.desc()
        )
        .all()
    )

    result = []

    for request in requests:

        existing_review = (
            db.query(Review)
            .filter(
                Review.service_request_id == request.id
            )
            .first()
        )

        result.append({
            "id": request.id,

            "service": {
                "id": request.service.id,
                "title": request.service.title,
                "price": request.service.price
            },

            "provider": {
                "id": request.provider.id,
                "profession": request.provider.profession,
                "location": request.provider.location,
                "is_verified": request.provider.is_verified
            },

            "description": request.description,
            "location": request.location,
            "requested_date": request.requested_date,
            "agreed_price": request.agreed_price,
            "status": request.status,
            "created_at": request.created_at,

            "reviewed": existing_review is not None
        })

    return result


# ============================================================
# PRESTADOR - VER PEDIDOS RECEBIDOS
# ============================================================

@router.get("/provider")
def get_provider_requests(
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):

    # Buscar perfil profissional
    provider = (
        db.query(ProviderProfile)
        .filter(
            ProviderProfile.user_id == current_user.id
        )
        .first()
    )

    # Em teoria require_provider já garante isso.
    # Esta verificação serve como proteção adicional.
    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Perfil profissional não encontrado."
        )

    requests = (
        db.query(ServiceRequest)
        .filter(
            ServiceRequest.provider_id == provider.id
        )
        .order_by(
            ServiceRequest.created_at.desc()
        )
        .all()
    )

    return [
        {
            "id": request.id,

            "service": {
                "id": request.service.id,
                "title": request.service.title,
                "price": request.service.price
            },

            "client": {
                "id": request.client.id,
                "name": request.client.name,
                "phone": request.client.phone
            },

            "description": request.description,
            "location": request.location,
            "requested_date": request.requested_date,
            "agreed_price": request.agreed_price,
            "status": request.status,
            "created_at": request.created_at
        }
        for request in requests
    ]


# ============================================================
# PRESTADOR - ATUALIZAR STATUS
# ============================================================

@router.patch("/{request_id}/status")
def update_request_status(
    request_id: int,
    status_data: ServiceRequestStatusUpdate,
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):

    # Buscar perfil profissional
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

    # Procurar pedido pertencente ao prestador
    service_request = (
        db.query(ServiceRequest)
        .filter(
            ServiceRequest.id == request_id,
            ServiceRequest.provider_id == provider.id
        )
        .first()
    )

    if not service_request:
        raise HTTPException(
            status_code=404,
            detail="Pedido não encontrado."
        )

    current_status = service_request.status
    new_status = status_data.status.upper()

    # ========================================================
    # FLUXO DE ESTADOS
    # ========================================================

    allowed_transitions = {
        "PENDING": ["ACCEPTED", "REJECTED"],
        "ACCEPTED": ["IN_PROGRESS"],
        "IN_PROGRESS": ["COMPLETED"]
    }

    if current_status not in allowed_transitions:
        raise HTTPException(
            status_code=400,
            detail=(
                f"O pedido não pode ser alterado "
                f"a partir do estado {current_status}."
            )
        )

    if new_status not in allowed_transitions[current_status]:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Transição inválida: "
                f"{current_status} → {new_status}."
            )
        )

    # Atualizar status
    service_request.status = new_status

    db.commit()
    db.refresh(service_request)

    return {
        "message": "Estado do pedido atualizado com sucesso!",
        "request": {
            "id": service_request.id,
            "status": service_request.status
        }
    }