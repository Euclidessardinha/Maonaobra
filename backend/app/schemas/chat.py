from datetime import datetime

from pydantic import BaseModel, Field


class ConversationCreate(BaseModel):
    provider_id: int


class ConversationResponse(BaseModel):
    id: int
    client_id: int
    provider_id: int
    provider_name: str
    provider_profession: str | None
    provider_location: str | None
    client_name: str
    created_at: datetime


class MessageCreate(BaseModel):
    content: str = Field(
        min_length=1,
        max_length=2000
    )


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: str
    is_read: bool
    created_at: datetime