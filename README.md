# Leap (working title) — HackPrinceton Fall 2025

Leap is our HackPrinceton Fall 2025 project exploring how founders can lean on AI co-pilots to validate a business idea faster. Powered by Dedalus Labs agents, Leap (name pending) combines compliance research, financial planning, and a lightweight UX so teams can go from idea → actionable guidance in minutes.

## Why Dedalus-powered agents?
- **Compliance scout**: surfaces licenses, permits, labor laws, and filing links relevant to the idea and location.
- **Financial navigator**: estimates startup + operating costs, budget allocations, and funding sources.
- **Research fusion**: Dedalus MCP servers (Brave Search, Exa, GovInfo) keep results grounded in live, citable sources.

## Architecture
- **Frontend (`frontend/`)** – Vite + React app that collects an idea pitch and displays responses.
- **Backend (`backend/`)** – FastAPI service that forwards submissions to the Dedalus runner (`dedalus_agent.py`) and exposes `POST /api/submit`.
- **Standalone agents (`DEDALUS_PROJECT/`)** – `legal_agent.py` and `financial_agent.py` scripts showcasing deeper prompt flows for Leap’s planned modes.

```
Frontend (Vite/React) ──▶ FastAPI backend ──▶ Dedalus Async runner ──▶ MCP research stack
        ▲                         │
        └────────── realtime responses + JSON payloads ───────────────┘
```

## Tech stack
- Python 3.11+, FastAPI, Dedalus Labs SDK
- React 19 with Vite, Tailwind 4 beta styles
- MCP servers: `windsor/brave-search-mcp`, `joerup/exa-mcp`, `windsor/gov-info-mcp`

## Getting started
### 0. Prerequisites
- Python 3.11+
- Node.js 18+ / npm
- Dedalus Labs account + API key (`DEDALUS_API_KEY`)
- (Optional) OpenAI key if you override the default provider

### 1. Backend setup
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# create backend/.env (not committed)
DEDALUS_API_KEY=your_key
OPENAI_API_KEY=optional_overrides

python main.py  # or uvicorn main:app --reload --port 3000
```

### 2. Frontend setup
```bash
cd frontend
npm install
npm run dev   # defaults to http://localhost:5173
```
The frontend expects the FastAPI server at `http://localhost:3000`. Update `fetch` URL in `src/App.jsx` if the backend runs elsewhere.

### 3. Running the standalone agents (optional research scripts)
Each script loads the same `.env` credentials and streams a richer Dedalus prompt for its domain.
```bash
cd DEDALUS_PROJECT
python legal_agent.py
python financial_agent.py
```

## API contract
- `POST /api/submit`
  - Request body: `{ "message": "plain text business idea" }`
  - Response (success): `{ success: true, data: { received_idea, dedalus_research, status } }`
  - Response (error): `{ success: false, message, data }`

## Repository layout
```
.
├── README.md                # You are here
├── backend/                 # FastAPI service + dedalus agent glue code
├── frontend/                # Vite/React client
└── DEDALUS_PROJECT/         # Raw Dedalus agent scripts + .env placeholder
```

## Roadmap ideas
- Enrich Leap’s UI with structured cards instead of raw JSON.
- Extend the agent pack with go-to-market and hiring advisors.
- Persist session history to capture agent provenance for each idea.

---
Leap is not a law firm or financial advisor; treat the outputs as informed starting points and verify with professionals before acting.


