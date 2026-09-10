from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProjectCreate(BaseModel):
    title: str
    description: str
    category_id: int
    location: str
    budget: float | None = None


class ProjectResponse(BaseModel):
    id: int
    client_id: int
    title: str
    description: str

    category_id: int
    category: str

    location: str
    budget: float | None
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)