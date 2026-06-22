

# MeetSync — AI Meeting Intelligence

Turn any meeting recording into structured action items, 
decisions, and blockers automatically using AI.

## Live Demo
- Frontend: https://meet-sync-orpin.vercel.app
- Backend API: https://meetsync-grb3.onrender.com/docs

## What it does
Upload a meeting audio file and MeetSync will:
1. Transcribe the audio using Groq Whisper
2. Detect speakers automatically
3. Extract action items with owners and deadlines
4. Identify decisions made
5. Flag blockers

## Tech Stack
**Backend**
- FastAPI + SQLAlchemy + PostgreSQL (Supabase)
- Celery + Redis for async processing
- Groq Whisper API for transcription
- LangGraph multi-agent pipeline for intelligence extraction
- LLaMA 3.3 70B via Groq for LLM

**Frontend**
- React + Vite
- React Router
- Axios

**Infrastructure**
- Backend: Render
- Frontend: Vercel
- Database: Supabase
- Queue: Redis

## Architecture
User uploads audio → FastAPI saves file → Celery worker 
picks up task → Groq Whisper transcribes → LangGraph agent 
extracts action items/decisions/blockers → Results saved 
to PostgreSQL → Frontend displays results

## Local Setup
1. Clone the repo
2. Backend: cd meetsync/backend && pip install -r requirements.txt
3. Copy .env.example to .env and fill in keys
4. Run: uvicorn main:app --port 8001
5. Run: python -m celery -A worker worker --pool=solo
6. Frontend: cd meetsync/frontend && npm install && npm run dev

## Environment Variables
- GROQ_API_KEY
- DATABASE_URL
- REDIS_URL
- HUGGINGFACE_TOKEN
