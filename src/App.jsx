import React from 'react';
import { useState } from 'react';
import './index.css';
const API_BASE = 'https://gym-fakeml-api.onrender.com';

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [machine, setMachine] = useState('leg-curl');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setFeedbackSent(false);
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);
    setFeedbackSent(false);

    const formData = new FormData();
    formData.append('image', image);
    formData.append('machine', machine);

    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    setResult(data.predicted_weight);
    setLoading(false);
  };

  const sendFeedback = async (correct) => {
    if (!image || !result) return;
    await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: image.name,
        guess: result,
        correct
      })
    });
    setFeedbackSent(true);
  };

  return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center gap-4 bg-gray-100">
        <h1 className="text-2xl font-bold mb-2 text-center">Gym Weight Detector</h1>

        <div className="flex gap-4 mb-4">
          <label>
            <input
                type="radio"
                name="machine"
                value="leg-curl"
                checked={machine === 'leg-curl'}
                onChange={(e) => setMachine(e.target.value)}
            />{' '}
            Leg Curl
          </label>
          <label>
            <input
                type="radio"
                name="machine"
                value="shoulder-press"
                checked={machine === 'shoulder-press'}
                onChange={(e) => setMachine(e.target.value)}
            />{' '}
            Shoulder Press
          </label>
        </div>

        <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="mb-4 w-full max-w-xs text-sm"
        />

        {preview && (
            <img
                src={preview}
                alt="preview"
                className="w-full max-w-xs rounded shadow-md object-contain"
            />
        )}

        <button
            className="bg-blue-600 text-white px-6 py-2 rounded mt-4 w-full max-w-xs text-lg disabled:opacity-50"
            onClick={handleUpload}
            disabled={!image || loading}
        >
          {loading ? 'Predicting...' : 'Upload and Predict'}
        </button>

        {result && (
            <div className="text-center mt-6 w-full">
              <p className="text-lg">Prediction:</p>
              <p className="text-5xl font-bold text-green-600 my-2">{result}</p>
              {!feedbackSent && (
                  <div className="flex justify-center gap-6 mt-4">
                    <button
                        onClick={() => sendFeedback(true)}
                        className="bg-green-500 px-6 py-2 rounded text-white text-lg"
                    >
                      ✅ Correct
                    </button>
                    <button
                        onClick={() => sendFeedback(false)}
                        className="bg-red-500 px-6 py-2 rounded text-white text-lg"
                    >
                      ❌ Wrong
                    </button>
                  </div>
              )}
              {feedbackSent && <p className="mt-4 text-sm text-gray-500">Feedback saved</p>}
            </div>
        )}
      </div>
  );
}
