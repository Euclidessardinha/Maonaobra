from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):

    # Avaliação de projeto
    project_id: int | None = None

    # Avaliação de pedido de serviço
    service_request_id: int | None = None

    rating: int = Field(
        ge=1,
        le=5
    )

    comment: str | None = Field(
        default=None,
        max_length=1000
    )


class ReviewResponse(BaseModel):
    id: int

    project_id: int | None

    service_request_id: int | None

    client_id: int

    provider_id: int

    rating: int

    comment: str | None

    created_at: datetime