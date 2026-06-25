import os
import sys

# Resolve absolute imports on Vercel deployment
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.router import api_router
from core.config import settings
from database.init_db import init_db, seed_db

# Initialize database schema and seed data on startup
# Wrapped in try/except to be resilient in serverless cold starts
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

# Allowed origins list — covers local dev + all Vercel deployments
_cors_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

# Add any extra origins from environment variable (e.g. your specific Vercel domain)
_extra_origins = os.getenv("ALLOWED_ORIGINS", "")
if _extra_origins:
    for origin in _extra_origins.split(","):
        origin = origin.strip()
        if origin and origin not in _cors_origins:
            _cors_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    # Also match all *.vercel.app subdomains via regex
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "Welcome to DeepGuard AI API", "status": "ok"}

@app.get("/health")
def health():
    """Health check endpoint for Vercel deployment verification."""
    return {"status": "healthy", "service": "DeepGuard AI"}
