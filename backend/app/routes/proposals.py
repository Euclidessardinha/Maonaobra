from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import require_provider
from app.database.connection import get_db

from app.models.provider import ProviderProfile
from app.models.proposal import Proposal
from app.models.user import User

from app.schemas.proposal import ProposalResponse


router = APIRouter(
    prefix="/proposals",
    tags=["Proposals"]
)


# ============================================================
# PRESTADOR - VER AS PRÓPRIAS PROPOSTAS
# ============================================================

@router.get(
    "/my",
    response_model=list[ProposalResponse]
)
def get_my_proposals(
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

    # Buscar propostas deste perfil profissional
    proposals = (
        db.query(Proposal)
        .filter(
            Proposal.provider_id == provider.id
        )
        .order_by(
            Proposal.created_at.desc()
        )
        .all()
    )

    return proposals