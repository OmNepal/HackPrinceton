from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from contextlib import asynccontextmanager
from dedalus_agent import research_business_idea
from snowflake_service import parse_intent, format_response
from database import connect_db, close_db
from auth import router as auth_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to database
    # await connect_db()
    yield
    # Shutdown: Close database connection
    # await close_db()

app = FastAPI(title="FoundrMate API", version="1.0.0", lifespan=lifespan)

# Include auth routes
app.include_router(auth_router)

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
    Receives a business idea from the frontend and processes it:
    1. Parses intent using Snowflake
    2. Routes to appropriate agent (legal agent for now)
    3. Formats response using Snowflake
    4. Returns structured response to frontend
    """
    try:
        # Step 1: Parse intent using Snowflake
        parsed_intent = await parse_intent(request.message)

        print(parsed_intent)
        print("parsed_intent type", type(parsed_intent))
        # Step 2: Route to legal agent (Dedalus) since it's the only one available
        # In the future, we can check parsed_intent["needs"]["legal"] or ["needs"]["finance"]
        dedalus_result = await research_business_idea(request.message)
        print(dedalus_result)
        print("dedalus_result type", type(dedalus_result))
        
        #errors not from here
        if not dedalus_result["success"]:
            return BusinessIdeaResponse(
                success=False,
                message=f"Dedalus agent error: {dedalus_result.get('error', 'Unknown error')}",
                data={
                    "received_idea": request.message,
                    "parsed_intent": parsed_intent,
                    "status": "failed"
                }
            )
        
        # Step 3: Format the Dedalus response using Snowflake
        formatted_response = await format_response(
            dedalus_result["research_results"],
            "legal"  # Since we're using legal agent
        )

        print("formatted_response", formatted_response)
        print(type(formatted_response))
        # Step 4: Return structured response
        return BusinessIdeaResponse(
            success=True,
            message="Business idea processed successfully",
            data={
                "received_idea": request.message,
                "parsed_intent": parsed_intent,
                "formatted_response": formatted_response,
                "raw_dedalus_research": dedalus_result["research_results"],  # Keep raw for reference
                "status": "completed"
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

