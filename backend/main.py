from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import openai
import os
from dotenv import load_dotenv
from openai import OpenAI

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
    try:
        # Save the uploaded file temporarily
        temp_file_path = f"temp_{audio.filename}"
        with open(temp_file_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)
        
        # Initialize OpenAI client
        client = OpenAI()
        
        # Transcribe using Whisper
        with open(temp_file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
            
        # Clean up temporary file
        os.remove(temp_file_path)
        
        print(f"Text is: [{transcript.text}]")
        return {"text": transcript.text}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))