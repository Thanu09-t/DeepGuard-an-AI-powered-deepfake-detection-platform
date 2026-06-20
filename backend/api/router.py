from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import DetectionReport
from services.inference import analyze_image, analyze_video, analyze_audio
import uuid
import random
import datetime

api_router = APIRouter()

@api_router.post("/detect/image")
async def detect_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File provided is not an image.")
    
    # Read file content
    content = await file.read()
    
    # Run mock inference
    result = analyze_image(file.filename, content)
    
    # Save to database
    report_id = f"REP-{random.randint(10000, 99999)}-{random.choice(['AX', 'BY', 'CZ', 'DW', 'EV'])}"
    report = DetectionReport(
        id=report_id,
        filename=file.filename,
        media_type="image",
        is_fake=result["is_fake"],
        confidence_score=result["confidence_score"],
        model_used=result["model_used"],
        analysis_time_ms=result["analysis_time_ms"],
        details=result,
        created_at=datetime.datetime.utcnow()
    )
    db.add(report)
    db.commit()
    
    return {"file_id": report_id, "filename": file.filename, "result": result}

@api_router.post("/detect/video")
async def detect_video(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="File provided is not a video.")
    
    content = await file.read()
    result = analyze_video(file.filename, content)
    
    # Save to database
    report_id = f"REP-{random.randint(10000, 99999)}-{random.choice(['AX', 'BY', 'CZ', 'DW', 'EV'])}"
    report = DetectionReport(
        id=report_id,
        filename=file.filename,
        media_type="video",
        is_fake=result["is_fake"],
        confidence_score=result["confidence_score"],
        model_used=result["model_used"],
        analysis_time_ms=result["analysis_time_ms"],
        details=result,
        created_at=datetime.datetime.utcnow()
    )
    db.add(report)
    db.commit()
    
    return {"file_id": report_id, "filename": file.filename, "result": result}

@api_router.post("/detect/audio")
async def detect_audio(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File provided is not audio.")
    
    content = await file.read()
    result = analyze_audio(file.filename, content)
    
    # Save to database
    report_id = f"REP-{random.randint(10000, 99999)}-{random.choice(['AX', 'BY', 'CZ', 'DW', 'EV'])}"
    report = DetectionReport(
        id=report_id,
        filename=file.filename,
        media_type="audio",
        is_fake=result["is_fake"],
        confidence_score=result["confidence_score"],
        model_used=result["model_used"],
        analysis_time_ms=result["analysis_time_ms"],
        details=result,
        created_at=datetime.datetime.utcnow()
    )
    db.add(report)
    db.commit()
    
    return {"file_id": report_id, "filename": file.filename, "result": result}

@api_router.get("/history")
async def get_history(db: Session = Depends(get_db)):
    reports = db.query(DetectionReport).order_by(DetectionReport.created_at.desc()).limit(20).all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "type": r.media_type,
            "score": r.confidence_score,
            "status": "Fake" if r.is_fake else "Real",
            "date": r.created_at.isoformat() + "Z"
        }
        for r in reports
    ]
