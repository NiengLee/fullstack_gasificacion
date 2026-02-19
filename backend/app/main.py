import uvicorn
#from loguru import logger
from fastapi import Depends
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request, HTTPException

from app.config.settings import settings
from app.api.v1.router import router

from app.api.v1.router import router
from app.data.store import store         
from app.util.model import get_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        store.get()
    except FileNotFoundError:
        pass
    try:
        get_model()
    except FileNotFoundError:
        pass
    yield  


app = FastAPI(
                title=settings.APP_NAME,
                description=settings.APP_DESCRIPTION,
                version=settings.APP_VERSION,
                docs_url="/docs" if settings.ENVIRONMENT == 'develop' else None,
                redoc_url="/redoc" if settings.ENVIRONMENT == 'develop' else None,
                openapi_url="/docs/openapi.json" if settings.ENVIRONMENT == 'develop' else None,
            )

app.include_router(router)

app.add_middleware(
                    CORSMiddleware,
                    allow_origins=settings.CORS_ORIGINS,
                    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
                    allow_methods=settings.CORS_ALLOW_METHODS,
                    allow_headers=settings.CORS_ALLOW_HEADERS,
                )

app.include_router(router)


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )