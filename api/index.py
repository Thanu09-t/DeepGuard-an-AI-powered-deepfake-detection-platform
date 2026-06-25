import sys
import os

# Add backend directory to path so imports work correctly
backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
backend_dir = os.path.abspath(backend_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import the FastAPI app from backend/main.py
from main import app  # noqa: E402

# Mangum wraps the ASGI app as an AWS Lambda handler
# Vercel's Python serverless runtime invokes this as `handler`
from mangum import Mangum

handler = Mangum(app, lifespan="off")
