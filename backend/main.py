from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="FoundrMate API", version="1.0.0")

# CORS configuration to allow frontend to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port and common React ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model for the submit endpoint
class BusinessIdeaRequest(BaseModel):
    message: str

# Response model
class BusinessIdeaResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

@app.get("/")
async def root():
    return {"message": "FoundrMate API is running"}

@app.post("/api/submit", response_model=BusinessIdeaResponse)
async def submit_business_idea(request: BusinessIdeaRequest):
    """
    Receives a business idea from the frontend and processes it.
    This endpoint will later call the Dedalus agent and other AI services.
    """
    try:
        # For now, return a simple response
        # Later we'll integrate the Dedalus agent here
        return BusinessIdeaResponse(
            success=True,
            message="Business idea received successfully",
            data={
                "received_idea": request.message,
                "status": "processing",
                "note": "Dedalus agent integration coming soon"
            }
        )
    except Exception as e:
        return BusinessIdeaResponse(
            success=False,
            message=f"Error processing request: {str(e)}",
            data=None
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)

