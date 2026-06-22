"""
DeepGuard Chatbot Service — Gemini API with smart local fallback.

Tries Google Gemini API with multiple model fallbacks.
If all API calls fail (quota exhausted, network error, etc.),
falls back to a local knowledge-based response system that
answers deepfake and platform-related questions intelligently.
"""

import os
import re
import json
import time
import logging
import httpx

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODELS = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
]
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"

SYSTEM_PROMPT = (
    "You are DeepGuard AI Assistant, a helpful chatbot for a deepfake detection platform. "
    "You help users understand deepfake detection, explain forensic analysis results, "
    "and answer questions about media authenticity. Keep responses concise and helpful."
)

# ---------------------------------------------------------------------------
# Local knowledge base (used when the API is unavailable)
# ---------------------------------------------------------------------------
KNOWLEDGE_BASE = [
    {
        "keywords": ["what", "deepfake", "deep fake", "what is"],
        "response": (
            "A deepfake is synthetic media created using artificial intelligence — typically deep learning — "
            "to convincingly alter or generate visual and audio content. Common techniques include face-swapping "
            "(e.g., DeepFaceLab), voice cloning, and lip-sync manipulation. DeepGuard uses forensic AI to detect these."
        ),
    },
    {
        "keywords": ["how", "detect", "detection", "work", "does it work"],
        "response": (
            "DeepGuard uses a multi-layer forensic ensemble:\n"
            "• **ELA (Error Level Analysis)** — detects compression inconsistencies\n"
            "• **FFT (Frequency Analysis)** — identifies unnatural spectral patterns\n"
            "• **FaceMesh Landmark Detection** — checks facial geometry for asymmetries\n"
            "• **EXIF Metadata Inspection** — flags stripped or inconsistent metadata\n"
            "Upload an image, video, or audio file to the Scanner to try it out!"
        ),
    },
    {
        "keywords": ["upload", "scan", "analyze", "how to", "use"],
        "response": (
            "To scan media for deepfakes:\n"
            "1. Go to the **Scanner** page from the navigation bar\n"
            "2. Drag & drop or click to upload an image, video, or audio file\n"
            "3. Click **Run AI Analysis** to start the forensic scan\n"
            "4. View the results and detailed report with download options"
        ),
    },
    {
        "keywords": ["report", "download", "pdf", "json"],
        "response": (
            "After each scan, DeepGuard generates a detailed forensic report. You can:\n"
            "• **Download PDF** — a visual report with all findings\n"
            "• **Download JSON Log** — raw forensic data for technical analysis\n"
            "Access reports from the Overview page or directly after a scan."
        ),
    },
    {
        "keywords": ["accuracy", "reliable", "accurate", "trust", "confidence"],
        "response": (
            "DeepGuard's forensic ensemble combines multiple detection techniques. "
            "The confidence score reflects the weighted consensus of all analyzers. "
            "Scores above 70% indicate strong evidence of manipulation. Scores below 30% "
            "suggest the media is likely authentic. Results between 30-70% are inconclusive "
            "and may need manual expert review."
        ),
    },
    {
        "keywords": ["video", "webcam", "live", "camera", "record"],
        "response": (
            "DeepGuard supports live webcam detection! On the Scanner page, click "
            "**Live Webcam** to activate your camera. You can:\n"
            "• **Analyze Live Feed** — instant frame capture & analysis\n"
            "• **Capture Photo** — take a snapshot for forensic scanning\n"
            "• **Record Video** — record a clip and analyze it for deepfake artifacts"
        ),
    },
    {
        "keywords": ["audio", "voice", "clone", "speech"],
        "response": (
            "DeepGuard can analyze audio files for voice cloning artifacts using spectral heuristics. "
            "It checks for unnatural high-frequency cutoffs (vocoder signatures) and overly smooth "
            "spectral envelopes that are characteristic of AI-generated speech. Upload a WAV file "
            "for the most accurate analysis."
        ),
    },
    {
        "keywords": ["hello", "hi", "hey", "greet", "good"],
        "response": "Hello! 👋 I'm your DeepGuard AI Assistant. How can I help you with deepfake detection today?",
    },
    {
        "keywords": ["thank", "thanks", "great", "awesome", "cool"],
        "response": "You're welcome! Feel free to ask if you have any more questions about deepfake detection. 🛡️",
    },
    {
        "keywords": ["president", "political", "politician", "news", "celebrity"],
        "response": (
            "Deepfakes of public figures like politicians and celebrities are among the most common and dangerous. "
            "They're often used for misinformation. If you have a suspicious video or image of a public figure, "
            "upload it to our **Scanner** and DeepGuard will analyze it for manipulation artifacts like facial "
            "boundary blending, lip-sync mismatches, and GAN-generated pixel patterns."
        ),
    },
    {
        "keywords": ["safe", "privacy", "data", "secure", "security"],
        "response": (
            "Your privacy matters. DeepGuard processes all media locally on the server — files are analyzed "
            "and then discarded. We don't store your uploaded media permanently. Only the forensic analysis "
            "results are saved as reports, which you can delete at any time from the Overview page."
        ),
    },
    {
        "keywords": ["price", "pricing", "cost", "free", "plan", "pay"],
        "response": (
            "Check out our **Pricing** page for details on available plans. DeepGuard offers a free tier "
            "for basic scanning, with premium plans for higher volume, priority analysis, and API access."
        ),
    },
]

