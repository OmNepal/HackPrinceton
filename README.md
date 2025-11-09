# NeoFoundr

NeoFoundr is an AI-powered co-founder that helps anyone turn a spark of an idea into a launch-ready startup. It blends multi-agent reasoning with real-time market intelligence so founders receive clear legal steps, cost and funding plans, marketing strategy, and an interactive roadmap the moment they submit their concept.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [API Contract](#api-contract)
- [Challenges & Lessons](#challenges--lessons)
- [Roadmap](#roadmap)
- [Built With](#built-with)
- [Team](#team)

## Features
- Translates free-form ideas into structured startup briefs with timeline, milestones, and ownership suggestions.
- Multi-agent workflow (legal + financial) that drafts incorporation checklists, licensing requirements, and funding strategies.
- Live market intelligence pulled from the Daedalus Labs API, persisted in Snowflake, and fused with AI insights.
- Responsive React frontend that visualizes the entire roadmap and streams backend progress in real time.
- FastAPI backend that orchestrates data collection, caching, and AI reasoning while exposing a simple submission endpoint.

## Architecture
```
React (Vite) Frontend  ←→  FastAPI Backend  ←→  Daedalus Labs API
                                       ↘
                                    Snowflake
```
- **Frontend (`frontend/`)** collects user ideas, dispatches them to the backend, and renders the roadmap UI.
- **Backend (`backend/`)** powers `POST /api/submit`, coordinates the legal and financial agents, and combines AI + live data.
- **Agents (`DEDALUS_PROJECT/`)** house standalone legal and financial scripts used both inside the API and for richer experiments.

## Repository Layout
```
.
├── README.md
├── backend/
├── frontend/
└── DEDALUS_PROJECT/
```

## Prerequisites
- Python 3.11+
- Node.js 18+ / npm
- Daedalus Labs account + `DEDALUS_API_KEY`
- Optional: `OPENAI_API_KEY` if overriding the default provider

## Setup
1. **Clone**
   ```bash
   git clone <repo>
   cd HackPrinceton
   ```
2. **Frontend deps**
   ```bash
   cd frontend
   npm install
   ```
3. **Backend deps**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

## Environment Variables
Create `backend/.env` with:
```
DEDALUS_API_KEY=your_dedalus_key
OPENAI_API_KEY=optional_override
SNOWFLAKE_ACCOUNT=...
SNOWFLAKE_USER=...
SNOWFLAKE_PASSWORD=...
```
Adjust Snowflake keys to match your warehouse. `DEDALUS_PROJECT/.env` can hold the same values for the standalone scripts.

## Running Locally
1. **Backend**
   ```bash
   cd backend
   source .venv/bin/activate
   python main.py
   # or: uvicorn main:app --reload --port 3000
   ```
   Swagger UI will be at `http://localhost:3000/docs`.

2. **Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   Open the URL that Vite prints (defaults to `http://localhost:5173`). Keep both servers running for live previews.

3. **Standalone agents (optional)**
   ```bash
   cd DEDALUS_PROJECT
   python legal_agent.py
   python financial_agent.py
   ```

## API Contract
- `POST /api/submit`
  - Request: `{ "message": "plain text business idea" }`
  - Success: `{ success: true, data: { received_idea, roadmap, market_intel, status } }`
  - Error: `{ success: false, message, data }`

## Challenges & Lessons
- Integrating Daedalus Labs live data with AI generations required careful caching and Snowflake modeling.
- Rendering large roadmap payloads exposed latency between React and FastAPI; streaming responses smoothed UX.
- Ensuring AI advice stayed grounded in current market data pushed us to add validation passes and provenance tracking.
- First-time use of Daedalus + Snowflake taught the team how to wire external data pipelines into a reasoning stack.

## Roadmap
1. Expand Daedalus integrations for deeper sector insights and competitive analysis.
2. Automate business registration workflows and stage-based mentorship agents.
3. Connect Snowflake to live financial APIs for up-to-the-minute cost/funding projections.
4. Build collaborative dashboards so teams can track progress and share ventures with advisors or investors.

## Built With
- React 19 + Vite
- FastAPI (Python 3.11)
- Daedalus Labs API
- Snowflake
- OpenAI + multi-agent orchestration

## Team
- **Om Nepal** 
- **Raymond Lee** 
- **Jayden Cruz** 
- **Zameer Qasim** 

---
NeoFoundr is not a law firm or financial advisor. Treat the generated guidance as a starting point and verify with professionals before acting.
