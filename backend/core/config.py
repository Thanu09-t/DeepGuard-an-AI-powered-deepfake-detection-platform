from pydantic_settings import BaseSettings
from typing import List, Union
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "DeepGuard AI"
    # BACKEND_CORS_ORIGINS is a JSON-formatted list of origins
    # e.g: '["http://localhost", "http://localhost:4200", "http://localhost:3000", "http://localhost:5173"]'
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:5173", # Vite dev server
        "http://localhost:3000"
    ]
    
    # Database config (using SQLite for MVP simplicity unless Postgres is strongly needed, 
    # but based on MVP scope SQLite is faster to start without external DB setup)
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./deepguard.db"

    class Config:
        case_sensitive = True

settings = Settings()
