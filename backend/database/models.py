from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class DetectionReport(Base):
    __tablename__ = "detection_reports"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, index=True)
    media_type = Column(String) # 'image', 'video', 'audio'
    is_fake = Column(Boolean)
    confidence_score = Column(Float)
    model_used = Column(String)
    analysis_time_ms = Column(Integer)
    details = Column(JSON) # Store specific details like regions, anomalies, timelines
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
