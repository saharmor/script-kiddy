from contextlib import contextmanager
import os
import sys
import logging
import stable_whisper
from typing import Dict, Optional

@contextmanager
def suppress_stdout():
    """Context manager to suppress stdout temporarily"""
    with open(os.devnull, "w") as devnull:
        old_stdout = sys.stdout
        sys.stdout = devnull
        try:
            yield
        finally:
            sys.stdout = old_stdout

class ModelCache:
    """Cache for storing loaded Whisper models"""
    _downloaded_models: Dict[str, stable_whisper.WhisperModel] = {}

    @classmethod
    def get_or_load_model(cls, model_size: str) -> stable_whisper.WhisperModel:
        if model_size not in cls._downloaded_models:
            cls._downloaded_models[model_size] = stable_whisper.load_model(model_size)
            logging.info(f"{model_size} model loaded and cached")
        return cls._downloaded_models[model_size]

def transcribe_audio(audio_file: str, model_size: str = "large-v3") -> Optional[str]:
    """
    Transcribe audio file using cached Whisper model
    
    Args:
        audio_file: Path to audio file
        model_size: Whisper model size to use
    
    Returns:
        Transcribed text or None if error occurs
    """
    try:
        with suppress_stdout():
            model = ModelCache.get_or_load_model(model_size)
            result = model.transcribe(audio_file)
            return result["text"]
    except Exception as e:
        logging.error(f"Transcription error: {str(e)}")
        return None

def main():
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

    # Check if audio file is provided as argument
    if len(sys.argv) != 2:
        logging.error("Usage: python transcribe.py <audio_file.m4a>")
        sys.exit(1)
        
    audio_file = sys.argv[1]
    
    # Verify file extension
    if not audio_file.endswith('.m4a'):
        logging.error("Error: Please provide an m4a file")
        sys.exit(1)
    
    # Perform transcription
    transcription = transcribe_audio(audio_file)
    if transcription:
        print("\nTranscription:")
        print(transcription)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()

# python transcribe.py <audio_file.m4a>
