
from pydantic import BaseModel, Field


# ============================================================
# CRIAR PERFIL PROFISSIONAL
# ============================================================

class ProviderProfileCreate(BaseModel):

    profession: str = Field(
        min_length=2,
        max_length=100
    )

    bio: str | None = None

    location: str = Field(
        min_length=2,
        max_length=150
    )

    experience_years: int = Field(
        default=0,
        ge=0,
        le=60
    )

    hourly_rate: float | None = Field(
        default=None,
        ge=0
    )


# ============================================================
# ATUALIZAR PERFIL PROFISSIONAL
# ============================================================

class ProviderProfileUpdate(BaseModel):

    profession: str = Field(
        min_length=2,
        max_length=100
    )

    bio: str | None = None

    location: str = Field(
        min_length=2,
        max_length=150
    )

    experience_years: int = Field(
        default=0,
        ge=0,
        le=60
    )

    hourly_rate: float | None = Field(
        default=None,
        ge=0
    )

