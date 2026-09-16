from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import (
get_current_user,
require_role
)

from app.database.connection import get_db

from app.models.user import User
from app.models.provider import ProviderProfile

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
        role="CLIENT"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Usuário criado com sucesso!",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
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

    # =================================================
    # PERFIL PROFISSIONAL
    # =================================================

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
# -----------------------------------------------------
# VERIFICAR SE O EMAIL JÁ PERTENCE A OUTRO USUÁRIO
# -----------------------------------------------------


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


# -----------------------------------------------------
# ATUALIZAR DADOS
# -----------------------------------------------------

    current_user.name = user_data.name.strip()
    current_user.email = user_data.email
    current_user.phone = user_data.phone.strip()


    db.commit()
    db.refresh(current_user)


# -----------------------------------------------------
# DEVOLVER USUÁRIO ATUALIZADO
# -----------------------------------------------------

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
            "is_provider": provider_profile is not None,
            "provider_profile_id": (
                provider_profile.id
                if provider_profile
                else None
            )
        }
    }

