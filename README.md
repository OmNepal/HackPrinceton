# Foundaura+

**Empowering the founder in everyone.**

Foundaura+ is an AI-powered business planning platform that transforms entrepreneurial ideas into actionable, compliance-ready business plans. By leveraging **Snowflake Cortex AI** for intelligent orchestration and **Dedalus Labs** for real-time research, Foundaura+ provides founders with location-specific legal requirements, budget-aware financial planning, and professional business briefs—all from a simple voice or text input.

## Table of Contents
- [Features](#features)
- [Snowflake Integration](#snowflake-integration)
- [Architecture](#architecture)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [How It Works](#how-it-works)
- [Challenges & Lessons](#challenges--lessons)
- [Roadmap](#roadmap)
- [Built With](#built-with)
- [Team](#team)

## Features

### Core Capabilities
- **🎤 Voice Input**: Speak your business idea and get instant transcription using Snowflake Cortex AI_TRANSCRIBE
- **💡 Intelligent Intent Parsing**: Snowflake Cortex LLM extracts business type, industry, and requirements from free-form text
- **🤖 AI-Powered Agent Orchestration**: Snowflake intelligently routes requests to specialized research agents based on context
- **⚖️ Legal Research**: Location-specific business licenses, permits, tax registration, labor laws, and zoning requirements via Dedalus Labs
- **💰 Financial Planning**: Budget-aware cost breakdowns, funding sources (grants, loans, investors), and financial recommendations
- **📊 Unified Business Plan**: Snowflake synthesizes legal and financial research into a cohesive, actionable plan with executive summary, action items, risk assessment, and next steps
- **📄 Professional Business Briefs**: Generate investor-ready PDF documents with market opportunity analysis, target audience, and strategic plans
- **🎨 Modern UI**: Beautiful, responsive interface with dark/light theme toggle, smooth animations, and glassmorphism design

### User Experience
- **Interactive Legal Checklist**: Track compliance steps with progress indicators and clickable checkboxes
- **Visual Financial Breakdown**: Color-coded cost analysis and funding source cards with direct links
- **Tabbed Interface**: Seamlessly switch between legal and financial insights
- **Real-time Processing**: Live updates as AI processes your idea through multiple stages

## Snowflake Integration

**Foundaura+ is built on Snowflake Cortex AI**, making it a true Snowflake-first application. Snowflake powers every AI operation in the platform:

### 1. **Intent Parsing** (`parse_intent`)
- Uses Snowflake Cortex LLM to extract structured information from user input
- Identifies business type, industry, location, and determines legal/financial needs
- Returns JSON with actionable insights for downstream processing

### 2. **Agent Orchestration** (`orchestrate_agents`)
- Snowflake Cortex analyzes the business idea and context to intelligently route requests
- Determines which agents (legal/financial) should be called and with what priority
- Generates enhanced prompts for each agent based on the specific business context
- Provides reasoning for routing decisions, enabling transparent AI decision-making

### 3. **Response Formatting** (`format_response`)
- Snowflake Cortex structures raw research data into clean, organized JSON
- Formats legal requirements into step-by-step checklists with agencies and links
- Formats financial data into cost breakdowns, funding sources, and recommendations
- Ensures consistent, user-friendly output regardless of input format

### 4. **Response Synthesis** (`synthesize_responses`)
- Combines legal and financial research into a unified business plan
- Generates executive summary, action plans, risk assessments, and recommendations
- Creates cohesive narratives that tie together all research findings
- Produces actionable next steps for entrepreneurs

### 5. **Business Brief Generation** (`generate_complete_business_brief`)
- Uses Snowflake Cortex with Claude 4 Sonnet (with fallback to default model) for structured content generation
- Generates multiple targeted sections: Executive Summary, Market Opportunity, Target Audience, Plan of Action, Why This Idea Could Succeed
- Each section is created through dedicated Snowflake Cortex calls for maximum quality
- Supports cross-region inference for advanced model access

### 6. **Audio Transcription** (`AI_TRANSCRIBE`)
- Leverages Snowflake Cortex AI_TRANSCRIBE SQL function for voice-to-text conversion
- Uploads audio files to Snowflake stages and executes SQL queries for transcription
- Enables hands-free idea input through natural speech
- Returns accurate transcripts that populate the business idea input field

### Why Snowflake Matters
- **Unified AI Platform**: All AI operations (parsing, orchestration, formatting, synthesis, transcription) run through Snowflake Cortex, eliminating the need for multiple third-party services
- **Intelligent Routing**: Snowflake's orchestration capabilities ensure the right agents are called with the right context, optimizing both cost and accuracy
- **Scalable Architecture**: Snowflake's cloud-native infrastructure handles variable loads seamlessly
- **Enterprise-Grade Security**: All data processing happens within Snowflake's secure environment
- **Advanced Models**: Access to cutting-edge models like Claude 4 Sonnet through Snowflake Cortex, with intelligent fallback mechanisms

## Architecture

```
┌─────────────────┐
│  React Frontend │
│  (Vite + Tailwind) │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼─────────────────────────────────────┐
│         FastAPI Backend                      │
│  ┌──────────────────────────────────────┐   │
│  │  Snowflake Cortex AI (Primary)       │   │
│  │  • Intent Parsing                    │   │
│  │  • Agent Orchestration               │   │
│  │  • Response Formatting               │   │
│  │  • Response Synthesis                │   │
│  │  • Business Brief Generation         │   │
│  │  • Audio Transcription (SQL)        │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  Dedalus Labs Agents (Research)      │   │
│  │  • Legal Agent (MCP Servers)        │   │
│  │  • Financial Agent (MCP Servers)    │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
         │
         │ SQL Queries
         │
┌────────▼────────┐
│   Snowflake     │
│   • Cortex AI   │
│   • SQL Engine  │
│   • Data Lake   │
└─────────────────┘
```

### Component Breakdown
- **Frontend (`frontend/`)**: React application with Framer Motion animations, TailwindCSS styling, and responsive design. Handles user authentication, voice recording, idea submission, and results visualization.
- **Backend (`backend/`)**: FastAPI server that orchestrates Snowflake Cortex AI calls, routes to Dedalus Labs agents, formats responses, and generates PDFs. All AI intelligence flows through Snowflake.
- **Snowflake Integration**: Core AI engine handling intent parsing, orchestration, formatting, synthesis, business brief generation, and audio transcription via SQL functions.
- **Dedalus Labs Integration**: Specialized research agents that provide real-time legal and financial intelligence, orchestrated by Snowflake.

## Repository Layout

```
.
├── README.md
├── backend/
│   ├── main.py                 # FastAPI app with all endpoints
│   ├── snowflake_service.py    # Snowflake Cortex AI integration
│   ├── dedalus_agent.py        # Dedalus Labs agent wrappers
│   ├── transcription_service.py # Snowflake AI_TRANSCRIBE service
│   ├── pdf_generator.py        # Business brief PDF generation
│   ├── auth.py                 # Authentication routes
│   ├── database.py             # Database connection (optional)
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main application component
│   │   ├── Auth.jsx           # Authentication component
│   │   ├── components/        # UI components (LegalTab, FinanceTab, etc.)
│   │   ├── context/           # Theme context
│   │   └── index.css          # Global styles
│   ├── public/
│   │   └── logo.png           # Application logo
│   └── package.json           # Frontend dependencies
└── .env.example               # Environment variable template
```

## Prerequisites

- **Python 3.11+**
- **Node.js 18+** / npm
- **Snowflake Account** with:
  - Cortex AI enabled
  - Personal Access Token (PAT) or password authentication
  - Warehouse, database, and schema configured
  - Optional: Cross-region inference enabled for Claude 4 Sonnet
- **Dedalus Labs Account** + `DEDALUS_API_KEY`
- **Microphone Access** (for voice input feature)

## Setup

### 1. Clone the Repository
```bash
git clone <repo>
cd HackPrinceton
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Environment Variables

Create `backend/.env` with the following variables:

### Snowflake Configuration (Required)
```env
# Snowflake Connection (for SQL operations like AI_TRANSCRIBE)
SNOWFLAKE_ACCOUNT=your_account_identifier
SNOWFLAKE_USER=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=your_warehouse
SNOWFLAKE_DATABASE=your_database
SNOWFLAKE_SCHEMA=your_schema
SNOWFLAKE_ROLE=your_role  # Optional

# Snowflake REST API (for Cortex AI operations)
SNOWFLAKE_PAT=your_personal_access_token
SNOWFLAKE_HOST=your_snowflake_host_url  # e.g., https://xxxxx.snowflakecomputing.com
SNOWFLAKE_MODEL=your_default_model  # e.g., mistral-large

# Optional: Custom model for business briefs
BRIEF_MODEL=claude-4-sonnet  # Falls back to SNOWFLAKE_MODEL if unavailable

# Optional: Custom stage name for audio transcription
SNOWFLAKE_AUDIO_STAGE=audio_transcription_stage
```

### Dedalus Labs Configuration (Required)
```env
DEDALUS_API_KEY=your_dedalus_api_key
```

### Optional Configuration
```env
# JWT Secret for authentication
JWT_SECRET=your_jwt_secret_key

# MongoDB (optional, currently disabled)
MONGODB_URI=mongodb://localhost:27017/foundrmate
```

## Running Locally

### 1. Start the Backend
```bash
cd backend
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uvicorn main:app --reload --port 3000
```

The API will be available at `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- API Health: `http://localhost:3000/`

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port Vite assigns)

### 3. Access the Application
1. Open `http://localhost:5173` in your browser
2. Register or login
3. Enter your business idea (text or voice)
4. Select budget and location (optional)
5. Click "Analyze Idea" and watch Snowflake orchestrate the entire workflow

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login existing user
- `POST /api/auth/verify` - Verify JWT token

### Business Planning
- `POST /api/submit` - Submit business idea for analysis
  - **Request Body**:
    ```json
    {
      "message": "Your business idea description",
      "budget": "10k-50k",  // Optional
      "location": "Princeton, NJ"  // Optional
    }
    ```
  - **Response**:
    ```json
    {
      "success": true,
      "message": "Business idea processed successfully",
      "data": {
        "received_idea": "...",
        "budget": "...",
        "location": "...",
        "legal": {
          "formatted": { /* structured legal data */ }
        },
        "financial": {
          "formatted": { /* structured financial data */ }
        },
        "synthesized_plan": {
          "executive_summary": "...",
          "action_plan": { /* ... */ },
          "risk_assessment": { /* ... */ },
          "recommendations": [ /* ... */ ],
          "next_steps": [ /* ... */ ]
        }
      }
    }
    ```

### Business Brief Generation
- `POST /api/business-brief` - Generate PDF business brief
  - **Request Body**:
    ```json
    {
      "idea": "Business idea text",
      "budget": "10k-50k",
      "location": "Princeton, NJ",
      "legal_data": { /* optional */ },
      "financial_data": { /* optional */ },
      "synthesized_plan": { /* optional */ }
    }
    ```
  - **Response**: PDF file download

### Audio Transcription
- `POST /api/transcribe` - Transcribe audio to text
  - **Request**: Multipart form data with audio file
  - **Response**:
    ```json
    {
      "transcript": "Transcribed text from audio"
    }
    ```

## How It Works

### 1. User Input
- User enters business idea via text or voice
- Voice input is transcribed using Snowflake Cortex AI_TRANSCRIBE SQL function
- Optional: User provides budget range and location

### 2. Snowflake Intent Parsing
- Business idea is sent to Snowflake Cortex LLM
- Extracts structured information: business type, industry, location, needs

### 3. Snowflake Agent Orchestration
- Snowflake Cortex analyzes the idea and context
- Determines which agents (legal/financial) to call and with what priority
- Generates enhanced prompts for each agent

### 4. Dedalus Labs Research
- Legal Agent: Researches location-specific requirements using MCP servers (Brave Search, Exa, Gov Info)
- Financial Agent: Provides budget-aware financial planning and funding sources
- Both agents return raw research data

### 5. Snowflake Response Formatting
- Raw research is sent to Snowflake Cortex for structuring
- Legal data formatted into step-by-step checklists
- Financial data formatted into cost breakdowns and funding sources

### 6. Snowflake Response Synthesis
- Snowflake Cortex combines all research into unified business plan
- Generates executive summary, action plan, risk assessment, recommendations

### 7. Results Display
- Frontend displays formatted legal and financial data in tabbed interface
- Interactive checklists, progress bars, and expandable sections
- User can generate professional PDF business brief

### 8. Business Brief Generation
- Snowflake Cortex generates structured sections (Executive Summary, Market Opportunity, etc.)
- PDF is created server-side using ReportLab
- Automatically downloads to user's device

## Challenges & Lessons

### Technical Challenges
- **Snowflake Integration**: Learning to leverage Snowflake Cortex AI for multiple use cases (parsing, orchestration, formatting, synthesis) required understanding the full capabilities of the platform
- **Audio Transcription**: Implementing Snowflake AI_TRANSCRIBE via SQL required learning Snowflake stage management and SQL function execution
- **Cross-Region Inference**: Enabling Claude 4 Sonnet access required configuring cross-region inference settings in Snowflake
- **Agent Orchestration**: Designing intelligent routing logic that uses Snowflake to determine which agents to call based on context
- **Response Synthesis**: Combining multiple agent outputs into cohesive business plans required careful prompt engineering with Snowflake Cortex

### Lessons Learned
- **Snowflake-First Architecture**: Building the entire AI pipeline on Snowflake Cortex eliminated the need for multiple third-party services and simplified the architecture
- **Intelligent Orchestration**: Using Snowflake to orchestrate agents rather than hardcoding routing logic made the system more flexible and context-aware
- **SQL vs REST**: Understanding when to use Snowflake SQL functions (like AI_TRANSCRIBE) vs REST API (like Cortex inference) was crucial for optimal performance
- **Model Fallbacks**: Implementing fallback mechanisms for advanced models (Claude 4 Sonnet) ensured reliability across different Snowflake regions
- **Structured Output**: Using Snowflake Cortex to format unstructured research data into consistent JSON structures improved frontend rendering and user experience

## Roadmap

### Short Term
- [ ] Expand Snowflake data storage for business brief persistence
- [ ] Add more specialized agents (marketing, operations) orchestrated by Snowflake
- [ ] Implement Snowflake-based caching for frequently requested research
- [ ] Add collaborative features with Snowflake-backed user management

### Medium Term
- [ ] Real-time Snowflake data pipelines for live market intelligence
- [ ] Advanced Snowflake analytics for business plan quality scoring
- [ ] Multi-language support using Snowflake Cortex translation capabilities
- [ ] Integration with Snowflake Marketplace for additional data sources

### Long Term
- [ ] Automated business registration workflows using Snowflake orchestration
- [ ] AI-powered mentorship agents with Snowflake Cortex
- [ ] Predictive analytics for startup success using Snowflake ML
- [ ] Collaborative dashboards with real-time Snowflake data synchronization

## Built With

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Icons** - Icon library

### Backend
- **FastAPI** - Modern Python web framework
- **Python 3.11+** - Programming language
- **Uvicorn** - ASGI server
- **ReportLab** - PDF generation
- **snowflake-connector-python** - Snowflake SQL connectivity
- **httpx** - Async HTTP client for Snowflake REST API

### AI & Data
- **Snowflake Cortex AI** - Primary AI platform
  - LLM inference (intent parsing, orchestration, formatting, synthesis)
  - Business brief generation (Claude 4 Sonnet with fallback)
  - Audio transcription (AI_TRANSCRIBE SQL function)
- **Dedalus Labs API** - Specialized research agents
  - Legal research with MCP servers (Brave Search, Exa, Gov Info)
  - Financial planning with real-time market data

### Infrastructure
- **Snowflake** - Data platform and AI engine
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

## Team

- **Om Nepal**
- **Raymond Lee**
- **Jayden Cruz**
- **Zameer Qasim**

---

**Disclaimer**: Foundaura+ is not a law firm or financial advisor. The generated guidance, legal requirements, and financial recommendations are provided as a starting point for entrepreneurs. Always verify information with licensed professionals before making business decisions or taking legal/financial actions.

**Built for HackPrinceton 2024**
