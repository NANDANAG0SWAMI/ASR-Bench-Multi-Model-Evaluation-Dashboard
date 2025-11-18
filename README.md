# ASR-Bench-Multi-Model-Evaluation-Dashboard
A full-stack tool for developers to benchmark ASR models (Whisper, Google STT, etc.). The React/Vite frontend provides a UI to upload audio and a ground truth transcript. This is sent to a Python/FastAPI backend, which calculates and compares Word Error Rate (WER), Character Error Rate (CER), and processing latency for each model.
