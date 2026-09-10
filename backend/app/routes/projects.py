from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_provider
from app.database.connection import get_db

from app.models.project import Project
from app.models.user import User
from app.models.provider import ProviderProfile
from app.models.proposal import Proposal
from app.models.category import Category

from app.schemas.project import (
    ProjectCreate,
    ProjectResponse
)

from app.schemas.proposal import (
    ProposalCreate,
    ProposalResponse
)


router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


# ============================================================
# CLIENTE - CRIAR PROJETO
# ============================================================

@router.post(
    "",
    response_model=ProjectResponse
)
def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Qualquer usuário normal pode publicar um projeto.
    # Não verificamos mais role == "CLIENT", porque um usuário
    # também pode possuir um perfil profissional.

    # Verificar categoria
    category = (
        db.query(Category)
        .filter(
            Category.id == project_data.category_id
        )
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=404,
            detail="Categoria não encontrada."
        )

    # Criar projeto
    project = Project(
        client_id=current_user.id,
        title=project_data.title,
        description=project_data.description,
        category_id=category.id,
        category=category.name,
        location=project_data.location,
        budget=project_data.budget
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project


# ============================================================
# PRESTADOR - VER PROJETOS ABERTOS
# ============================================================

@router.get(
    "",
    response_model=list[ProjectResponse]
)
def get_projects(
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):

    projects = (
        db.query(Project)
        .filter(
            Project.status == "OPEN"
        )
        .order_by(
            Project.created_at.desc()
        )
        .all()
    )

    return projects


# ============================================================
# CLIENTE - VER OS PRÓPRIOS PROJETOS
# ============================================================

@router.get(
    "/my",
    response_model=list[ProjectResponse]
)
def get_my_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    projects = (
        db.query(Project)
        .filter(
            Project.client_id == current_user.id
        )
        .order_by(
            Project.created_at.desc()
        )
        .all()
    )

    return projects


# ============================================================
# PRESTADOR - ENVIAR PROPOSTA
# ============================================================

@router.post(
    "/{project_id}/proposals",
    response_model=ProposalResponse
)
def create_proposal(
    project_id: int,
    proposal_data: ProposalCreate,
    current_user: User = Depends(require_provider),
    db: Session = Depends(get_db)
):

    # ========================================================
    # BUSCAR PERFIL PROFISSIONAL
    # ========================================================

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

    # ========================================================
    # VERIFICAR PROJETO
    # ========================================================

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Projeto não encontrado."
        )

    # ========================================================
    # VERIFICAR SE ESTÁ ABERTO
    # ========================================================

    if project.status != "OPEN":
        raise HTTPException(
            status_code=400,
            detail="Este projeto não está aceitando propostas."
        )

    # ========================================================
    # IMPEDIR PROPOSTA PARA O PRÓPRIO PROJETO
    # ========================================================

    if project.client_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail=(
                "Você não pode enviar uma proposta "
                "para o seu próprio projeto."
            )
        )

    # ========================================================
    # VERIFICAR PROPOSTA DUPLICADA
    # ========================================================

    existing_proposal = (
        db.query(Proposal)
        .filter(
            Proposal.project_id == project_id,
            Proposal.provider_id == provider.id
        )
        .first()
    )

    if existing_proposal:
        raise HTTPException(
            status_code=400,
            detail=(
                "Você já enviou uma proposta "
                "para este projeto."
            )
        )

    # ========================================================
    # CRIAR PROPOSTA
    # ========================================================

    proposal = Proposal(
        project_id=project_id,
        provider_id=provider.id,
        price=proposal_data.price,
        message=proposal_data.message
    )

    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    return proposal


# ============================================================
# CLIENTE - VER PROPOSTAS DO SEU PROJETO
# ============================================================

@router.get(
    "/{project_id}/proposals",
    response_model=list[ProposalResponse]
)
def get_project_proposals(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Procurar projeto
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Projeto não encontrado."
        )

    # Apenas o dono pode visualizar as propostas
    if project.client_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail=(
                "Você não tem permissão para "
                "visualizar estas propostas."
            )
        )

    proposals = (
        db.query(Proposal)
        .filter(
            Proposal.project_id == project_id
        )
        .order_by(
            Proposal.created_at.desc()
        )
        .all()
    )

    return proposals


# ============================================================
# VER PROJETO POR ID
# ============================================================

@router.get(
    "/{project_id}",
    response_model=ProjectResponse
)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Projeto não encontrado."
        )

    return project


# ============================================================
# CLIENTE - ACEITAR PROPOSTA
# ============================================================

@router.post(
    "/proposals/{proposal_id}/accept",
    response_model=ProposalResponse
)
def accept_proposal(
    proposal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Procurar proposta
    proposal = (
        db.query(Proposal)
        .filter(
            Proposal.id == proposal_id
        )
        .first()
    )

    if not proposal:
        raise HTTPException(
            status_code=404,
            detail="Proposta não encontrada."
        )

    # Procurar projeto
    project = (
        db.query(Project)
        .filter(
            Project.id == proposal.project_id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Projeto não encontrado."
        )

    # Apenas o dono do projeto pode aceitar
    if project.client_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail=(
                "Você não tem permissão "
                "para aceitar esta proposta."
            )
        )

    # Projeto precisa estar aberto
    if project.status != "OPEN":
        raise HTTPException(
            status_code=400,
            detail="Este projeto não está mais disponível."
        )

    # Proposta precisa estar pendente
    if proposal.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail="Esta proposta não está mais pendente."
        )

    # Aceitar proposta
    proposal.status = "ACCEPTED"

    # Colocar projeto em andamento
    project.status = "IN_PROGRESS"

    # Rejeitar outras propostas pendentes
    other_proposals = (
        db.query(Proposal)
        .filter(
            Proposal.project_id == project.id,
            Proposal.id != proposal.id,
            Proposal.status == "PENDING"
        )
        .all()
    )

    for other_proposal in other_proposals:
        other_proposal.status = "REJECTED"

    db.commit()
    db.refresh(proposal)

    return proposal


# ============================================================
# CLIENTE - CONCLUIR PROJETO
# ============================================================

@router.patch(
    "/{project_id}/complete",
    response_model=ProjectResponse
)
def complete_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Procurar projeto
    project = (
        db.query(Project)
        .filter(
            Project.id == project_id
        )
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Projeto não encontrado."
        )

    # Apenas o cliente dono pode concluir
    if project.client_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail=(
                "Você não tem permissão "
                "para concluir este projeto."
            )
        )

    # Projeto precisa estar em andamento
    if project.status != "IN_PROGRESS":
        raise HTTPException(
            status_code=400,
            detail=(
                "Apenas projetos em andamento "
                "podem ser concluídos."
            )
        )

    # Concluir projeto
    project.status = "COMPLETED"

    db.commit()
    db.refresh(project)

    return project