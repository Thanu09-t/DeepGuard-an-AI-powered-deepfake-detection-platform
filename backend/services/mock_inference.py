import random
import time

def analyze_image(filename: str, file_size: int):
    """Simulates deepfake detection on an image using EfficientNet/ViT mocks."""
    # Simulate processing time
    time.sleep(1.5)
    
    # Generate mock data
    is_fake = random.choice([True, False])
    confidence = random.uniform(85.0, 99.9) if is_fake else random.uniform(1.0, 15.0)
    
    return {
        "is_fake": is_fake,
        "confidence_score": round(confidence, 2),
        "model_used": "EfficientNet-B4 + ViT Ensemble",
        "analysis_time_ms": random.randint(800, 1500),
        "manipulated_regions": [
            {"region": "eyes", "suspicion_score": round(random.uniform(70.0, 99.9), 2)} if is_fake else None,
            {"region": "mouth", "suspicion_score": round(random.uniform(70.0, 99.9), 2)} if is_fake else None
        ]
    }

def analyze_video(filename: str, file_size: int):
    """Simulates deepfake detection on a video using CNN+LSTM mocks."""
    time.sleep(3.0)
    
    is_fake = random.choice([True, False])
    confidence = random.uniform(80.0, 98.0) if is_fake else random.uniform(2.0, 20.0)
    
    # Mock frame-by-frame analysis
    num_frames = 10
    frame_analysis = []
    for i in range(num_frames):
        score = random.uniform(70.0, 99.0) if is_fake and i > 3 and i < 8 else random.uniform(0.0, 30.0)
        frame_analysis.append({"time_sec": i * 0.5, "score": round(score, 2)})
        
    return {
        "is_fake": is_fake,
        "confidence_score": round(confidence, 2),
        "model_used": "TimeSformer + XceptionNet",
        "analysis_time_ms": random.randint(2500, 4000),
        "anomalies_detected": ["lip-sync mismatch", "facial artifact"] if is_fake else [],
        "timeline": frame_analysis
    }

def analyze_audio(filename: str, file_size: int):
    """Simulates deepfake audio detection using Wav2Vec 2.0 mock."""
    time.sleep(2.0)
    
    is_fake = random.choice([True, False])
    confidence = random.uniform(85.0, 99.0) if is_fake else random.uniform(5.0, 25.0)
    
    return {
        "is_fake": is_fake,
        "confidence_score": round(confidence, 2),
        "model_used": "Wav2Vec 2.0 + Whisper Embeddings",
        "analysis_time_ms": random.randint(1500, 2500),
        "anomalies_detected": ["synthetic cadence", "frequency artifact"] if is_fake else []
    }
