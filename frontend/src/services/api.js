/**
 * API service for Touch Grass backend communication.
 * Directly communicates with the FastAPI backend.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend health check error:', err);
    return null;
  }
}

export async function fetchModelStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/model`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Model status fetch error:', err);
    return {
      ollama_connected: false,
      configured_model: 'gemma3:4b',
      model_available: false,
      available_models: [],
      base_url: 'http://localhost:11434',
      message: 'Cannot reach Touch Grass backend service.',
    };
  }
}

export async function fetchChallenge() {
  try {
    const res = await fetch(`${API_BASE}/api/challenge`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Challenge fetch error:', err);
    return {
      id: 'fallback-challenge',
      title: 'Mindful Outdoor Step',
      mission: 'Step outside for 5 minutes, find the greenest leaf nearby, and observe its texture.',
      outdoor_tip: 'Breathe in the outdoor air and notice the shadows on the ground.',
      difficulty: 'Easy',
      category: 'Mindfulness',
    };
  }
}

export async function analyzePlantImage(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Analyze network error:', err);
    return {
      success: false,
      model_used: 'gemma3:4b',
      disclaimer: 'AI-generated plant health assessments are informational only.',
      error: 'Network connection failure or timeout while communicating with Touch Grass backend.',
      error_code: 'CLIENT_NETWORK_ERROR',
      troubleshooting: [
        'Confirm the FastAPI backend is running at http://localhost:8000',
        'Confirm Ollama is running (`ollama serve`) and model `gemma3:4b` is pulled.',
      ],
    };
  }
}
