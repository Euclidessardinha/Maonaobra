from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProposalCreate(BaseModel):
    price: float
    message: str


class ProviderProposalResponse(BaseModel):
    id: int
    name: str = Field(default="Profissional")

    model_config = ConfigDict(from_attributes=True)


class ProposalResponse(BaseModel):
    id: int
    project_id: int
    provider_id: int
    price: float
    message: str
    status: str
    created_at: datetime
    provider: ProviderProposalResponse | None = None

    model_config = ConfigDict(from_attributes=True)