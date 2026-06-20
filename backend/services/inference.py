"""
DeepGuard Inference Service — Real forensic analysis for deepfake detection.

Replaces the previous mock_inference.py with actual forensic techniques.
- Image: Full forensic ensemble (ELA + FFT + Face + EXIF)
- Video: Frame sampling + per-frame forensic analysis
- Audio: Basic spectral heuristics (clearly labeled as such)
"""

import struct
import time
import logging
from io import BytesIO
from typing import List, Optional

import numpy as np
from PIL import Image

from services.forensic_analyzer import ForensicEnsemble

logger = logging.getLogger(__name__)

# Singleton ensemble instance (lazy init for MediaPipe)
_ensemble: Optional[ForensicEnsemble] = None

def _get_ensemble() -> ForensicEnsemble:
    global _ensemble
    if _ensemble is None:
        _ensemble = ForensicEnsemble()
    return _ensemble


def analyze_image(filename: str, content: bytes) -> dict:
    """
    Run real forensic analysis on an image.
    Uses ELA, frequency analysis, face landmark detection, and EXIF inspection.
    """
    start_time = time.time()
    
    try:
        img = Image.open(BytesIO(content))
    except Exception as e:
        logger.error(f"Failed to open image '{filename}': {e}")
        return {
            "is_fake": False,
            "confidence_score": 0.0,
            "model_used": "Forensic Ensemble (ELA + FFT + FaceMesh + EXIF)",
            "analysis_time_ms": 0,
            "anomalies_detected": [],
            "manipulated_regions": [],
            "error": f"Could not open image: {str(e)}"
        }

    ensemble = _get_ensemble()
    result = ensemble.analyze(img)

    elapsed_ms = int((time.time() - start_time) * 1000)

    # Build manipulated_regions from face analysis if detected
    manipulated_regions = []
    face_data = result["technique_scores"]["face"]
    if face_data["face_detected"] and face_data["score"] > 0.2:
        details = face_data["details"]
        if details.get("eye_asymmetry", 0) > 0.1 or details.get("eye_asymmetry", 1) < 0.01:
            manipulated_regions.append({
                "region": "eyes",
                "suspicion_score": round(face_data["score"] * 100, 2)
            })
        if details.get("mouth_asymmetry", 0) > 0.1 or details.get("mouth_asymmetry", 1) < 0.01:
            manipulated_regions.append({
                "region": "mouth",
                "suspicion_score": round(face_data["score"] * 100, 2)
            })
        if details.get("boundary_sharpness", 0) > 40:
            manipulated_regions.append({
                "region": "face_boundary",
                "suspicion_score": round(min(details["boundary_sharpness"] / 80 * 100, 99.9), 2)
            })

    return {
        "is_fake": result["is_fake"],
        "confidence_score": result["confidence_score"],
        "model_used": "Forensic Ensemble (ELA + FFT + FaceMesh + EXIF)",
        "analysis_time_ms": elapsed_ms,
        "anomalies_detected": result["anomalies"],
        "manipulated_regions": manipulated_regions,
        "technique_scores": {
            k: {"score": round(v["score"], 3), "weight": v["weight"]}
            for k, v in result["technique_scores"].items()
        },
        "combined_score": result["combined_score"],
        "threshold": result["threshold"]
    }


def analyze_video(filename: str, content: bytes) -> dict:
    """
    Run forensic analysis on a video by extracting and analyzing key frames.
    Uses OpenCV to extract frames, then runs the image forensic pipeline on each.
    """
    start_time = time.time()

    try:
        import cv2
        import tempfile
        import os

        # Write video to a temp file for OpenCV (it needs a file path)
        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
                tmp.write(content)
                temp_path = tmp.name

            cap = cv2.VideoCapture(temp_path)
            if not cap.isOpened():
                raise RuntimeError("OpenCV could not open the video file")

            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

            # Sample up to 8 evenly-spaced frames
            num_samples = min(8, max(1, total_frames))
            if total_frames > 0:
                sample_indices = np.linspace(0, total_frames - 1, num_samples, dtype=int)
            else:
                sample_indices = [0]

            ensemble = _get_ensemble()
            frame_results = []
            all_anomalies = []
            fake_frame_count = 0

            for frame_idx in sample_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, int(frame_idx))
                ret, frame = cap.read()
                if not ret:
                    continue

                # Convert BGR → RGB → PIL Image
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_img = Image.fromarray(frame_rgb)

                result = ensemble.analyze(pil_img)
                time_sec = round(float(frame_idx) / fps, 2)
                
                frame_results.append({
                    "time_sec": time_sec,
                    "score": round(result["combined_score"] * 100, 2),
                    "is_fake": result["is_fake"]
                })

                if result["is_fake"]:
                    fake_frame_count += 1

                all_anomalies.extend(result["anomalies"])

            cap.release()
        finally:
            if temp_path and os.path.exists(temp_path):
                os.unlink(temp_path)

        # Aggregate: if more than half of sampled frames are suspicious → fake
        is_fake = fake_frame_count > len(frame_results) / 2
        
        # Confidence from the proportion of fake frames
        if frame_results:
            avg_score = np.mean([fr["score"] for fr in frame_results])
            if is_fake:
                confidence = 50.0 + min(avg_score, 50.0)
            else:
                confidence = 50.0 + min(100 - avg_score, 50.0)
        else:
            confidence = 50.0

        elapsed_ms = int((time.time() - start_time) * 1000)

        # Deduplicate anomalies
        unique_anomalies = list(dict.fromkeys(all_anomalies))[:6]

        return {
            "is_fake": is_fake,
            "confidence_score": round(confidence, 2),
            "model_used": "Forensic Ensemble (Frame Sampling + ELA + FFT + FaceMesh)",
            "analysis_time_ms": elapsed_ms,
            "anomalies_detected": unique_anomalies,
            "timeline": frame_results,
            "frames_analyzed": len(frame_results),
            "fake_frames": fake_frame_count
        }

    except ImportError:
        logger.warning("OpenCV not available — falling back to thumbnail analysis")
        elapsed_ms = int((time.time() - start_time) * 1000)
        return {
            "is_fake": False,
            "confidence_score": 50.0,
            "model_used": "Forensic Ensemble (Limited — OpenCV not installed)",
            "analysis_time_ms": elapsed_ms,
            "anomalies_detected": ["Video analysis requires OpenCV (pip install opencv-python)"],
            "timeline": [],
            "frames_analyzed": 0,
            "fake_frames": 0
        }
    except Exception as e:
        logger.error(f"Video analysis failed for '{filename}': {e}")
        elapsed_ms = int((time.time() - start_time) * 1000)
        return {
            "is_fake": False,
            "confidence_score": 50.0,
            "model_used": "Forensic Ensemble (Error)",
            "analysis_time_ms": elapsed_ms,
            "anomalies_detected": [f"Analysis error: {str(e)}"],
            "timeline": [],
            "frames_analyzed": 0,
            "fake_frames": 0
        }


