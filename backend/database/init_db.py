import datetime
import random
from database.models import Base, DetectionReport
from database.session import engine, SessionLocal

def init_db():
    Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    try:
        # Check if database is already seeded
        if db.query(DetectionReport).first() is not None:
            print("Database already has records, skipping seeding.")
            return

        print("Seeding database...")
        
        # Lists of details for mock generation
        image_filenames = [
            "profile_photo_edited.png", "passport_scan_v2.jpg", "id_card_front.png",
            "linked_in_avatar.jpg", "signature_specimen.png", "driver_license.jpg",
            "headshot_final.jpg", "document_verification_selfie.png", "company_avatar.jpg"
        ]
        video_filenames = [
            "Q4_CEO_Interview.mp4", "press_conference_clip.mov", "video_call_recording.mp4",
            "product_demo_reel.mp4", "news_broadcast_sample.mp4", "internal_briefing.avi",
            "townhall_highlights.mp4", "security_camera_footage.mp4"
        ]
        audio_filenames = [
            "voice_memo_04.wav", "voicemail_msg.mp3", "financial_forecast_audio.wav",
            "ceo_address_draft.wav", "customer_service_call.mp3", "pod_snippet.mp3"
        ]

        models = {
            "image": "Vision Transformer (ViT-H/16)",
            "video": "TimeSformer + XceptionNet Ensemble",
            "audio": "Wav2Vec 2.0 + Whisper Embeddings"
        }

        manipulation_categories = {
            "image": ["GAN Image", "Face-Swap"],
            "video": ["Face-Swap", "Lip-Sync"],
            "audio": ["Voice Clone"]
        }

        # Generate records for the past 7 days
        now = datetime.datetime.utcnow()
        reports_to_add = []
        
        # We want to distribute about 50-60 records
        for i in range(7):
            # Day offset
            day = now - datetime.timedelta(days=i)
            # Generate 7-10 scans per day
            scans_for_day = random.randint(7, 10)
            for j in range(scans_for_day):
                media_type = random.choice(["image", "video", "audio"])
                
                # Pick filenames and models
                if media_type == "image":
                    filename = random.choice(image_filenames)
                elif media_type == "video":
                    filename = random.choice(video_filenames)
                else:
                    filename = random.choice(audio_filenames)

                is_fake = random.choice([True, False])
                
                if is_fake:
                    confidence_score = round(random.uniform(82.0, 99.5), 2)
                    category = random.choice(manipulation_categories[media_type])
                else:
                    confidence_score = round(random.uniform(1.0, 18.0), 2)
                    category = "Authentic"

                # Randomize hour/minute
                created_at = day.replace(
                    hour=random.randint(8, 22),
                    minute=random.randint(0, 59),
                    second=random.randint(0, 59),
                    microsecond=0
                )

                # Generate report ID: REP-XXXXX-XX format
                report_id = f"REP-{random.randint(10000, 99999)}-{random.choice(['AX', 'BY', 'CZ', 'DW', 'EV'])}"
                
                # Construct mock details
                details_data = {
                    "is_fake": is_fake,
                    "confidence_score": confidence_score,
                    "model_used": models[media_type],
                    "analysis_time_ms": random.randint(1500, 3800) if media_type == "video" else random.randint(500, 1800),
                }
                
                if is_fake:
                    if media_type == "image":
                        details_data["manipulated_regions"] = [
                            {"region": "facial_skin", "suspicion_score": round(random.uniform(75, 98), 2)},
                            {"region": "glare_consistency", "suspicion_score": round(random.uniform(80, 99), 2)}
                        ]
                        details_data["category"] = category
                    elif media_type == "video":
                        details_data["anomalies_detected"] = [random.choice(["facial boundary artifact", "temporal jitter", "lip-sync mismatch"])]
                        details_data["timeline"] = [
                            {"time_sec": t * 0.5, "score": round(random.uniform(80, 99), 2) if t > 3 else round(random.uniform(5, 20), 2)}
                            for t in range(10)
                        ]
                        details_data["category"] = category
                    else:
                        details_data["anomalies_detected"] = [random.choice(["synthetic cadence", "frequency artifact", "vocal phase alignment mismatch"])]
                        details_data["category"] = category
                else:
                    details_data["category"] = "Authentic"

                report = DetectionReport(
                    id=report_id,
                    filename=filename,
                    media_type=media_type,
                    is_fake=is_fake,
                    confidence_score=confidence_score,
                    model_used=models[media_type],
                    analysis_time_ms=details_data["analysis_time_ms"],
                    details=details_data,
                    created_at=created_at
                )
                reports_to_add.append(report)

        # Bulk save
        db.add_all(reports_to_add)
        db.commit()
        print(f"Successfully seeded {len(reports_to_add)} records into the database.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_db()
    print("Database initialized and seeded.")
