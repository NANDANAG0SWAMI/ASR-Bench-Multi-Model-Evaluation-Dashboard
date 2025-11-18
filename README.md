# ASR-Bench: Multi-Model Evaluation Dashboard


ASR-Bench is a full-stack, "batteries-included" tool for developers to benchmark various Automatic Speech Recognition (ASR) models (like Whisper, Google STT, etc.) against their own data.

It's designed to definitively answer the question: "Which ASR model is best for my specific audio data?"



# Why ASR-Bench?

Standard ASR benchmarks are useful, but they don't tell you how a model will perform on your domain. An ASR model trained on podcasts will perform differently on noisy call-center audio or technical lectures.

This tool provides a simple UI to upload your own audio files and "ground truth" transcripts. The backend then runs your audio through every configured ASR model, calculates key metrics, and returns a head-to-head comparison, allowing you to make an data-driven decision.



✨ Core Features

1. Multi-Model Benchmarking: Out of the box, it compares openai-whisper models. It's designed to be pluggable, so you can easily add Google STT, Azure, or any other ASR service.

2. Key Metric Calculation: Automatically calculates and displays the most important ASR metrics:

    i. Word Error Rate (WER): The standard for ASR accuracy.

   ii. Character Error Rate (CER): Useful for more granular, character-level comparison.

  iii. Processing Latency: Measures how long each model took to transcribe the audio.

3. Simple UI: A clean React/Vite frontend with Tailwind CSS provides a simple drag-and-drop interface for audio and transcripts.

4. Extensible Backend: The FastAPI backend is designed to be easily extendable. Adding a new ASR model is as simple as writing one function.



🛠️ Tech Stack

1. Frontend: React (Vite), Tailwind CSS, Axios

2. Backend: Python 3.10+, FastAPI, Uvicorn

3. AI / ML: openai-whisper (as the base model)

4. Metrics: jiwer (for WER/CER calculations)



📁 Project Structure

This project is a monorepo containing two separate applications: backend (FastAPI) and frontend (React).

    asr_bench_project/
    ├── backend/
    │   ├── main.py             # FastAPI app, CORS, and API routes
    │   ├── asr_models.py       # Pluggable ASR models (Whisper, Google, etc.)
    │   ├── evaluation.py       # Logic to calculate WER/CER using jiwer
    │   ├── requirements.txt    # Backend Python dependencies
    │   └── venv/               # Python virtual environment
    │
    ├── frontend/
    │   ├── src/
    │   │   ├── App.jsx         # Main React component (UI and logic)
    │   │   ├── main.jsx        # React entry point
    │   │   └── index.css       # Tailwind CSS & global styles
    │   ├── index.html          # HTML entry point for React
    │   ├── package.json        # Frontend Node.js dependencies
    │   ├── tailwind.config.js  # Tailwind configuration
    │   └── vite.config.js      # Vite configuration
    │
    ├── docker-compose.yml      # Optional Docker setup
    ├── backend/Dockerfile      # Optional Docker setup
    ├── frontend/Dockerfile     # Optional Docker setup
    └── README.md               # This file



🚀 How to Run (Development Mode)

This project requires two separate terminals to run the frontend and backend independently.

1. Prerequisites

- Before you begin, you must have the following installed on your system:

- Python 3.10+

- Node.js 18+ (which includes npm)

- ffmpeg

  * The openai-whisper library requires ffmpeg to process audio.

  * Windows: Install via Chocolatey (choco install ffmpeg) or download from Gyan.dev and manually add it to your system's PATH.

  * macOS: Install via Homebrew (brew install ffmpeg).

  * Linux: Install via your package manager (sudo apt update && sudo apt install ffmpeg).
 

Terminal 1: Backend (FastAPI)

First, set up and run the backend server.

    # 1. Navigate to the backend folder
    cd backend

    # 2. Create a Python virtual environment
    python -m venv venv

    # 3. Activate the virtual environment
    # On Windows:
    venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate

    # 4. Install all required Python packages
    pip install -r requirements.txt

    # 5. Run the server
    python main.py

Your backend is now running at http://127.0.0.1:8000. Leave this terminal running.


Terminal 2: Frontend (React)

In a new terminal, set up and run the frontend UI.

    # 1. Navigate to the frontend folder
    cd frontend

    # 2. Install all required Node.js packages
    npm install

    # 3. Run the development server
    npm run dev

Your frontend is now running at http://localhost:5173. Your browser should open to this page automatically. You can now upload an audio file and its ground truth transcript to run your first benchmark!



🐳 How to Run (Docker - Optional)

If you prefer to run the application using Docker, docker-compose.yml is already configured.

Ensure Docker Desktop is running.

From the project's root directory (asr_bench_project/), run:

    docker compose up --build


Docker will build both the frontend and backend images and start the services.

Access the frontend at http://localhost:5173.



🔌 How to Add a New AI Model

This app is designed to be easily extendable. To add a new ASR model to the benchmark:

1. Install the Library: Stop the backend server, activate your venv, and pip install the new model's library (e.g., pip install google-cloud-speech).

2. Edit backend/asr_models.py:

    i. Import the new library.

   ii. Write a simple transcribe_new_model(audio_file_path) function that takes a file path and returns a single string of text.

  iii. Add your new function to the ASR_MODELS dictionary at the bottom of the file.

4. Restart the Backend: Run python main.py again (or restart your Docker container).

The app will automatically detect the new model, run it as part of the benchmark, and display its results alongside the others.



📡 API Endpoint

The frontend communicates with a single backend endpoint:

POST /benchmark

- Description: Uploads an audio file and a ground truth transcript to be benchmarked.

- Request: multipart/form-data

   * file: The audio file (e.g., .mp3, .wav, .m4a).

   * transcript: A plain text string of the correct transcription.

- Response: JSON

      {
        "results": [
          {
              "model": "whisper_tiny",
              "transcription": "The quick brown fox...",
              "wer": 0.15,
              "cer": 0.05,
              "latency": 2.34
          },
          {
              "model": "whisper_base",
              "transcription": "The quick brown fox...",
              "wer": 0.10,
              "cer": 0.02,
              "latency": 5.81
          }
        ]
      }



  
