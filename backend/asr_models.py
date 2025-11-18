import time
from typing import Dict

# --- REAL WHISPER AI ---
try:
    import whisper
    # Load the AI model (you can choose 'base', 'small', 'medium', 'large')
    # 'base' is fast, 'medium' is a good balance.
    print("Loading Whisper 'base' model... (This may take a moment on first run)")
    model = whisper.load_model("base")
    print("Whisper 'base' model loaded successfully.")

    def transcribe_whisper(audio_file_path: str) -> str:
        """
        Transcribes audio using the REAL local Whisper model.
        """
        print("--- Running REAL Whisper Transcription ---")
        result = model.transcribe(audio_file_path)
        return result["text"] # Return the real transcript

except ImportError:
    print("*****************************************************************")
    print("WARNING: 'openai-whisper' not found or failed to import.")
    print("Falling back to Whisper simulation.")
    print("To fix, stop the server, activate venv, and run: pip install openai-whisper")
    print("*****************************************************************")
    def transcribe_whisper(audio_file_path: str) -> str:
        """
        SIMULATION for Whisper.
        Install with 'pip install openai-whisper' to use the real model.
        """
        print("--- Simulating Whisper Transcription ---")
        time.sleep(1.5)
        return "This is the simulated transcript from Whisper. (Install 'openai-whisper' to run the real model)."

# --- SIMULATED GOOGLE STT ---
def transcribe_google_stt(audio_file_path: str) -> str:
    """
    This is a placeholder. Implement the actual Google STT API call here.
    """
    print("--- Simulating Google STT Transcription ---")
    time.sleep(0.8)
    return "This is the simulated transcript from Google STT."

# --- SIMULATED AZURE SPEECH ---
def transcribe_azure(audio_file_path: str) -> str:
    """
    This is a placeholder. Implement the actual Azure Speech API call here.
    """
    print("--- Simulating Azure Speech Transcription ---")
    time.sleep(1.1)
    return "This is the simulated transcript from Azure."


# --- MODEL DICTIONARY ---
# main.py imports this dictionary
ASR_MODELS = {
    "local_whisper_base": transcribe_whisper,
    "google_cloud_stt": transcribe_google_stt,
    "azure_speech": transcribe_azure,
}