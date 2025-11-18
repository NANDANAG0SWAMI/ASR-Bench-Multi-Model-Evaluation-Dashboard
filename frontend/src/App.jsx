import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, Loader, AlertTriangle, CheckCircle, Mic, Info, BarChart3, FlaskConical, Server } from 'lucide-react';

// --- Configuration ---
const BACKEND_URL = "http://127.0.0.1:8000/benchmark";

// --- Helper Components ---
// Moved to the top to ensure they are defined before App component renders

const InfoCard = ({ icon, title, content }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
    <p className="text-sm text-gray-600">{content}</p>
  </div>
);

const Alert = ({ type, message }) => {
  const isError = type === 'error';
  return (
    <div className={`flex items-center gap-3 p-4 mb-4 rounded-md border ${
      isError 
        ? 'bg-red-50 border-red-200 text-red-800' 
        : 'bg-green-50 border-green-200 text-green-800'
    }`}>
      {isError ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
    </div>
  );
};

const ResultsTable = ({ results }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
    <h2 className="text-xl font-semibold p-5">📊 Benchmark Summary</h2>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WER ↓</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CER ↓</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latency</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {results.map((item) => (
            <tr key={item.model}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.model}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.wer.toFixed(2)}%</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.cer.toFixed(2)}%</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.latency_ms.toFixed(0)} ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const TranscriptDetails = ({ results }) => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200">
    <h2 className="text-xl font-semibold p-5">📝 Detailed Transcripts</h2>
    <div className="border-t border-gray-200 p-5 space-y-4">
      <details className="bg-green-50 p-4 rounded-md border border-green-200" open>
        <summary className="font-semibold text-green-800 cursor-pointer">Ground Truth</summary>
        <p className="mt-2 text-green-900">{results.ground_truth}</p>
      </details>

      {results.results.map((item) => (
        <details key={item.model} className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <summary className="font-semibold text-gray-800 cursor-pointer">
            {item.model} <span className="font-normal text-gray-600">(WER: {item.wer.toFixed(2)}%)</span>
          </summary>
          <p className="mt-2 text-gray-700">{item.hypothesis}</p>
        </details>
      ))}
    </div>
  </div>
);


export default function App() {
  const [groundTruth, setGroundTruth] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile || !groundTruth) {
      setError("Please provide both an audio file and the ground truth transcript.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append("audio_file", audioFile);
    formData.append("ground_truth", groundTruth);

    try {
      const response = await axios.post(BACKEND_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minute timeout
      });

      if (response.status === 200) {
        setResults(response.data);
        setError(null);
      } else {
        setError(`Error from backend (Status ${response.status}): ${response.data.detail || 'Unknown error'}`);
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError("Error: The request timed out. The backend may be processing a large file.");
      } else if (err.response) {
        setError(`Error: ${err.response.data.detail || 'Failed to process request.'}`);
      } else if (err.request) {
        setError("Error: Could not connect to the backend. Is it running at http://127.0.0.1:8000?");
      } else {
        setError(`An unexpected error occurred: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 hidden md:block">
        <div className="flex items-center gap-3 mb-8">
          <span className="bg-indigo-600 rounded-lg p-2">
             <BarChart3 className="h-6 w-6 text-white" />
          </span>
          <h1 className="text-xl font-bold text-gray-900">ASR-Bench</h1>
        </div>
        
        <div className="flex flex-col space-y-4">
          <InfoCard
            icon={<FlaskConical className="text-indigo-600" />}
            title="Instructions"
            content="Upload audio and its correct transcript. The app sends this to a local backend to run evaluation."
          />
          <InfoCard
            icon={<Server className="text-indigo-600" />}
            title="Backend Status"
            content="Make sure the FastAPI backend is running at http://127.0.0.1:8000."
          />
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 p-6 md:p-10">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">Multi-Model Evaluation</h1>
          <p className="text-lg text-gray-600 mt-1">
            Benchmark ASR models with your own data.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* --- Step 1: Upload Audio --- */}
          <div>
            <label className="text-lg font-semibold text-gray-800 mb-2 block">1. Upload Audio File</label>
            <div
              className="flex justify-center w-full h-32 px-6 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
              onClick={() => document.getElementById('file-upload').click()}
            >
              <span className="flex items-center space-x-2">
                <UploadCloud className="w-6 h-6 text-gray-600" />
                <span className="font-medium text-gray-600">
                  {fileName ? (
                    <span className="text-indigo-700">{fileName}</span>
                  ) : (
                    <>
                      Drop file or <span className="text-indigo-600 underline">click to upload</span>
                    </>
                  )}
                </span>
              </span>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="audio/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* --- Step 2: Ground Truth --- */}
          <div>
            <label htmlFor="ground-truth" className="text-lg font-semibold text-gray-800 mb-2 block">
              2. Enter Ground Truth Transcript
            </label>
            <textarea
              id="ground-truth"
              rows="5"
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Paste the 100% correct, 'ground truth' transcript here..."
              value={groundTruth}
              onChange={(e) => setGroundTruth(e.target.value)}
            />
          </div>

          {/* --- Submit Button --- */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Running Benchmark...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Run Benchmark
                </>
              )}
            </button>
          </div>
        </form>

        {/* --- Results Section --- */}
        <div className="mt-10">
          {error && <Alert type="error" message={error} />}
          {results && <Alert type="success" message="Benchmark complete!" />}
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg shadow-md border border-gray-200">
              <span className="loader"></span>
              <p className="mt-4 text-lg font-medium text-gray-700">Processing... this may take a moment.</p>
              <p className="text-gray-500">Running models: local_whisper_base, google_cloud_stt, azure_speech</p>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <ResultsTable results={results.results} />
              <TranscriptDetails results={results} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- Helper Components --- 
// (These are now defined at the top of the file)