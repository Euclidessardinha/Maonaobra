from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db

from app.models.review import Review
from app.models.project import Project
from app.models.proposal import Proposal
from app.models.provider import ProviderProfile
from app.models.service_request import ServiceRequest
from app.models.user import User

from app.schemas.review import ReviewCreate


router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)


# ============================================================
# CLIENTE - CRIAR AVALIAÇÃO
# ============================================================

@router.post("/")
def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # ========================================================
    # 1. AVALIAÇÃO DE PROJETO
    # ========================================================

    if review_data.project_id is not None:

        project = (
            db.query(Project)
            .filter(
                Project.id == review_data.project_id
            )
            .first()
        )

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Projeto não encontrado."
            )

        # Apenas o dono do projeto pode avaliar
        if project.client_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Você não pode avaliar este projeto."
            )

        # Apenas projetos concluídos
        if project.status != "COMPLETED":
            raise HTTPException(
                status_code=400,
                detail="Só é possível avaliar projetos concluídos."
            )

        # Verificar se já foi avaliado
        existing_review = (
            db.query(Review)
            .filter(
                Review.project_id == project.id
            )
            .first()
        )

        if existing_review:
            raise HTTPException(
                status_code=400,
                detail="Este projeto já foi avaliado."
            )

        # Procurar proposta aceita
        accepted_proposal = (
            db.query(Proposal)
            .filter(
                Proposal.project_id == project.id,
                Proposal.status == "ACCEPTED"
            )
            .first()
        )

        if not accepted_proposal:
            raise HTTPException(
                status_code=400,
                detail="Este projeto não possui uma proposta aceita."
            )

        # ====================================================
        # IMPORTANTE:
        # Proposal.provider_id = ProviderProfile.id
        # ====================================================

        provider_profile = (
            db.query(ProviderProfile)
            .filter(
                ProviderProfile.id == accepted_proposal.provider_id
            )
            .first()
        )

        if not provider_profile:
            raise HTTPException(
                status_code=404,
                detail="Perfil do prestador não encontrado."
            )

        # Criar avaliação
        review = Review(
            project_id=project.id,
            service_request_id=None,
            client_id=current_user.id,
            provider_id=provider_profile.id,
            rating=review_data.rating,
            comment=review_data.comment
        )

        db.add(review)
        db.commit()
        db.refresh(review)

        return {
            "message": "Avaliação enviada com sucesso!",
            "review": {
                "id": review.id,
                "project_id": review.project_id,
                "service_request_id": review.service_request_id,
                "client_id": review.client_id,
                "provider_id": review.provider_id,
                "rating": review.rating,
                "comment": review.comment,
                "created_at": review.created_at
            }
        }

    # ========================================================
    # 2. AVALIAÇÃO DE PEDIDO DE SERVIÇO
    # ========================================================

    if review_data.service_request_id is not None:

        service_request = (
            db.query(ServiceRequest)
            .filter(
                ServiceRequest.id == review_data.service_request_id
            )
            .first()
        )

        if not service_request:
            raise HTTPException(
                status_code=404,
                detail="Pedido de serviço não encontrado."
            )

        # Apenas o cliente do pedido pode avaliar
        if service_request.client_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Você não pode avaliar este pedido."
            )

        # Apenas pedidos concluídos
        if service_request.status != "COMPLETED":
            raise HTTPException(
                status_code=400,
                detail="Só é possível avaliar pedidos concluídos."
            )

        # Verificar avaliação existente
        existing_review = (
            db.query(Review)
            .filter(
                Review.service_request_id == service_request.id
            )
            .first()
        )

        if existing_review:
            raise HTTPException(
                status_code=400,
                detail="Este pedido já foi avaliado."
            )

        # ====================================================
        # ServiceRequest.provider_id já é ProviderProfile.id
        # ====================================================

        provider_profile = (
            db.query(ProviderProfile)
            .filter(
                ProviderProfile.id == service_request.provider_id
            )
            .first()
        )

        if not provider_profile:
            raise HTTPException(
                status_code=404,
                detail="Perfil do prestador não encontrado."
            )

        # Criar avaliação
        review = Review(
            project_id=None,
            service_request_id=service_request.id,
            client_id=current_user.id,
            provider_id=provider_profile.id,
            rating=review_data.rating,
            comment=review_data.comment
        )

        db.add(review)
        db.commit()
        db.refresh(review)

        return {
            "message": "Avaliação enviada com sucesso!",
            "review": {
                "id": review.id,
                "project_id": review.project_id,
                "service_request_id": review.service_request_id,
                "client_id": review.client_id,
                "provider_id": review.provider_id,
                "rating": review.rating,
                "comment": review.comment,
                "created_at": review.created_at
            }
        }

    # ========================================================
    # 3. NENHUM ALVO INFORMADO
    # ========================================================

    raise HTTPException(
        status_code=400,
        detail="Informe project_id ou service_request_id."
    )


# ============================================================
# CLIENTE - PROJETOS QUE PODEM SER AVALIADOS
# ============================================================

@router.get("/my")
def get_my_review_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    projects = (
        db.query(Project)
        .filter(
            Project.client_id == current_user.id,
            Project.status == "COMPLETED"
        )
        .order_by(
            Project.created_at.desc()
        )
        .all()
    )

    result = []

    for project in projects:

        accepted_proposal = (
            db.query(Proposal)
            .filter(
                Proposal.project_id == project.id,
                Proposal.status == "ACCEPTED"
            )
            .first()
        )

        provider_data = None

        if accepted_proposal:

            # Proposal.provider_id = ProviderProfile.id
            provider_profile = (
                db.query(ProviderProfile)
                .filter(
                    ProviderProfile.id == accepted_proposal.provider_id
                )
                .first()
            )

            if provider_profile:

                provider_data = {
                    "id": provider_profile.id,
                    "user_id": provider_profile.user_id,
                    "name": provider_profile.user.name,
                    "profession": provider_profile.profession,
                    "location": provider_profile.location,
                    "experience_years": provider_profile.experience_years,
                    "is_verified": provider_profile.is_verified
                }

        existing_review = (
            db.query(Review)
            .filter(
                Review.project_id == project.id
            )
            .first()
        )

        result.append({
            "id": project.id,
            "client_id": project.client_id,
            "title": project.title,
            "description": project.description,
            "category": project.category,
            "location": project.location,
            "budget": project.budget,
            "status": project.status,
            "created_at": project.created_at,
            "reviewed": existing_review is not None,
            "provider": provider_data
        })

    return result


# ============================================================
# VER AVALIAÇÕES DE UM PRESTADOR
# ============================================================

@router.get("/provider/{provider_id}")
def get_provider_reviews(
    provider_id: int,
    db: Session = Depends(get_db)
):

    # Verificar se o perfil profissional existe
    provider = (
        db.query(ProviderProfile)
        .filter(
            ProviderProfile.id == provider_id
        )
        .first()
    )

    if not provider:
        raise HTTPException(
            status_code=404,
            detail="Prestador não encontrado."
        )

    reviews = (
        db.query(Review)
        .filter(
            Review.provider_id == provider_id
        )
        .order_by(
            Review.created_at.desc()
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

    return {
        "provider_id": provider_id,
        "average_rating": round(
            average_rating,
            1
        ),
        "total_reviews": total_reviews,
        "reviews": [
            {
                "id": review.id,
                "project_id": review.project_id,
                "service_request_id": review.service_request_id,
                "rating": review.rating,
                "comment": review.comment,

                "client": {
                    "id": review.client.id,
                    "name": review.client.name
                },

                "created_at": review.created_at
            }
            for review in reviews
        ]
    }