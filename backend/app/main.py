from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, health
from app.core.config import settings
from app.db.mongodb import close_mongo_connection, connect_to_mongo, ensure_indexes


@asynccontextmanager
async def lifespan(_: FastAPI):
    connect_to_mongo()
    ensure_indexes()
    yield
    close_mongo_connection()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix=settings.api_v1_prefix)
