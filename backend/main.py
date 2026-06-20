from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import api_router
from core.config import settings
from database.init_db import init_db, seed_db

# Initialize database schema and seed data on startup
try:
    init_db()
    seed_db()
except Exception as e:
    print(f"Failed to initialize database: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="API for DeepGuard AI Real-Time Deepfake Detection"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    origins = [str(origin).rstrip('/') for origin in settings.BACKEND_CORS_ORIGINS]
    # Add variations without trailing slash to be secure and compatible
    origins.extend(["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"])
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(set(origins)),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to DeepGuard AI API"}
