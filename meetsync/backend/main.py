import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models
from database import engine
from routers import upload

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

@app.on_event("startup")
def on_startup():
    # Create uploads directory if it does not exist
    os.makedirs("uploads", exist_ok=True)
    # Create all database tables
    models.Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(upload.router)

@app.get("/health")
def health_check():
    """
    Health check endpoint for monitoring service status.
    """
    return {"status": "ok"}

