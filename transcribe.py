import whisper
import sys

def transcribe_audio(audio_file):
    # Load the Whisper model (using base model for balance of speed/accuracy)
    model = whisper.load_model("large")
    
    # Transcribe the audio file
    result = model.transcribe(audio_file)
    
    # Return the transcribed text
    return result["text"]

def main():
    # Check if audio file is provided as argument
    if len(sys.argv) != 2:
        print("Usage: python transcribe.py <audio_file.m4a>")
        sys.exit(1)
        
    audio_file = sys.argv[1]
    
    # Verify file extension
    if not audio_file.endswith('.m4a'):
        print("Error: Please provide an m4a file")
        sys.exit(1)
    
    try:
        # Perform transcription
        transcription = transcribe_audio(audio_file)
        print("\nTranscription:")
        print(transcription)
        
    except Exception as e:
        print(f"Error during transcription: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()

# python transcribe.py <audio_file.m4a>
