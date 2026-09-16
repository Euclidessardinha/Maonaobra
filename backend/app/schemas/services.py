from pydantic import BaseModel, Field

class ServiceCreate(BaseModel):
    category_id: int


    title: str = Field(
        min_length=3,
        max_length=150
    )

    description: str = Field(
        min_length=10,
        max_length=2000
    )

    price: float = Field(
        gt=0
    )


class ServiceUpdate(BaseModel):
    category_id: int


    title: str = Field(
        min_length=3,
        max_length=150
    )

    description: str = Field(
        min_length=10,
        max_length=2000
    )

    price: float = Field(
        gt=0
    )

