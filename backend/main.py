import tempfile
from fastapi import FastAPI, UploadFile, HTTPException, Form, File
from fastapi.middleware.cors import CORSMiddleware
import openai
import os
from dotenv import load_dotenv
from openai import OpenAI
import pathlib

from utils import convert_to_mp3
import stable_whisper

def local_transcribe(audio_file: str) -> dict:
    """Transcribe audio file using local Whisper model with timestamps"""
    model_size = os.getenv('WHISPER_MODEL_SIZE', 'large-v3')
    model = stable_whisper.load_model(model_size)
    result = model.transcribe(audio_file, language="en")
    
    segments = []
    for segment in result.segments:
        segments.append({
            'text': segment.text,
            'start': segment.start,
            'end': segment.end
        })
    
    return {
        'text': result.text,
        'segments': segments
    }


load_dotenv()

openai.api_key = os.getenv('OPENAI_API_KEY')

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/save-recording")
async def save_recording(audio: UploadFile = File(...), filename: str = Form(...)):
    """Save a recorded audio file to Documents/temp transcribe/"""
    try:
        # Create the temp transcribe directory in Documents
        documents_path = pathlib.Path.home() / "Documents"
        temp_dir = documents_path / "temp transcribe"
        temp_dir.mkdir(exist_ok=True)
        
        # Ensure filename has .mp3 extension
        if not filename.endswith('.mp3'):
            filename = f"{filename}.mp3"
        
        file_path = temp_dir / filename
        
        # Save the audio file
        content = await audio.read()
        with open(file_path, 'wb') as f:
            f.write(content)
        
        print(f"Saved recording to: {file_path}")
        
        return {
            "message": "Recording saved successfully",
            "file_path": str(file_path),
            "filename": filename
        }
    except Exception as e:
        print(f"Error saving recording: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/transcribe")
async def transcribe_audio(audio: UploadFile = File(...), model: str = Form("whisper")):
    print(f"Transcribing audio: {audio.filename}")
    try:
        # Create a temporary file for the uploaded audio
        with tempfile.NamedTemporaryFile(suffix=os.path.splitext(audio.filename)[1]) as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_file.flush()

            print(f"Using model: {model}")

            # Convert to mp3 to reduce file size
            if not temp_file.name.endswith('.mp3'):
                file_to_transcribe = convert_to_mp3(temp_file.name)
            else:
                file_to_transcribe = temp_file.name

            if model == 'local-whisper':
                result = local_transcribe(file_to_transcribe)
                response = {
                    "text": result["text"],
                    "segments": result["segments"]
                }
            else:
                client = OpenAI()
                with open(file_to_transcribe, 'rb') as audio_file:
                    transcript = client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file
                    )
                response = {"text": transcript.text}
            print(f"Response is: {response}")
            return response
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))
