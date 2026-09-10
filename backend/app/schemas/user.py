from pydantic import BaseModel, EmailStr, Field
from typing import Literal


class UserCreate(BaseModel):

    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    phone: str = Field(
        min_length=8,
        max_length=30
    )

    password: str = Field(
        min_length=8,
        max_length=100
    )

    role: Literal["CLIENT", "PROVIDER"] = "CLIENT"


class UserLogin(BaseModel):

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=100
    )