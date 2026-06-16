from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MeetSync API",
    description="Meeting Intelligence Tool Backend - transcribes audio, detects speakers, and extracts action items",
    version="0.1.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    """
    Health check endpoint for monitoring service status.
    """
    return {"status": "ok"}
