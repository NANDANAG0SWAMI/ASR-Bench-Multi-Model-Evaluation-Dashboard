import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from typing import List
import os
import shutil

# --- NEW CODE TO ADD ---
from fastapi.middleware.cors import CORSMiddleware
# --- END NEW CODE ---

# Import our custom modules
# --- FIX THE TYPO: 'evaluations' -> 'evaluation' ---
from evaluation import calculate_metrics, measure_latency
# --- END FIX ---
from asr_models import ASR_MODELS


app = FastAPI(
    title="ASR-Bench API",
    description="An API to benchmark multiple ASR models.",
    version="1.0.0"
)

# --- NEW CODE TO ADD: THE CORS FIX ---
# This is the code that "tells it there's nothing to worry about"
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"  # The "sledgehammer" just in case
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- END NEW CODE ---


# Define a temporary directory for audio files
TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.post("/benchmark")
async def run_benchmark(
    ground_truth: str = Form(...),
    audio_file: UploadFile = File(...)
):
    """
    Receives an audio file and a ground truth transcript,
    runs the audio through all configured ASR models,
    and returns a comparison of metrics (WER, CER, Latency).
    """
    
    if not ground_truth:
        raise HTTPException(status_code=400, detail="Ground truth transcript cannot be empty.")
    
    if not audio_file:
        raise HTTPException(status_code=400, detail="No audio file uploaded.")

    # Save the uploaded file temporarily
    temp_file_path = os.path.join(TEMP_DIR, audio_file.filename)
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(audio_file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save temporary file: {e}")
    finally:
        audio_file.file.close()

    results = []
    
    # Iterate through all registered models and run the benchmark
    for model_name, transcribe_func in ASR_MODELS.items():
        print(f"Running benchmark for: {model_name}")
        try:
            # 1. Measure latency and get transcription
            hypothesis, latency_ms = measure_latency(transcribe_func, temp_file_path)
            
            # 2. Calculate WER/CER metrics
            metrics = calculate_metrics(ground_truth, hypothesis)
            
            # 3. Append results
            results.append({
                "model": model_name,
                "wer": metrics["wer"],
                "cer": metrics["cer"],
                "latency_ms": latency_ms,
                "hypothesis": hypothesis,
            })
            
        except Exception as e:
            print(f"Error benchmarking model {model_name}: {e}")
            results.append({
                "model": model_name,
                "wer": 100.0,
                "cer": 100.0,
                "latency_ms": 0,
                "hypothesis": f"ERROR: {e}",
            })

    # Clean up the temporary file
    try:
        os.remove(temp_file_path)
    except Exception as e:
        print(f"Warning: Could not remove temp file {temp_file_path}: {e}")

    return {
        "ground_truth": ground_truth,
        "results": results
    }

if __name__ == "__main__":
    # Run on 0.0.0.0 to be accessible
    uvicorn.run(app, host="0.0.0.0", port=8000)