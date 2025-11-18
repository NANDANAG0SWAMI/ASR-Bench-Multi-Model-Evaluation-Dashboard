import jiwer
import time
from typing import Dict, Any

def calculate_metrics(ground_truth: str, hypothesis: str) -> Dict[str, float]:
    """
    Calculates Word Error Rate (WER) and Character Error Rate (CER)
    using the jiwer library.
    """
    try:
        # FIX: The jiwer API has changed.
        # We now call wer() and cer() separately instead of compute_measures()
        wer = jiwer.wer(ground_truth, hypothesis)
        cer = jiwer.cer(ground_truth, hypothesis)
        
        return {
            "wer": wer * 100,  # as percentage
            "cer": cer * 100   # as percentage
        }
    except Exception as e:
        print(f"Error in jiwer calculation: {e}")
        # Return max error on failure
        return {
            "wer": 100.0,
            "cer": 100.0
        }

def measure_latency(func, *args, **kwargs) -> (Any, float):
    """
    A simple utility to measure the execution time (latency) of a function.
    Returns the function's result and the latency in milliseconds.
    """
    start_time = time.perf_counter()
    result = func(*args, **kwargs)
    end_time = time.perf_counter()
    latency_ms = (end_time - start_time) * 1000
    return result, latency_ms