DEFAULT_RESPONSE = (
    "I'm your DeepGuard AI Assistant! I can help you with:\n"
    "• Understanding deepfakes and how they're made\n"
    "• Using the Scanner to analyze media\n"
    "• Reading forensic analysis reports\n"
    "• Webcam and live detection features\n\n"
    "Try asking me something like \"How does deepfake detection work?\" or \"How do I scan a video?\""
)


def _match_local_knowledge(user_text: str) -> str:
    """Match user input against the local knowledge base."""
    text_lower = user_text.lower()
    best_match = None
    best_score = 0

    for entry in KNOWLEDGE_BASE:
        score = sum(1 for kw in entry["keywords"] if kw in text_lower)
        if score > best_score:
            best_score = score
            best_match = entry["response"]

    return best_match if best_score >= 1 else DEFAULT_RESPONSE


async def _call_gemini(messages: list[dict], api_key: str) -> str | None:
    """Try calling Gemini API with model fallbacks. Returns None if all fail."""
    contents = []
    for msg in messages:
        role = "user" if msg["sender"] == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg["text"]}]})

    # Gemini API requires that the conversation starts with a user turn.
    # If the first message is a model turn (e.g. initial greeting), remove it.
    while contents and contents[0]["role"] == "model":
        contents.pop(0)

    if not contents:
        return None

    payload = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": contents,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        for model in GEMINI_MODELS:
            url = f"{GEMINI_BASE_URL}/{model}:generateContent?key={api_key}"
            try:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    text = (
                        data.get("candidates", [{}])[0]
                        .get("content", {})
                        .get("parts", [{}])[0]
                        .get("text")
                    )
                    if text:
                        return text
                elif resp.status_code in (429, 503):
                    logger.warning(f"Gemini model {model} returned {resp.status_code}, trying next...")
                    continue
                else:
                    logger.warning(f"Gemini model {model} returned {resp.status_code}: {resp.text[:200]}")
                    continue
            except Exception as e:
                logger.warning(f"Gemini model {model} failed: {e}")
                continue

    return None  # All models failed


async def get_chat_response(messages: list[dict]) -> str:
    """
    Main entry point. Tries Gemini API first, falls back to local knowledge.
    `messages` is a list of dicts with 'sender' ('user'|'ai') and 'text'.
    """
    api_key = GEMINI_API_KEY
    if not api_key:
        # Try reading from frontend .env as fallback
        try:
            env_path = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", ".env")
            if os.path.exists(env_path):
                with open(env_path) as f:
                    for line in f:
                        if line.startswith("VITE_GEMINI_API_KEY="):
                            api_key = line.split("=", 1)[1].strip()
                            break
        except Exception:
            pass

    # Try the Gemini API if we have a key
    if api_key:
        try:
            result = await _call_gemini(messages, api_key)
            if result:
                return result
        except Exception as e:
            logger.error(f"Gemini API call failed entirely: {e}")

    # Fallback: use local knowledge base
    last_user_msg = ""
    for msg in reversed(messages):
        if msg["sender"] == "user":
            last_user_msg = msg["text"]
            break

    return _match_local_knowledge(last_user_msg)