def analyze_audio(filename: str, content: bytes) -> dict:
    """
    Basic audio spectral analysis.
    
    NOTE: Real audio deepfake detection requires large specialized models 
    (Wav2Vec 2.0, ~300MB+). This implementation uses basic spectral heuristics
    and is clearly labeled as such.
    """
    start_time = time.time()

    try:
        # Attempt to parse WAV header for basic spectral analysis
        # WAV format: RIFF header → fmt chunk → data chunk
        anomalies = []
        score = 0.0

        if len(content) < 44:
            return _audio_fallback("File too small for audio analysis", start_time)

        # Check for WAV RIFF header
        is_wav = content[:4] == b'RIFF' and content[8:12] == b'WAVE'
        
        if is_wav:
            # Parse WAV header
            try:
                # fmt chunk starts at byte 12
                channels = struct.unpack('<H', content[22:24])[0] if len(content) > 24 else 0
                sample_rate = struct.unpack('<I', content[24:28])[0] if len(content) > 28 else 0
                bits_per_sample = struct.unpack('<H', content[34:36])[0] if len(content) > 36 else 0

                # Find data chunk
                data_start = 44  # Standard WAV data starts here
                if len(content) > data_start + 1000:
                    # Extract audio samples
                    if bits_per_sample == 16:
                        audio_data = np.frombuffer(content[data_start:data_start + min(len(content) - data_start, 88200)], dtype=np.int16).astype(np.float64)
                    elif bits_per_sample == 8:
                        audio_data = np.frombuffer(content[data_start:data_start + min(len(content) - data_start, 44100)], dtype=np.uint8).astype(np.float64) - 128
                    else:
                        audio_data = None

                    if audio_data is not None and len(audio_data) > 100:
                        # Compute FFT
                        spectrum = np.abs(np.fft.rfft(audio_data))
                        freqs = np.fft.rfftfreq(len(audio_data), d=1.0/sample_rate)

                        # Check for unnaturally sharp high-frequency cutoff (vocoder artifact)
                        if len(spectrum) > 100:
                            high_band = spectrum[len(spectrum)*3//4:]
                            low_band = spectrum[len(spectrum)//4:len(spectrum)//2]
                            
                            if np.mean(low_band) > 0:
                                hf_ratio = np.mean(high_band) / np.mean(low_band)
                                if hf_ratio < 0.01:
                                    score += 0.3
                                    anomalies.append("Sharp high-frequency cutoff (possible vocoder artifact)")
                            
                            # Check for unnaturally smooth spectrum (natural speech has roughness)
                            spectrum_diff = np.diff(spectrum[10:len(spectrum)//2])
                            roughness = np.std(spectrum_diff) / (np.mean(np.abs(spectrum_diff)) + 1e-10)
                            if roughness < 0.8:
                                score += 0.3
                                anomalies.append(f"Unnaturally smooth spectral envelope (roughness={roughness:.2f})")

            except Exception as parse_err:
                logger.warning(f"WAV parse error: {parse_err}")

        else:
            # Non-WAV audio (MP3, WebM, etc.) — limited analysis
            anomalies.append("Non-WAV format — limited spectral analysis available")
            # Check file size vs duration heuristics
            if len(content) < 1000:
                score += 0.1
                anomalies.append("Very small audio file — insufficient data for analysis")



        elapsed_ms = int((time.time() - start_time) * 1000)
        is_fake = score >= 0.45

        return {
            "is_fake": is_fake,
            "confidence_score": round(50.0 + score * 50.0, 2) if is_fake else round(50.0 + (0.45 - score) / 0.45 * 50.0, 2),
            "model_used": "Spectral Heuristics (Basic Analysis)",
            "analysis_time_ms": elapsed_ms,
            "anomalies_detected": anomalies,
            "note": "Audio deepfake detection uses basic spectral heuristics. For production accuracy, a specialized model like Wav2Vec 2.0 is recommended."
        }

    except Exception as e:
        logger.error(f"Audio analysis failed for '{filename}': {e}")
        return _audio_fallback(str(e), start_time)


def _audio_fallback(reason: str, start_time: float) -> dict:
    """Fallback response when audio analysis can't proceed."""

    elapsed_ms = int((time.time() - start_time) * 1000)
    return {
        "is_fake": False,
        "confidence_score": 50.0,
        "model_used": "Spectral Heuristics (Limited)",
        "analysis_time_ms": elapsed_ms,
        "anomalies_detected": [f"Analysis limited: {reason}"],
        "note": "Could not perform full spectral analysis."
    }
