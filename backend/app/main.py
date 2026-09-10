from fastapi import FastAPI

from app.database.connection import Base, engine

# Importar todos os modelos
from app.models.user import User
from app.models.provider import ProviderProfile
from app.models.category import Category
from app.models.service import Service
from app.models.service_request import ServiceRequest
from app.models.review import Review
from app.models.favorite import Favorite
from fastapi.middleware.cors import CORSMiddleware
from app.models.project import Project
from app.models.proposal import Proposal
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.notification import Notification


import asyncio

from contextlib import asynccontextmanager

from app.services.notification_email_worker import (
    notification_email_worker
)



# Importar as rotas
from app.routes.auth import router as auth_router
from app.routes.providers import router as providers_router
from app.routes.services import router as services_router
from app.routes.categories import router as categories_router
from app.routes.requests import router as requests_router
from app.routes.reviews import router as reviews_router
from app.routes.favorites import router as favorites_router
from app.routes.projects import router as projects_router
from app.routes.proposals import router as proposals_router
from app.routes.chat import router as chat_router
from app.routes.notifications import router as notifications_router
from app.routes.admin import router as admin_router


# Criar as tabelas
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    worker_task = asyncio.create_task(
        notification_email_worker()
    )

    print(
        "[EMAIL WORKER] Serviço de notificações por "
        "e-mail iniciado."
    )

    try:
        yield
    finally:
        worker_task.cancel()

        try:
            await worker_task
        except asyncio.CancelledError:
            pass

        print(
            "[EMAIL WORKER] Serviço de notificações "
            "por e-mail encerrado."
        )


app = FastAPI(
    title="MãoNaObra MZ API",
    description="Marketplace inteligente de serviços",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar as rotas
app.include_router(auth_router)
app.include_router(providers_router)
app.include_router(services_router)
app.include_router(categories_router)
app.include_router(requests_router)
app.include_router(reviews_router)
app.include_router(favorites_router)
app.include_router(projects_router)
app.include_router(proposals_router)
app.include_router(chat_router)
app.include_router(notifications_router)
app.include_router(admin_router)


@app.get("/")
def root():
    return {
        "message": "MãoNaObra MZ API funcionando!"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }