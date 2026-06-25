"""
DeepGuard Forensic Analyzer — Real image forensics for deepfake detection.

Implements four complementary analysis techniques:
1. ELA  (Error Level Analysis)  — detects JPEG re-compression artifacts
2. FFT  (Frequency Domain)      — detects GAN spectral fingerprints
3. Face (Landmark Analysis)     — detects unnatural facial geometry (requires mediapipe)
4. EXIF (Metadata Inspection)   — checks for authentic camera metadata

Each technique produces a suspicion score in [0.0, 1.0].
The ForensicEnsemble combines them via weighted average for a final verdict.

Note: mediapipe (Face analysis) is optional. When not installed (e.g. Vercel serverless),
the ensemble falls back to ELA + FFT + EXIF weights automatically.
"""

import io
import math
import struct
import logging
from typing import Optional

import numpy as np
from PIL import Image, ImageChops
from PIL.ExifTags import TAGS

logger = logging.getLogger(__name__)

# Check mediapipe availability at import time
try:
    import mediapipe as _mp_check  # noqa: F401
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    logger.info("mediapipe not available — face landmark analysis will be skipped")

# ---------------------------------------------------------------------------
#  1. Error Level Analysis (ELA)
# ---------------------------------------------------------------------------

class ELAAnalyzer:
    """
    Re-saves the image at a known JPEG quality level and compares with the
    original. Authentic photos have uniform, low error levels. Manipulated
    or AI-generated images show abnormal error distributions.
    """

    RESAVE_QUALITY = 90  # JPEG quality for re-compression
    # Thresholds calibrated for typical consumer camera images
    HIGH_ELA_THRESHOLD = 18.0   # mean error above this → suspicious
    LOW_STD_THRESHOLD  = 4.0    # very uniform error → GAN smoothness

    def analyze(self, img: Image.Image) -> dict:
        """Return a suspicion score and detail dict."""
        try:
            img_rgb = img.convert("RGB")

            # Re-save at known quality
            buffer = io.BytesIO()
            img_rgb.save(buffer, format="JPEG", quality=self.RESAVE_QUALITY)
            buffer.seek(0)
            resaved = Image.open(buffer).convert("RGB")

            # Pixel-level difference
            diff = ImageChops.difference(img_rgb, resaved)
            diff_arr = np.array(diff, dtype=np.float64)

            mean_err = float(np.mean(diff_arr))
            std_err  = float(np.std(diff_arr))
            max_err  = float(np.max(diff_arr))

            # Score: higher → more suspicious
            # Genuine photos: low mean, moderate std (natural noise)
            # Manipulated:    high mean in edited regions, or unnaturally low std (GAN)
            score = 0.0
            anomalies = []

            if mean_err > self.HIGH_ELA_THRESHOLD:
                score += 0.5
                anomalies.append(f"High mean ELA error ({mean_err:.1f})")
            
            if std_err < self.LOW_STD_THRESHOLD and mean_err > 5.0:
                # Unnaturally uniform error — suggests synthetic/GAN image
                score += 0.3
                anomalies.append(f"Unnaturally uniform error distribution (std={std_err:.1f})")

            if max_err > 200:
                score += 0.2
                anomalies.append(f"Extreme local error spike ({max_err:.0f})")

            score = min(score, 1.0)

            return {
                "score": score,
                "mean_error": round(mean_err, 2),
                "std_error": round(std_err, 2),
                "max_error": round(max_err, 2),
                "anomalies": anomalies
            }
        except Exception as e:
            logger.warning(f"ELA analysis failed: {e}")
            return {"score": 0.0, "mean_error": 0, "std_error": 0, "max_error": 0, "anomalies": []}


# ---------------------------------------------------------------------------
#  2. Frequency Domain Analysis (FFT)
# ---------------------------------------------------------------------------

class FrequencyAnalyzer:
    """
    Applies 2D FFT to detect GAN spectral artifacts.
    GANs (especially DCGAN, StyleGAN) leave characteristic periodic patterns
    in the frequency domain due to upsampling layers (transposed convolutions).
    """

    def analyze(self, img: Image.Image) -> dict:
        """Return a suspicion score based on frequency spectrum analysis."""
        try:
            # Convert to grayscale and resize to standard dimensions for consistent analysis
            gray = np.array(img.convert("L").resize((256, 256)), dtype=np.float64)

            # Apply 2D FFT
            f_transform = np.fft.fft2(gray)
            f_shift = np.fft.fftshift(f_transform)
            magnitude = np.log1p(np.abs(f_shift))

            h, w = magnitude.shape
            cy, cx = h // 2, w // 2

            # Analyze radial power distribution
            # Natural images: power falls off smoothly with frequency (1/f law)
            # GAN images: periodic spikes in mid/high frequencies
            
            # Create radial bins
            Y, X = np.ogrid[:h, :w]
            radius = np.sqrt((X - cx)**2 + (Y - cy)**2).astype(int)
            max_radius = min(cy, cx)

            radial_mean = np.zeros(max_radius)
            for r in range(max_radius):
                mask = radius == r
                if np.any(mask):
                    radial_mean[r] = np.mean(magnitude[mask])

            # Check for spectral anomalies
            anomalies = []
            score = 0.0

            # 1. Check if high-frequency energy is abnormally high
            if max_radius > 20:
                low_freq_energy = np.mean(radial_mean[1:max_radius // 4])
                high_freq_energy = np.mean(radial_mean[max_radius // 2:])
                
                if low_freq_energy > 0:
                    ratio = high_freq_energy / low_freq_energy
                else:
                    ratio = 0.0

                # Natural images: ratio << 1 (power decays with frequency)
                # GAN images: ratio is higher due to spectral artifacts
                if ratio > 0.6:
                    score += 0.4
                    anomalies.append(f"Abnormal high-frequency energy ratio ({ratio:.2f})")
                elif ratio > 0.45:
                    score += 0.2
                    anomalies.append(f"Elevated high-frequency energy ({ratio:.2f})")

            # 2. Check for periodic spikes (GAN checkerboard artifacts)
            if len(radial_mean) > 10:
                # Compute differences between consecutive radial bins
                diffs = np.diff(radial_mean[5:])  # skip DC and very low freq
                if len(diffs) > 0:
                    spike_count = np.sum(np.abs(diffs) > 2.0 * np.std(diffs))
                    spike_ratio = spike_count / len(diffs)
                    
                    if spike_ratio > 0.15:
                        score += 0.4
                        anomalies.append(f"Periodic spectral spikes detected ({spike_count} peaks)")
                    elif spike_ratio > 0.08:
                        score += 0.2
                        anomalies.append(f"Minor spectral irregularities ({spike_count} peaks)")

            score = min(score, 1.0)

            return {
                "score": score,
                "anomalies": anomalies,
                "high_freq_ratio": round(ratio if 'ratio' in dir() else 0.0, 3)
            }
        except Exception as e:
            logger.warning(f"Frequency analysis failed: {e}")
            return {"score": 0.0, "anomalies": [], "high_freq_ratio": 0.0}


# ---------------------------------------------------------------------------
#  3. Face Landmark Analysis (MediaPipe)
# ---------------------------------------------------------------------------

class FaceLandmarkAnalyzer:
    """
    Uses MediaPipe FaceLandmarker (Tasks API) to detect 478 facial landmarks
    and checks for unnatural geometry, asymmetry, and boundary artifacts
    that indicate face-swap or GAN-generated faces.

    When mediapipe is not installed (e.g. on Vercel serverless), this analyzer
    gracefully returns a score of 0.0 and marks itself as unavailable. The
    ForensicEnsemble will automatically redistribute its weight to ELA/FFT/EXIF.
    """

    def __init__(self):
        self._face_landmarker = None
        self._model_path = None

    def _get_model_path(self) -> Optional[str]:
        """Find the face_landmarker.task model file."""
        if self._model_path is not None:
            return self._model_path

        import os
        this_dir = os.path.dirname(os.path.abspath(__file__))
        candidates = [
            os.path.join(this_dir, "face_landmarker.task"),
            os.path.join(this_dir, "..", "models", "face_landmarker.task"),
            os.path.join(this_dir, "..", "face_landmarker.task"),
        ]
        for path in candidates:
            if os.path.exists(path):
                self._model_path = path
                return path
        return None

    def _get_landmarker(self):
        """Lazy-load MediaPipe FaceLandmarker to avoid startup overhead."""
        if self._face_landmarker is None:
            model_path = self._get_model_path()
            if model_path is None:
                raise FileNotFoundError(
                    "face_landmarker.task model not found. "
                    "Download it from: https://storage.googleapis.com/mediapipe-models/"
                    "face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
                )

            import mediapipe as mp
            from mediapipe.tasks.python import vision

            base_options = mp.tasks.BaseOptions(model_asset_path=model_path)
            options = vision.FaceLandmarkerOptions(
                base_options=base_options,
                num_faces=1,
                min_face_detection_confidence=0.5,
                min_face_presence_confidence=0.5,
            )
            self._face_landmarker = vision.FaceLandmarker.create_from_options(options)
        return self._face_landmarker

    def analyze(self, img: Image.Image) -> dict:
        """Return a suspicion score based on facial landmark analysis."""
        # Graceful degradation when mediapipe is not installed
        if not MEDIAPIPE_AVAILABLE:
            return {
                "score": 0.0,
                "face_detected": False,
                "anomalies": [],
                "detail": "mediapipe not available in this environment"
            }

        try:
            import mediapipe as mp

            img_rgb = img.convert("RGB")
            img_arr = np.array(img_rgb)

            landmarker = self._get_landmarker()

            # Convert to MediaPipe Image format
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_arr)
            results = landmarker.detect(mp_image)

            if not results.face_landmarks:
                # No face detected — can't analyze facial geometry
                return {
                    "score": 0.0,
                    "face_detected": False,
                    "anomalies": [],
                    "detail": "No face detected in image"
                }

            face_landmarks = results.face_landmarks[0]
            h, w = img_arr.shape[:2]

            # Extract key landmark positions (normalized → pixel coords)
            pts = []
            for lm in face_landmarks:
                pts.append((lm.x * w, lm.y * h))

            anomalies = []
            score = 0.0

            # --- Symmetry Analysis ---
            # Key symmetric pairs in MediaPipe Face Mesh:
            # Left eye outer: 33, Right eye outer: 263
            # Left mouth corner: 61, Right mouth corner: 291
            # Nose tip: 1, Chin: 152

            if len(pts) < 468:
                return {"score": 0.0, "face_detected": True, "anomalies": [], "detail": "Insufficient landmarks"}

            nose_tip = np.array(pts[1])
            left_eye_outer  = np.array(pts[33])
            right_eye_outer = np.array(pts[263])
            left_mouth  = np.array(pts[61])
            right_mouth = np.array(pts[291])
            chin = np.array(pts[152])
            forehead_approx = np.array(pts[10])

            # Face height
            face_height = np.linalg.norm(forehead_approx - chin)
            if face_height < 10:
                return {"score": 0.0, "face_detected": True, "anomalies": [], "detail": "Face too small"}

            # Eye distance symmetry relative to nose
            left_eye_dist  = np.linalg.norm(left_eye_outer - nose_tip) / face_height
            right_eye_dist = np.linalg.norm(right_eye_outer - nose_tip) / face_height
            eye_asymmetry  = abs(left_eye_dist - right_eye_dist) / max(left_eye_dist, right_eye_dist, 0.001)

            # Mouth symmetry
            left_mouth_dist  = np.linalg.norm(left_mouth - nose_tip) / face_height
            right_mouth_dist = np.linalg.norm(right_mouth - nose_tip) / face_height
            mouth_asymmetry  = abs(left_mouth_dist - right_mouth_dist) / max(left_mouth_dist, right_mouth_dist, 0.001)

            # Natural faces have some asymmetry (0.02–0.08);
            # deepfakes can be too symmetric (< 0.01) or too asymmetric (> 0.12)
            if eye_asymmetry < 0.01 or eye_asymmetry > 0.15:
                score += 0.25
                if eye_asymmetry < 0.01:
                    anomalies.append("Unnaturally perfect eye symmetry")
                else:
                    anomalies.append(f"Excessive eye asymmetry ({eye_asymmetry:.3f})")

            if mouth_asymmetry < 0.01 or mouth_asymmetry > 0.15:
                score += 0.25
                if mouth_asymmetry < 0.01:
                    anomalies.append("Unnaturally perfect mouth symmetry")
                else:
                    anomalies.append(f"Excessive mouth asymmetry ({mouth_asymmetry:.3f})")

            # --- Boundary Analysis ---
            # Check for color discontinuities along the face boundary
            jaw_indices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
                          397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
                          172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]

            boundary_diffs = []
            for idx in jaw_indices:
                if idx >= len(pts):
                    continue
                px, py = int(pts[idx][0]), int(pts[idx][1])
                # Sample inside and outside the boundary
                for offset in [3, 5]:
                    # Inside (toward center)
                    ix = min(max(int(px + (nose_tip[0] - px) * 0.05), 0), w - 1)
                    iy = min(max(int(py + (nose_tip[1] - py) * 0.05), 0), h - 1)
                    # Outside (away from center)
                    ox = min(max(int(px - (nose_tip[0] - px) * 0.05), 0), w - 1)
                    oy = min(max(int(py - (nose_tip[1] - py) * 0.05), 0), h - 1)

                    inside_color  = img_arr[iy, ix].astype(float)
                    outside_color = img_arr[oy, ox].astype(float)
                    diff = np.linalg.norm(inside_color - outside_color)
                    boundary_diffs.append(diff)

            if boundary_diffs:
                mean_boundary_diff = np.mean(boundary_diffs)
                # Very sharp boundary transitions suggest face pasting
                if mean_boundary_diff > 60:
                    score += 0.3
                    anomalies.append(f"Sharp face boundary transitions (avg diff={mean_boundary_diff:.1f})")
                elif mean_boundary_diff > 40:
                    score += 0.15
                    anomalies.append(f"Moderate face boundary artifacts (avg diff={mean_boundary_diff:.1f})")

            score = min(score, 1.0)

            return {
                "score": score,
                "face_detected": True,
                "eye_asymmetry": round(eye_asymmetry, 4),
                "mouth_asymmetry": round(mouth_asymmetry, 4),
                "boundary_sharpness": round(np.mean(boundary_diffs) if boundary_diffs else 0.0, 2),
                "anomalies": anomalies
            }
        except Exception as e:
            logger.warning(f"Face landmark analysis failed: {e}")
            return {"score": 0.0, "face_detected": False, "anomalies": [], "detail": str(e)}


# ---------------------------------------------------------------------------
#  4. EXIF / Metadata Analysis
# ---------------------------------------------------------------------------

class MetadataAnalyzer:
    """
    Inspects EXIF metadata. Authentic camera photos have rich EXIF data
    (camera make/model, focal length, GPS, timestamps). AI-generated images
    typically have no EXIF or only software tags.
    """

    # Tags that indicate a real camera captured the image
    CAMERA_TAGS = {"Make", "Model", "FocalLength", "ExposureTime", "ISOSpeedRatings",
                   "FNumber", "Flash", "LensModel", "LensMake"}
    # Tags that suggest software creation/editing
    SOFTWARE_TAGS = {"Software", "ProcessingSoftware", "HostComputer"}

    def analyze(self, img: Image.Image) -> dict:
        """Return a suspicion score based on EXIF metadata."""
        try:
            exif_data = img.getexif()
            
            if not exif_data:
                # No EXIF at all — suspicious for JPEGs, normal for PNGs
                format_name = img.format or "unknown"
                if format_name.upper() in ("JPEG", "JPG"):
                    return {
                        "score": 0.4,
                        "has_exif": False,
                        "anomalies": ["JPEG image with no EXIF data — possible synthetic origin"],
                        "tags_found": []
                    }
                else:
                    # PNG, BMP, WebP etc. normally don't have EXIF
                    return {
                        "score": 0.1,
                        "has_exif": False,
                        "anomalies": [],
                        "tags_found": [],
                        "detail": f"{format_name} format — EXIF not expected"
                    }

            # Decode tag names
            decoded_tags = {}
            for tag_id, value in exif_data.items():
                tag_name = TAGS.get(tag_id, str(tag_id))
                decoded_tags[tag_name] = str(value)[:100]  # truncate long values

            found_camera_tags = self.CAMERA_TAGS.intersection(decoded_tags.keys())
            found_software_tags = self.SOFTWARE_TAGS.intersection(decoded_tags.keys())

            anomalies = []
            score = 0.0

            if found_camera_tags:
                # Has camera tags — strong indicator of authenticity
                score -= 0.3  # reduce suspicion
            
            if found_software_tags:
                sw_value = decoded_tags.get("Software", "")
                suspicious_sw = ["photoshop", "gimp", "canva", "stable diffusion",
                                "midjourney", "dall-e", "comfyui", "automatic1111"]
                if any(s in sw_value.lower() for s in suspicious_sw):
                    score += 0.5
                    anomalies.append(f"Suspicious software tag: {sw_value}")
                else:
                    score += 0.1
                    anomalies.append(f"Software tag present: {sw_value}")

            if not found_camera_tags and not found_software_tags:
                score += 0.2
                anomalies.append("EXIF present but no camera or software identification")

            score = max(0.0, min(score, 1.0))

            return {
                "score": score,
                "has_exif": True,
                "camera_tags": list(found_camera_tags),
                "software_tags": list(found_software_tags),
                "anomalies": anomalies,
                "tags_found": list(decoded_tags.keys())[:15]  # limit output size
            }
        except Exception as e:
            logger.warning(f"Metadata analysis failed: {e}")
            return {"score": 0.0, "has_exif": False, "anomalies": [], "tags_found": []}


# ---------------------------------------------------------------------------
#  5. Forensic Ensemble
# ---------------------------------------------------------------------------

class ForensicEnsemble:
    """
    Combines all four analyzers with configurable weights.
    Produces a final verdict, confidence score, and per-technique breakdown.
    """

    DEFAULT_WEIGHTS = {
        "ela": 0.30,
        "frequency": 0.30,
        "face": 0.25,
        "metadata": 0.15
    }

    # If face detection fails, redistribute its weight
    NO_FACE_WEIGHTS = {
        "ela": 0.40,
        "frequency": 0.40,
        "face": 0.00,
        "metadata": 0.20
    }

    FAKE_THRESHOLD = 0.45  # Combined score above this → classified as fake

    def __init__(self):
        self.ela_analyzer = ELAAnalyzer()
        self.freq_analyzer = FrequencyAnalyzer()
        self.face_analyzer = FaceLandmarkAnalyzer()
        self.meta_analyzer = MetadataAnalyzer()

    def analyze(self, img: Image.Image) -> dict:
        """
        Run all forensic techniques and produce a combined verdict.
        
        Returns:
            dict with is_fake, confidence_score, technique_scores, anomalies, etc.
        """
        # Run each analyzer
        ela_result  = self.ela_analyzer.analyze(img)
        freq_result = self.freq_analyzer.analyze(img)
        face_result = self.face_analyzer.analyze(img)
        meta_result = self.meta_analyzer.analyze(img)

        # Select weights based on whether face was detected
        face_detected = face_result.get("face_detected", False)
        weights = self.DEFAULT_WEIGHTS if face_detected else self.NO_FACE_WEIGHTS

        # Weighted combination
        combined_score = (
            weights["ela"]       * ela_result["score"] +
            weights["frequency"] * freq_result["score"] +
            weights["face"]      * face_result["score"] +
            weights["metadata"]  * meta_result["score"]
        )

        is_fake = combined_score >= self.FAKE_THRESHOLD

        # Confidence: how sure we are of the verdict
        # Map the distance from the threshold to a 0–100% confidence
        if is_fake:
            # Score above threshold → confidence rises as score increases
            confidence = 50.0 + (combined_score - self.FAKE_THRESHOLD) / (1.0 - self.FAKE_THRESHOLD) * 50.0
        else:
            # Score below threshold → confidence rises as score decreases
            confidence = 50.0 + (self.FAKE_THRESHOLD - combined_score) / self.FAKE_THRESHOLD * 50.0

        confidence = round(min(max(confidence, 50.0), 99.9), 2)

        # Collect all anomalies
        all_anomalies = (
            ela_result.get("anomalies", []) +
            freq_result.get("anomalies", []) +
            face_result.get("anomalies", []) +
            meta_result.get("anomalies", [])
        )

        return {
            "is_fake": is_fake,
            "confidence_score": confidence,
            "combined_score": round(combined_score, 4),
            "threshold": self.FAKE_THRESHOLD,
            "anomalies": all_anomalies,
            "technique_scores": {
                "ela": {
                    "score": ela_result["score"],
                    "weight": weights["ela"],
                    "details": ela_result
                },
                "frequency": {
                    "score": freq_result["score"],
                    "weight": weights["frequency"],
                    "details": freq_result
                },
                "face": {
                    "score": face_result["score"],
                    "weight": weights["face"],
                    "face_detected": face_detected,
                    "details": face_result
                },
                "metadata": {
                    "score": meta_result["score"],
                    "weight": weights["metadata"],
                    "details": meta_result
                }
            }
        }
