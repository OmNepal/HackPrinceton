from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
from contextlib import asynccontextmanager
from dedalus_agent import research_business_idea, research_financial_planning
from snowflake_service import parse_intent, format_response, orchestrate_agents, synthesize_responses, generate_complete_business_brief
from pdf_generator import create_business_brief_pdf_from_structured, generate_pdf_filename
from transcription_service import transcribe_audio_from_bytes
from database import connect_db, close_db
from auth import router as auth_router
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
   

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
    budget: Optional[str] = None
    location: Optional[str] = None

# Response model
class BusinessIdeaResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

# Request model for business brief
class BusinessBriefRequest(BaseModel):
    idea: str
    budget: Optional[str] = None
    location: Optional[str] = None
    legal_data: Optional[dict] = None
    financial_data: Optional[dict] = None
    synthesized_plan: Optional[dict] = None

@app.get("/")
async def root():
    return {"message": "FoundrMate API is running"}

@app.post("/api/submit", response_model=BusinessIdeaResponse)
async def submit_business_idea(request: BusinessIdeaRequest):
    """
    Receives a business idea from the frontend and processes it using Snowflake orchestration:
    1. Parses intent using Snowflake
    2. Uses Snowflake to orchestrate agent routing (determines which agents to call and priority)
    3. Routes to agents based on Snowflake orchestration decisions:
       - Legal agent: Called if Snowflake recommends OR if location is provided
       - Financial agent: Called if Snowflake recommends OR if budget is provided
    4. Formats agent responses using Snowflake
    5. Synthesizes combined response using Snowflake (creates unified business plan)
    6. Returns structured response with legal, financial, and synthesized plan data
    """
    try:
        # Step 1: Parse intent using Snowflake
        parsed_intent = await parse_intent(request.message)
        print("Parsed intent:", parsed_intent)
        
        # Step 2: Use Snowflake to orchestrate agent routing
        orchestration = await orchestrate_agents(
            request.message,
            request.budget,
            request.location,
            parsed_intent
        )
        print("Snowflake orchestration:", orchestration)
        
        # Step 3: Route to agents based on Snowflake orchestration
        legal_result = None
        financial_result = None
        
        # Call legal agent if Snowflake recommends it (or if location is provided as fallback)
        if orchestration.get("should_call_legal", True) or request.location:
            legal_prompt_enhancement = orchestration.get("enhanced_prompts", {}).get("legal", "")
            enhanced_message = request.message
            if legal_prompt_enhancement:
                enhanced_message = f"{request.message}\n\nAdditional context: {legal_prompt_enhancement}"
            legal_result = await research_business_idea(enhanced_message, request.location)
            print("Legal agent result:", legal_result)
        
        # Call financial agent if Snowflake recommends it OR if budget is provided
        if orchestration.get("should_call_financial", False) or request.budget:
            financial_prompt_enhancement = orchestration.get("enhanced_prompts", {}).get("financial", "")
            enhanced_message = request.message
            if financial_prompt_enhancement:
                enhanced_message = f"{request.message}\n\nAdditional context: {financial_prompt_enhancement}"
            financial_result = await research_financial_planning(
                enhanced_message, 
                request.budget or "not-specified", 
                request.location
            )
            print("Financial agent result:", financial_result)
        
        # Check for errors
        if legal_result and not legal_result["success"]:
            return BusinessIdeaResponse(
                success=False,
                message=f"Legal agent error: {legal_result.get('error', 'Unknown error')}",
                data={
                    "received_idea": request.message,
                    "budget": request.budget,
                    "location": request.location,
                    "parsed_intent": parsed_intent,
                    "orchestration": orchestration,
                    "status": "failed"
                }
            )
        
        if financial_result and not financial_result["success"]:
            return BusinessIdeaResponse(
                success=False,
                message=f"Financial agent error: {financial_result.get('error', 'Unknown error')}",
                data={
                    "received_idea": request.message,
                    "budget": request.budget,
                    "location": request.location,
                    "parsed_intent": parsed_intent,
                    "orchestration": orchestration,
                    "status": "failed"
                }
            )
        
        # Step 4: Format responses using Snowflake
        formatted_legal = None
        if legal_result:
            formatted_legal = await format_response(
                legal_result["research_results"],
                "legal"
            )
        
        formatted_financial = None
        if financial_result:
            formatted_financial = await format_response(
                financial_result["research_results"],
                "finance"
            )

        print("formatted_legal", formatted_legal)
        if formatted_financial:
            print("formatted_financial", formatted_financial)
        
        # Step 5: Use Snowflake to synthesize combined response
        synthesized_plan = None
        try:
            synthesized_plan = await synthesize_responses(
                legal_data=formatted_legal,
                financial_data=formatted_financial,
                user_message=request.message,
                location=request.location,
                budget=request.budget
            )
            print("Synthesized plan:", synthesized_plan)
        except Exception as e:
            print(f"Warning: Snowflake synthesis failed: {e}")
            synthesized_plan = None
        
        # Step 6: Return structured response
        response_data = {
            "received_idea": request.message,
            "budget": request.budget,
            "location": request.location,
            "parsed_intent": parsed_intent,
            "orchestration": orchestration,
            "status": "completed"
        }
        
        if legal_result:
            response_data["legal"] = {
                "formatted": formatted_legal,
                "raw": legal_result["research_results"]
            }
        
        if financial_result:
            response_data["financial"] = {
                "formatted": formatted_financial,
                "raw": financial_result["research_results"]
            }
        
        if synthesized_plan:
            response_data["synthesized_plan"] = synthesized_plan
        
        return BusinessIdeaResponse(
            success=True,
            message="Business idea processed successfully",
            data=response_data
        )
        
    except Exception as e:
        return BusinessIdeaResponse(
            success=False,
            message=f"Error processing request: {str(e)}",
            data=None
        )


