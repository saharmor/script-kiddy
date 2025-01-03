from contextlib import contextmanager
import os
import sys
import logging
import stable_whisper
from typing import Optional
from dotenv import load_dotenv

# $0.006 per minute / $0.36 per hour (https://openai.com/api/pricing/#:~:text=%240.016%20/%20image-,Audio%20models,-Whisper%20can%20transcribe)

load_dotenv()

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


def transcribe_audio(audio_file: str, model_size: str = None) -> Optional[str]:
    """
    Transcribe audio file using cached Whisper model
    
    Args:
        audio_file: Path to audio file
        model_size: Whisper model size to use (defaults to env variable or "large-v3")
    
    Returns:
        Transcribed text or None if error occurs
    """
    model_size = model_size or os.getenv('WHISPER_MODEL_SIZE', 'large-v3')
    try:
        with suppress_stdout():
            model = stable_whisper.load_model(model_size)
            result = model.transcribe(audio_file)
            return result.text
    except Exception as e:
        logging.error(f"Transcription error: {str(e)}")
        return None

def save_transcription(audio_path: str, transcription: str) -> None:
    """Save transcription to a text file with the same name as the audio file"""
    output_path = os.path.splitext(audio_path)[0] + '.txt'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(transcription)
    logging.info(f"Transcription saved to {output_path}")

def process_file(audio_file: str) -> Optional[str]:
    """
    Process a single audio file
    
    Args:
        audio_file: Path to audio file
    
    Returns:
        Transcribed text or None if error occurs
    """
    # Verify file extension
    if not audio_file.endswith('.m4a'):
        logging.error(f"Skipping {audio_file}: Not an m4a file")
        return None
    
    logging.info(f"Processing {audio_file}")
    # Perform transcription
    transcription = transcribe_audio(audio_file)
    if transcription:
        save_transcription(audio_file, transcription)
        return transcription
    return None

def process_directory(directory: str) -> None:
    """Process all m4a files in the given directory"""
    for filename in os.listdir(directory):
        if filename.endswith('.m4a'):
            audio_path = os.path.join(directory, filename)
            process_file(audio_path)

def main(input_path: str = None):
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

    # Check if input path is provided
    if input_path is None:
        if len(sys.argv) > 1:
            input_path = sys.argv[1]
        else:
            logging.error("Usage: python transcribe.py <audio_file.m4a or directory>")
            sys.exit(1)
    
    # Check if path exists
    if not os.path.exists(input_path):
        logging.error(f"Path does not exist: {input_path}")
        sys.exit(1)
    
    # Process directory or single file
    if os.path.isdir(input_path):
        process_directory(input_path)
    else:
        if not process_file(input_path):
            sys.exit(1)

if __name__ == "__main__":
    main("to_transcribe/")

# python transcribe.py <audio_file.m4a>
