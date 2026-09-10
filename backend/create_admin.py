from getpass import getpass

from app.core.security import hash_password
from app.database.connection import SessionLocal
from app.models.user import User


def create_admin():
    db = SessionLocal()

    try:
        name = input("Nome do administrador: ")
        email = input("Email do administrador: ")
        phone = input("Telefone: ")
        password = getpass("Senha: ")

        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user:
            print("Já existe um usuário com esse email.")
            return

        admin = User(
            name=name,
            email=email,
            phone=phone,
            password_hash=hash_password(password),
            role="ADMIN"
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print()
        print("Administrador criado com sucesso!")
        print(f"ID: {admin.id}")
        print(f"Email: {admin.email}")

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()