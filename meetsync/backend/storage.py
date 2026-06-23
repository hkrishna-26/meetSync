import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

# Retrieve credentials
supabase_url = os.getenv("SUPABASE_URL")
supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")

if not supabase_url:
    raise ValueError("SUPABASE_URL environment variable is not set")
if not supabase_service_key:
    raise ValueError("SUPABASE_SERVICE_KEY environment variable is not set")

# Clean up SUPABASE_URL if it has the /rest/v1/ suffix
# (The Supabase Storage Client needs the base URL instead of the REST-specific URL suffix)
if supabase_url.endswith("/rest/v1/"):
    supabase_url = supabase_url[:-9]
elif supabase_url.endswith("/rest/v1"):
    supabase_url = supabase_url[:-8]

# Initialize the Supabase Client
supabase: Client = create_client(supabase_url, supabase_service_key)

def upload_audio(file_bytes: bytes, filename: str) -> str:
    """
    Uploads file_bytes to the 'meeting-audio' bucket.
    Returns the filename.
    """
    # Upload to the 'meeting-audio' bucket with the specified filename
    supabase.storage.from_("meeting-audio").upload(
        path=filename,
        file=file_bytes,
        file_options={"upsert": "true"}
    )
    return filename

def download_audio(filename: str) -> str:
    """
    Downloads file from the 'meeting-audio' bucket,
    saves it to /tmp/{filename}, and returns the local path.
    """
    local_dir = "/tmp"
    # Ensure the directory exists (on Windows this creates a \tmp folder on the current drive)
    os.makedirs(local_dir, exist_ok=True)
    local_path = os.path.join(local_dir, filename)

    # Download from the 'meeting-audio' bucket
    response = supabase.storage.from_("meeting-audio").download(filename)
    with open(local_path, "wb") as f:
        f.write(response)

    return local_path
