import random
import time
import hashlib

def determine_forensics(filename: str, content: bytes, media_type: str) -> dict:
    """
    Performs deterministic, heuristic byte-level inspection to identify 
    manipulation signatures and camera EXIF markers.
    Returns a dict with: is_fake, confidence_score, anomalies_detected
    """
    name_lower = filename.lower()
    
    # Compute deterministic seed based on content hash
    content_hash = hashlib.sha256(content).hexdigest()
    rng = random.Random(content_hash)
    
    # Check for keywords in filename
    has_fake_kw = any(kw in name_lower for kw in ['fake', 'deepfake', 'synthetic', 'manipulated', 'altered', 'spoof', 'clone'])
    has_real_kw = any(kw in name_lower for kw in ['real', 'authentic', 'original', 'genuine', 'true', 'capture'])
    
    # Check for webcam captures (browser-generated files from canvas capture)
    is_webcam_capture = name_lower.startswith('webcam-') or name_lower.startswith('webcam_')
    
    # Heuristics: Search file bytes for signatures
    # Look for known digital camera signatures (real/authentic indicator)
    camera_markers = [b'Apple', b'Samsung', b'Sony', b'Canon', b'Nikon', b'Google', b'Fujifilm', b'Panasonic', b'OnePlus', b'Xiaomi']
    has_camera_marker = any(marker in content for marker in camera_markers)
    
    # Look for editing and synthetic software markers
    manipulation_markers = [
        b'Photoshop', b'Adobe', b'Premiere', b'After Effects', b'GIMP', b'Canva',
        b'stable-diffusion', b'midjourney', b'dall-e', b'Wav2Lip', b'DeepFaceLab',
        b'faceswap', b'gan', b'generator', b'artificial', b'synthetic'
    ]
    content_lower = content.lower()
    has_manipulation_marker = any(marker.lower() in content_lower for marker in manipulation_markers)
    
    # Decide verdict based on rules (order matters: most specific first)
    if has_fake_kw:
        is_fake = True
        base_confidence = rng.uniform(92.0, 99.9)
    elif is_webcam_capture or has_real_kw:
        # Webcam captures are live camera feeds — treat as authentic
        is_fake = False
        base_confidence = rng.uniform(2.0, 10.0)
    elif has_manipulation_marker:
        is_fake = True
        base_confidence = rng.uniform(86.0, 98.5)
    elif has_camera_marker:
        is_fake = False
        base_confidence = rng.uniform(2.0, 15.0)
    else:
        # Fallback: no suspicious markers found — default to authentic
        # (innocent until proven guilty; only flag as fake when evidence exists)
        is_fake = False
        base_confidence = rng.uniform(5.0, 20.0)
        
    # Generate anomalies based on verdict and media type
    anomalies = []
    if is_fake:
        if media_type == 'image':
            anomalies = [
                "Unnatural noise distribution",
                "Facial outline pixel blending",
                "Inconsistent specular reflections"
            ]
        elif media_type == 'video':
            anomalies = [
                "Facial boundary artifact",
                "Temporal jitter",
                "Lip-sync mismatch"
            ]
        else: # audio
            anomalies = [
                "Synthetic cadence",
                "Neural vocoder frequency artifact",
                "Abnormal phase coherence"
            ]
            
    # Randomize anomalies/details subset deterministically
    if anomalies:
        anomalies = rng.sample(anomalies, rng.randint(1, len(anomalies)))
        
    return {
        "is_fake": is_fake,
        "confidence_score": round(base_confidence, 2),
        "anomalies": anomalies,
        "rng": rng
    }

def analyze_image(filename: str, content: bytes):
    """Simulates deepfake detection on an image using EfficientNet/ViT mocks."""
    # Efficient processing time
    time.sleep(0.15)
    
    forensics = determine_forensics(filename, content, 'image')
    is_fake = forensics["is_fake"]
    confidence = forensics["confidence_score"]
    anomalies = forensics["anomalies"]
    rng = forensics["rng"]
    
    return {
        "is_fake": is_fake,
        "confidence_score": confidence,
        "model_used": "EfficientNet-B4 + ViT Ensemble",
        "analysis_time_ms": rng.randint(80, 150),
        "anomalies_detected": anomalies,
        "manipulated_regions": [
            {"region": "eyes", "suspicion_score": round(rng.uniform(70.0, 99.9), 2)} if is_fake else None,
            {"region": "mouth", "suspicion_score": round(rng.uniform(70.0, 99.9), 2)} if is_fake else None
        ]
    }

def analyze_video(filename: str, content: bytes):
    """Simulates deepfake detection on a video using CNN+LSTM mocks."""
    # Efficient processing time
    time.sleep(0.3)
    
    forensics = determine_forensics(filename, content, 'video')
    is_fake = forensics["is_fake"]
    confidence = forensics["confidence_score"]
    anomalies = forensics["anomalies"]
    rng = forensics["rng"]
    
    # Mock frame-by-frame analysis
    num_frames = 10
    frame_analysis = []
    for i in range(num_frames):
        score = rng.uniform(70.0, 99.0) if is_fake and i > 3 and i < 8 else rng.uniform(0.0, 30.0)
        frame_analysis.append({"time_sec": i * 0.5, "score": round(score, 2)})
        
    return {
        "is_fake": is_fake,
        "confidence_score": confidence,
        "model_used": "TimeSformer + XceptionNet",
        "analysis_time_ms": rng.randint(250, 400),
        "anomalies_detected": anomalies or (["lip-sync mismatch", "facial artifact"] if is_fake else []),
        "timeline": frame_analysis
    }

def analyze_audio(filename: str, content: bytes):
    """Simulates deepfake audio detection using Wav2Vec 2.0 mock."""
    # Efficient processing time
    time.sleep(0.2)
    
    forensics = determine_forensics(filename, content, 'audio')
    is_fake = forensics["is_fake"]
    confidence = forensics["confidence_score"]
    anomalies = forensics["anomalies"]
    rng = forensics["rng"]
    
    return {
        "is_fake": is_fake,
        "confidence_score": confidence,
        "model_used": "Wav2Vec 2.0 + Whisper Embeddings",
        "analysis_time_ms": rng.randint(150, 250),
        "anomalies_detected": anomalies or (["synthetic cadence", "frequency artifact"] if is_fake else [])
    }
