
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_user,
    require_role
)

from app.core.storage import (
    upload_profile_image,
    delete_profile_image
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
        "profile_image": current_user.profile_image,

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
            "profile_image": current_user.profile_image,

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


# =========================================================
# CARREGAR OU SUBSTITUIR FOTOGRAFIA DE PERFIL
# =========================================================

MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024


def detect_profile_image_type(file_bytes: bytes):
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


@router.post("/me/profile-image")
def upload_my_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_bytes = file.file.read(
        MAX_PROFILE_IMAGE_SIZE + 1
    )

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="O ficheiro enviado está vazio."
        )

    if len(file_bytes) > MAX_PROFILE_IMAGE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="A fotografia não pode ultrapassar 5 MB."
        )

    extension = detect_profile_image_type(file_bytes)

    if not extension:
        raise HTTPException(
            status_code=400,
            detail="Formato inválido. Envie JPEG, PNG ou WebP."
        )

    content_types = {
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp"
    }

    old_image_url = current_user.profile_image

    try:
        new_image_url = upload_profile_image(
            user_id=current_user.id,
            file_bytes=file_bytes,
            content_type=content_types[extension],
            extension=extension
        )

    except RuntimeError:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível guardar a fotografia. Tente novamente."
        )

    try:
        current_user.profile_image = new_image_url
        db.commit()
        db.refresh(current_user)

    except Exception:
        db.rollback()
        delete_profile_image(new_image_url)

        raise HTTPException(
            status_code=500,
            detail="Não foi possível atualizar a fotografia do perfil."
        )

    if old_image_url and old_image_url != new_image_url:
        delete_profile_image(old_image_url)

    return {
        "message": "Fotografia de perfil atualizada com sucesso!",
        "profile_image": current_user.profile_image
    }