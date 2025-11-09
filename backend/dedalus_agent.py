"""
Dedalus Agent Module
Handles business idea research using the Dedalus API
"""
from dedalus_labs import AsyncDedalus, DedalusRunner
from dotenv import load_dotenv
import os

load_dotenv()

async def research_business_idea(user_input: str) -> dict:
    """
    Research a business idea using the Dedalus agent.
    
    Args:
        user_input: The business idea description from the user
        
    Returns:
        dict: Contains the research results and status
    """
    try:
        client = AsyncDedalus()
        runner = DedalusRunner(client)

        # Format the user input with research instructions
        formatted_input = f"""{user_input}

Please research:
1. The required business licenses and health permits
2. Food safety regulations (if applicable)
3. Any state or local taxes that need to be registered for
4. Labor laws for hiring employees
5. Suggested forms or agencies where these can be filed
6. Provide links or references for each requirement
"""

        result = await runner.run(
            input=formatted_input,
            model="openai/gpt-4.1",
            mcp_servers=[
                "windsor/brave-search-mcp",   # General legal and regulation search
                "joerup/exa-mcp",             # Semantic web research
                "windsor/gov-info-mcp"        # U.S. government info and permit resources
            ]
        )

        return {
            "success": True,
            "research_results": result.final_output,
            "status": "completed"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "status": "failed"
        }

