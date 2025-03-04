import tempfile
from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import openai
import os
from dotenv import load_dotenv
from openai import OpenAI

from utils import compress_audio, convert_to_mp3
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
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/transcribe")
async def transcribe_audio(audio: UploadFile):
    print(f"Transcribing audio: {audio.filename}")
    try:
        # Create a temporary file for the uploaded audio
        with tempfile.NamedTemporaryFile(suffix=os.path.splitext(audio.filename)[1]) as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_file.flush()

            # Get the selected model from form data
            model = audio.form.get('model', 'whisper')

            # Convert to mp3 to reduce file size
            if not temp_file.name.endswith('.mp3'):
                file_to_transcribe = convert_to_mp3(temp_file.name)
            else:
                # only compress if already mp3
                file_to_transcribe = compress_audio(temp_file.name)

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
