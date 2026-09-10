from datetime import datetime

from pydantic import BaseModel, Field


class ServiceRequestCreate(BaseModel):
    service_id: int

    description: str = Field(
        min_length=10,
        max_length=2000
    )

    location: str = Field(
        min_length=2,
        max_length=200
    )

    requested_date: datetime | None = None

class ServiceRequestStatusUpdate(BaseModel):
    status: str    