from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_role
from app.database.connection import get_db
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate


router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@router.post("/")
def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(
        require_role("ADMIN")
    ),
    db: Session = Depends(get_db)
):
    existing_category = (
        db.query(Category)
        .filter(Category.name == category_data.name)
        .first()
    )

    if existing_category:
        raise HTTPException(
            status_code=400,
            detail="Esta categoria já existe."
        )

    category = Category(
        name=category_data.name,
        description=category_data.description
    )

    db.add(category)
    db.commit()
    db.refresh(category)

    return {
        "message": "Categoria criada com sucesso!",
        "category": {
            "id": category.id,
            "name": category.name,
            "description": category.description
        }
    }



@router.get("/")
def list_categories(
    db: Session = Depends(get_db)
):
    categories = (
        db.query(Category)
        .order_by(Category.name.asc())
        .all()
    )

    return [
        {
            "id": category.id,
            "name": category.name,
            "description": category.description
        }
        for category in categories
    ]    