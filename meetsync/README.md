# MeetSync

MeetSync is a meeting intelligence tool designed to transcribe audio, detect speakers (diarization), and extract action items using AI.

## Project Structure

```text
meetsync/
├── backend/
│   ├── .env.example       # Example environment configuration
│   ├── Dockerfile         # Dockerfile for backend and worker
│   ├── main.py            # FastAPI entrypoint and routes
│   └── requirements.txt   # Python package dependencies
├── frontend/
│   └── .gitkeep           # Placeholder for frontend files
├── docker-compose.yml     # Multi-container orchestration (FastAPI, Celery, Redis, PostgreSQL)
└── README.md              # Project documentation
```

## Features & Technologies

- **Backend Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database:** PostgreSQL (with SQLAlchemy ORM)
- **Background Worker:** Celery with Redis broker for processing long-running audio transcriptions asynchronously.
- **AI & Audio Processing:**
  - [Groq API](https://groq.com/) for fast transcription and summary extraction.
  - [PyAnnote Audio](https://github.com/pyannote/pyannote-audio) & [PyTorch](https://pytorch.org/) for speaker diarization.
  - LangChain & LangGraph for LLM workflows and action item generation.

---

## Quickstart

### 1. Configure Environment Variables
Copy the example environment file:
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` and update the placeholders with your API keys:
- `GROQ_API_KEY`: Get your key from [Groq Console](https://console.groq.com/).
- `HUGGINGFACE_TOKEN`: Required to download `pyannote/speaker-diarization` pre-trained models. Accept user agreements on Hugging Face model pages.

### 2. Run with Docker Compose
Run the entire stack (FastAPI backend, Celery worker, Redis, and PostgreSQL) with a single command:
```bash
docker-compose up --build
```

- FastAPI backend: http://localhost:8000
- Health check: http://localhost:8000/health
- PostgreSQL: `localhost:5432` (db: `meetsync`, user: `postgres`)
- Redis: `localhost:6379`

### 3. Local Installation (Alternative)
If running outside Docker, set up a virtual environment:

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

Start the local server:
```bash
uvicorn main:app --reload
```
