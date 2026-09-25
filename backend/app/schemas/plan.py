from pydantic import BaseModel, Field


class PlanUpdate(BaseModel):

    name: str | None = None

    price: float | None = Field(
        default=None,
        ge=0
    )

    period: str | None = None

    description: str | None = None

    badge: str | None = None

    is_active: bool | None = None