@app.post("/api/business-brief")
async def generate_business_brief(request: BusinessBriefRequest):
    """
    Generate a business brief PDF from the current idea/session data.
    This creates a marketing-style brief (not legal/financial checklist).
    Uses Gemini to generate structured sections.
    """
    try:
        # Step 1: Generate complete structured business brief using Gemini
        brief_data = await generate_complete_business_brief(
            idea=request.idea,
            budget=request.budget,
            location=request.location,
            legal_data=request.legal_data,
            financial_data=request.financial_data,
            synthesized_plan=request.synthesized_plan
        )
        
        # Step 2: Generate PDF from the structured brief data
        idea_name = brief_data.get("idea_summary", request.idea[:50] if request.idea else "Business Idea")
        pdf_buffer = create_business_brief_pdf_from_structured(brief_data)
        
        # Step 3: Generate filename
        filename = generate_pdf_filename(idea_name)
        
        # Step 4: Store brief (for future: could store in Snowflake database here)
        # For now, we'll just return the PDF
        # TODO: If Snowflake database is set up, store:
        # - brief_data as JSON in marketing_brief_text column
        # - filename/path in marketing_brief_pdf_url column
        
        # Step 5: Return PDF as downloadable file
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
        
    except Exception as e:
        print(f"Error generating business brief: {e}")
        import traceback
        traceback.print_exc()
        from fastapi import HTTPException
        raise HTTPException(
            status_code=500,
            detail=f"Error generating business brief: {str(e)}"
        )


@app.post("/api/transcribe")
async def transcribe_audio_endpoint(audio: UploadFile = File(...)):
    """
    Transcribe audio file using Snowflake Cortex Audio Transcribe.
    Accepts audio file upload and returns transcribed text.
    """
    try:
        # Read audio file content
        audio_bytes = await audio.read()
        
        if not audio_bytes:
            return JSONResponse(
                status_code=400,
                content={"error": "No audio file provided"}
            )
        
        # Get filename from upload
        filename = audio.filename or "recording.webm"
        
        # Transcribe using Snowflake Cortex Audio Transcribe
        transcript = await transcribe_audio_from_bytes(audio_bytes, filename)
        
        return JSONResponse(
            content={"transcript": transcript}
        )
        
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        import traceback
        traceback.print_exc()
        from fastapi import HTTPException
        raise HTTPException(
            status_code=500,
            detail=f"Error transcribing audio: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)

