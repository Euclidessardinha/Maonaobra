
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_user,
    require_role
)

from app.database.connection import get_db

from app.models.user import User
from app.models.provider import ProviderProfile

from app.models.plan import Plan
from app.models.subscription import Subscription

from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserUpdate
)

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# =========================================================
# SCHEMAS DO ONBOARDING
# =========================================================

class OnboardingArea(BaseModel):
    area: Literal["CLIENT", "PROVIDER"]


# =========================================================
# REGISTRO
# =========================================================

@router.post("/register")
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Este email já está cadastrado."
        )

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        password_hash=hash_password(user_data.password),
        role="CLIENT",

        # Novas contas começam sem concluir os onboardings
        onboarding_type=None,
        client_onboarding_completed=False,
        provider_onboarding_completed=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # =====================================================
    # ATRIBUIR PLANO GRATUITO AUTOMATICAMENTE
    # =====================================================

    free_plan = (
        db.query(Plan)
        .filter(
            Plan.name == "Gratuito",
            Plan.is_active == True
        )
        .first()
    )

    if free_plan:
        subscription = Subscription(
            user_id=new_user.id,
            plan_id=free_plan.id,
            status="ACTIVE"
        )

        db.add(subscription)
        db.commit()

    return {
        "message": "Usuário criado com sucesso!",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "onboarding_type": new_user.onboarding_type,
            "client_onboarding_completed": (
                new_user.client_onboarding_completed
            ),
            "provider_onboarding_completed": (
                new_user.provider_onboarding_completed
            )
        }
    }


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Email ou senha incorretos."
        )

    if not verify_password(
        user_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Email ou senha incorretos."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Esta conta está desativada."
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


# =========================================================
# ÁREA DO CLIENTE
# =========================================================

@router.get("/client-area")
def client_area(
    current_user: User = Depends(
        require_role("CLIENT")
    )
):
    return {
        "message": "Bem-vindo à área do cliente!",
        "user_id": current_user.id,
        "role": current_user.role
    }


# =========================================================
# ESCOLHER A PRIMEIRA ÁREA DO ONBOARDING
# =========================================================

@router.post("/onboarding/select")
def select_onboarding_area(
    data: OnboardingArea,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Administradores não precisam de onboarding."
        )

    # Guardar apenas a primeira escolha.
    # A escolha inicial não será alterada quando o utilizador
    # alternar posteriormente entre Cliente e Prestador.
    if current_user.onboarding_type is None:
        current_user.onboarding_type = data.area
        db.commit()
        db.refresh(current_user)

    return {
        "message": "Área selecionada com sucesso!",
        "onboarding_type": current_user.onboarding_type,
        "client_onboarding_completed": (
            current_user.client_onboarding_completed
        ),
        "provider_onboarding_completed": (
            current_user.provider_onboarding_completed
        )
    }


# =========================================================
# CONCLUIR ONBOARDING DE UMA ÁREA
# =========================================================

@router.post("/onboarding/complete")
def complete_onboarding(
    data: OnboardingArea,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Administradores não precisam de onboarding."
        )

    if data.area == "CLIENT":
        current_user.client_onboarding_completed = True

    elif data.area == "PROVIDER":

        # Só pode concluir o onboarding profissional
        # depois de criar o perfil de prestador.
        provider_profile = (
            db.query(ProviderProfile)
            .filter(
                ProviderProfile.user_id == current_user.id
            )
            .first()
        )

        if not provider_profile:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Crie primeiro o seu perfil profissional "
                    "para concluir este onboarding."
                )
            )

        current_user.provider_onboarding_completed = True

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Onboarding concluído com sucesso!",
        "client_onboarding_completed": (
            current_user.client_onboarding_completed
        ),
        "provider_onboarding_completed": (
            current_user.provider_onboarding_completed
        )
    }


# =========================================================
# USUÁRIO AUTENTICADO
# =========================================================

@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    provider_profile = (
        db.query(ProviderProfile)
        .filter(
            ProviderProfile.user_id == current_user.id
        )
        .first()
    )

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
        "is_active": current_user.is_active,

        # CONTROLO DO ONBOARDING
        "onboarding_type": current_user.onboarding_type,
        "client_onboarding_completed": (
            current_user.client_onboarding_completed
        ),
        "provider_onboarding_completed": (
            current_user.provider_onboarding_completed
        ),

        # PERFIL PROFISSIONAL
        "is_provider": provider_profile is not None,
        "provider_profile_id": (
            provider_profile.id
            if provider_profile
            else None
        )
    }


# =========================================================
# ATUALIZAR PERFIL DO USUÁRIO
# =========================================================

@router.patch("/me")
def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # VERIFICAR SE O EMAIL JÁ PERTENCE A OUTRO USUÁRIO

    existing_user = (
        db.query(User)
        .filter(
            User.email == user_data.email,
            User.id != current_user.id
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Este email já está cadastrado por outro usuário."
        )

    # ATUALIZAR DADOS

    current_user.name = user_data.name.strip()
    current_user.email = user_data.email
    current_user.phone = user_data.phone.strip()

    db.commit()
    db.refresh(current_user)

    # DEVOLVER USUÁRIO ATUALIZADO

    provider_profile = (
        db.query(ProviderProfile)
        .filter(
            ProviderProfile.user_id == current_user.id
        )
        .first()
    )

    return {
        "message": "Perfil atualizado com sucesso!",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone,
            "role": current_user.role,
            "is_active": current_user.is_active,

            # CONTROLO DO ONBOARDING
            "onboarding_type": current_user.onboarding_type,
            "client_onboarding_completed": (
                current_user.client_onboarding_completed
            ),
            "provider_onboarding_completed": (
                current_user.provider_onboarding_completed
            ),

            # PERFIL PROFISSIONAL
            "is_provider": provider_profile is not None,
            "provider_profile_id": (
                provider_profile.id
                if provider_profile
                else None
            )
        }
    }
