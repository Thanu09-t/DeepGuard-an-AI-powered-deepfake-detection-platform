from pydantic_settings import BaseSettings
from typing import List, Union
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "DeepGuard AI"
    # We use List[str] instead of List[AnyHttpUrl] to prevent validation errors with dynamic strings or wildcards
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173", # Vite dev server
        "http://localhost:3000"
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True, always=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        import os
        import json
        
        raw_origins = os.getenv("ALLOWED_ORIGINS") or os.getenv("BACKEND_CORS_ORIGINS")
        if not raw_origins:
            if isinstance(v, list):
                return v
            if isinstance(v, str) and v:
                raw_origins = v
            else:
                return ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]

        if isinstance(raw_origins, str):
            raw_origins = raw_origins.strip()
            if raw_origins.startswith("[") and raw_origins.endswith("]"):
                try:
                    return json.loads(raw_origins)
                except Exception:
                    pass
            return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
            
        return raw_origins
    
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///./deepguard.db"

    @validator("SQLALCHEMY_DATABASE_URI", pre=True, always=True)
    def assemble_db_connection(cls, v: str) -> str:
        import os
        # Use DATABASE_URL from env if set
        env_url = os.getenv("DATABASE_URL")
        if env_url:
            if env_url.startswith("postgres://"):
                env_url = env_url.replace("postgres://", "postgresql://", 1)
            return env_url
        
        # Check if running in Vercel serverless environment
        if os.getenv("VERCEL") == "1" or os.getenv("VERCEL_ENV") is not None:
            return "sqlite:////tmp/deepguard.db"
            
        return v or "sqlite:///./deepguard.db"

    class Config:
        case_sensitive = True

settings = Settings()

