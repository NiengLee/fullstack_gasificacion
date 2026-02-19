import secrets
from typing import Optional, List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: Optional[str]
    APP_VERSION: Optional[str]
    APP_DESCRIPTION: Optional[str] = "API for Mobile Services"
    DEBUG: Optional[bool] = False
    HOST: Optional[str]
    PORT: Optional[int]
    ENVIRONMENT: Optional[str] = "development"
    
    API_KEY_SECRET: Optional[str] = "S3T-4P1-K3Y-S3CR3T-H3R3"
    
    DATASET_PATH: Optional[str] = "app/data/GasificationDataset.csv"   
    DATASET_ENGINE: Optional[str] = "polars"                           

    CORS_ORIGINS: Optional[List[str]] = ["*"]
    CORS_ALLOW_CREDENTIALS: Optional[bool] = True
    CORS_ALLOW_METHODS: Optional[List[str]] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    CORS_ALLOW_HEADERS: Optional[List[str]] = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
