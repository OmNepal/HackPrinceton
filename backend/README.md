# FoundrMate Backend

FastAPI backend for FoundrMate application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the backend directory with your API keys:
```
DEDALUS_API_KEY=your_dedalus_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

3. Run the server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --port 3000
```

The API will be available at `http://localhost:3000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:3000/docs`
- ReDoc: `http://localhost:3000/redoc`

## Endpoints

- `POST /api/submit` - Submit a business idea for processing

