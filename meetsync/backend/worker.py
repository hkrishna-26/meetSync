import os
from celery import Celery
from dotenv import load_dotenv
from groq import Groq

from database import SessionLocal
import models

# Load environment variables
load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Set up Celery app
celery_app = Celery(
    "meet_sync_worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

# Optional Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="worker.process_meeting")
def process_meeting(meeting_id: str):
    """
    Celery task that:
    1. Updates meeting status to 'transcribing'.
    2. Calls Groq Whisper API to transcribe the audio.
    3. Saves the transcript and updates status to 'analysing'.
    4. Updates status to 'done'.
    5. Sets status to 'failed' if any step raises an error.
    """
    print(f"Starting processing for meeting ID: {meeting_id}")
    db = SessionLocal()
    try:
        # 1. Update meeting status to "transcribing"
        meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
        if not meeting:
            print(f"Error: Meeting {meeting_id} not found in database.")
            return f"Meeting {meeting_id} not found"

        meeting.status = "transcribing"
        db.commit()
        print(f"Meeting {meeting_id} status updated to 'transcribing'")

        # 2. Call Groq Whisper API to transcribe the audio file
        audio_path = os.path.join("uploads", meeting.audio_filename)
        if not os.path.exists(audio_path):
            raise FileNotFoundError(f"Audio file not found at {audio_path}")

        print(f"Sending audio file {audio_path} to Groq Whisper API...")
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
            
        client = Groq(api_key=groq_api_key)

        with open(audio_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=(meeting.audio_filename, audio_file.read()),
                model="whisper-large-v3",
            )
        
        transcript_text = transcription.text
        print(f"Transcription completed successfully for meeting {meeting_id}")

        # 3. Update status to "analysing", saves transcript
        meeting.status = "analysing"
        meeting.transcript = transcript_text
        db.commit()
        print(f"Meeting {meeting_id} transcript saved. Status updated to 'analysing'")

        # 4. Call LangGraph agent to extract action items, decisions, and blockers
        print(f"Running LangGraph agent on meeting {meeting_id} transcript...")
        from agent import run_agent
        agent_results = run_agent(transcript_text)

        # Save action items
        for item in agent_results.get("action_items", []):
            conf = str(item.get("confidence", "medium")).lower()
            if conf not in ["high", "medium", "low"]:
                conf = "medium"
            db_action = models.ActionItem(
                meeting_id=meeting.id,
                owner=item.get("owner", "Unknown"),
                task=item.get("task", "No task details provided"),
                deadline=item.get("deadline"),
                confidence=conf
            )
            db.add(db_action)

        # Save decisions
        for item in agent_results.get("decisions", []):
            db_decision = models.Decision(
                meeting_id=meeting.id,
                content=item.get("content", "No decision details provided")
            )
            db.add(db_decision)

        # Save blockers
        for item in agent_results.get("blockers", []):
            db_blocker = models.Blocker(
                meeting_id=meeting.id,
                content=item.get("content", "No blocker details provided"),
                blocked_by=item.get("blocked_by")
            )
            db.add(db_blocker)

        db.commit()
        print(f"Successfully saved action items, decisions, and blockers for meeting {meeting_id}")

        # 5. Updates meeting status to "done"
        meeting.status = "done"
        db.commit()
        print(f"Meeting {meeting_id} processing completed successfully. Status set to 'done'")
        return f"Success: Meeting {meeting_id} processed"

    except Exception as e:
        print(f"Exception encountered during processing: {str(e)}")
        db.rollback()
        # 5. If anything fails, set status to "failed"
        try:
            failed_meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
            if failed_meeting:
                failed_meeting.status = "failed"
                db.commit()
                print(f"Meeting {meeting_id} status updated to 'failed'")
        except Exception as db_err:
            print(f"Failed to update meeting status to 'failed': {str(db_err)}")
        raise e
    finally:
        db.close()
