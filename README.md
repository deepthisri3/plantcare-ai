# Touch Grass — AI Plant Health Companion 🌱

> **Hacktoberfest 2026: Open-Source AI Challenge — Week 1**  
> *"Go outside. Find something growing. Let open AI help you understand it."*

**Touch Grass** is an open-source, privacy-preserving plant observation and health analysis application. It is built entirely with open-weight AI (**Gemma 3**) running locally on your hardware through **Ollama**—meaning zero API subscriptions, zero rate limits, and zero transmission of private photos or location data to commercial cloud providers.

---

## 🌿 Philosophy & Purpose

Most modern apps are designed to maximize screen time through feeds, notifications, and streaks. **Touch Grass** is built with the opposite philosophy:

1. **Minimal Screen Time:** Step outside, find a plant, snap a quick photo.
2. **Local AI Insights:** Understand what species you found, whether it is thriving or facing distress, and what practical steps support its health.
3. **Return Outdoors:** Close the screen and enjoy the living world right outside your door.

---

## ✨ Features

- **Open-Weight AI Identification:** Powered by Google DeepMind's open-weight **Gemma 3** (`gemma3:4b`), executed locally via **Ollama**.
- **Plant Health Assessment:** Classifies condition into *Healthy*, *Needs Attention*, *Unhealthy*, or *Uncertain*, with confidence scoring and severity metrics.
- **Symptom & Cause Diagnostics:** Recognizes leaf spots, chlorosis, wilting, insect damage, fungal patterns, and nutrient deficiencies.
- **Actionable Care & Field Notes:** Generates safe, practical care guidance along with environmental observations (sunlight, soil, season).
- **Interactive Nature Challenges:** Built-in mindfulness missions to encourage observing leaves, bark, pollinators, and urban botany.
- **Instant Canvas Test Samples:** Includes built-in simulated foliage generators (Rose, Mint, Tomato) for immediate local UI testing even without an external camera.
- **100% Local & Private:** Photos never leave your computer.

---

## 🛠️ Architecture

```
plantcare-ai/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── config.py         # Pydantic Settings & prompt template
│   │   ├── main.py           # FastAPI entrypoint & lifespan
│   │   ├── routes/           # API Endpoints
│   │   │   ├── analyze.py    # POST /api/analyze (Image vision processing)
│   │   │   ├── challenge.py  # GET/POST /api/challenge (Nature missions)
│   │   │   └── model.py      # GET /api/model (Ollama & Gemma status)
│   │   ├── schemas/          # Pydantic models for responses
│   │   ├── services/         # GemmaService (Ollama client & JSON parser)
│   │   └── tests/            # Pytest test suite (9 tests)
│   ├── requirements.txt
│   └── .env.example
└── frontend/                 # React 19 + Vite 8
    ├── src/
    │   ├── components/       # Natural UI components
    │   ├── services/api.js   # Backend API client
    │   ├── App.jsx           # Application shell & state
    │   └── index.css         # Nature-inspired typography & palette
    └── vite.config.js        # Vite dev server & API proxy
```

---

## 🚀 Quickstart Guide

### Prerequisites

1. **Python 3.11+**
2. **Node.js 18+** and **npm**
3. **[Ollama](https://ollama.com/)** for local model inference

---

### Step 1: Start Ollama & Pull Gemma 3

In your terminal:
```bash
# Start Ollama service
ollama serve

# In a second terminal, download the open-weight Gemma 3 vision model:
ollama pull gemma3:4b
```

*(You can also use larger quants or models like `gemma3:12b` by updating `GEMMA_MODEL` in `backend/.env`)*

---

### Step 2: Set Up & Run the Backend

```bash
cd backend

# Create and activate virtual environment (Windows)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```

The API docs will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### Step 3: Set Up & Run the Frontend

In a separate terminal:
```bash
cd frontend

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```

Visit the app in your browser at [http://localhost:5173](http://localhost:5173).

---

## 🧪 Testing & Validation

### Run Backend Tests

```bash
cd backend
.\venv\Scripts\python -m pytest app/tests
```
All 9 unit tests validate endpoints, edge case image validation, and JSON normalization.

### Run Frontend Lint & Build

```bash
cd frontend
npm run lint    # Oxlint validator
npm run build   # Production bundle verification
```

---

## 📡 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check and Ollama connection status |
| `GET` | `/api/model` | Model availability, base URL, and pulled models list |
| `GET` | `/api/challenge` | Random outdoor observation mission |
| `POST` | `/api/analyze` | Multipart image upload for Gemma AI vision diagnosis |

---

## ⚖️ Disclaimer

AI-generated plant identification and health assessments are informational only. For agricultural diagnostics, hazardous plant verification, or serious disease management, always consult a certified botanist or agronomist.