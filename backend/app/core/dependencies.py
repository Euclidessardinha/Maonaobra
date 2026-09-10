
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.security import SECRET_KEY, ALGORITHM
from app.database.connection import get_db
from app.models.user import User
from app.models.provider import ProviderProfile

from typing import Callable


security = HTTPBearer()


# =========================================================
# USUÁRIO AUTENTICADO
# =========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido."
            )

    except JWTError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado."
        )


    user = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )


    if user is None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado."
        )


    if not user.is_active:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário desativado."
        )


    return user


# =========================================================
# VERIFICAR ROLE
# =========================================================

def require_role(*allowed_roles: str) -> Callable:

    def role_checker(
        current_user: User = Depends(get_current_user)
    ):

        if current_user.role not in allowed_roles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não tem permissão para acessar este recurso."
            )

        return current_user


    return role_checker


# =========================================================
# VERIFICAR PERFIL PROFISSIONAL
# =========================================================

def require_provider(
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


    if not provider_profile:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você precisa criar um perfil profissional para acessar esta área."
        )


    return current_user

