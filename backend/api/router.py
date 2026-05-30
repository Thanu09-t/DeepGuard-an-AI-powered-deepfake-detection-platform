from fastapi import APIRouter, UploadFile, File, HTTPException
from services.mock_inference import analyze_image, analyze_video, analyze_audio
import uuid

api_router = APIRouter()

@api_router.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    # Simulate saving file and processing
    content = await file.read()
    file_id = str(uuid.uuid4())
    
    # Run mock inference
    result = analyze_image(file.filename, len(content))
    return {"file_id": file_id, "filename": file.filename, "result": result}

@api_router.post("/detect/video")
async def detect_video(file: UploadFile = File(...)):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File provided is not a video.")
    
    content = await file.read()
    file_id = str(uuid.uuid4())
    
    result = analyze_video(file.filename, len(content))
    return {"file_id": file_id, "filename": file.filename, "result": result}

@api_router.post("/detect/audio")
async def detect_audio(file: UploadFile = File(...)):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File provided is not audio.")
    
    content = await file.read()
    file_id = str(uuid.uuid4())
    
    result = analyze_audio(file.filename, len(content))
    return {"file_id": file_id, "filename": file.filename, "result": result}

@api_router.get("/history")
async def get_history():
    # Mock history
    return [
        {"id": "1", "filename": "sample_face.jpg", "type": "image", "score": 92.5, "status": "Fake", "date": "2026-05-30T10:00:00Z"},
        {"id": "2", "filename": "interview.mp4", "type": "video", "score": 15.2, "status": "Real", "date": "2026-05-30T11:30:00Z"},
        {"id": "3", "filename": "voice_memo.wav", "type": "audio", "score": 88.9, "status": "Fake", "date": "2026-05-30T12:15:00Z"},
    ]
