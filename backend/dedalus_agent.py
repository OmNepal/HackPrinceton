"""
Dedalus Agent Module
Handles business idea research using the Dedalus API
"""
from dedalus_labs import AsyncDedalus, DedalusRunner
from dotenv import load_dotenv
import os

load_dotenv()

async def research_business_idea(user_input: str, location: str = None) -> dict:
    """
    Research legal requirements for a business idea using the Dedalus agent.
    
    Args:
        user_input: The business idea description from the user
        location: Optional location information (city, state, country)
        
    Returns:
        dict: Contains the research results and status
    """
    try:
        client = AsyncDedalus()
        runner = DedalusRunner(client)

        location_context = ""
        if location:
            location_context = f"\n\nIMPORTANT: The business will be located in {location}. Please research location-specific requirements, regulations, and agencies for this area."

        formatted_input = f"""{user_input}{location_context}

Please research:
1. The required business licenses and health permits (specific to the location if provided)
2. Food safety regulations (if applicable)
3. Any state or local taxes that need to be registered for (location-specific)
4. Labor laws for hiring employees (location-specific)
5. Zoning requirements and permits (location-specific)
6. Suggested forms or agencies where these can be filed (with location-specific contact information)
7. Provide links or references for each requirement
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

async def research_financial_planning(user_input: str, budget: str, location: str = None) -> dict:
    """
    Research financial planning and funding options for a business idea using the Dedalus agent.
    
    Args:
        user_input: The business idea description from the user
        budget: Budget range provided by the user
        location: Optional location information (city, state, country)
        
    Returns:
        dict: Contains the research results and status
    """
    try:
        client = AsyncDedalus()
        runner = DedalusRunner(client)

        budget_map = {
            "under-10k": "under $10,000",
            "10k-50k": "$10,000 - $50,000",
            "50k-100k": "$50,000 - $100,000",
            "100k-500k": "$100,000 - $500,000",
            "500k-plus": "$500,000 or more"
        }
        budget_display = budget_map.get(budget, budget)

        location_context = ""
        if location:
            location_context = f"\n\nIMPORTANT: The business will be located in {location}. Please research location-specific funding sources, grants, and local financial programs."

        formatted_input = f"""{user_input}{location_context}

Budget Range: {budget_display}

Please research:
1. Estimate the startup costs (permits, equipment, rent, initial inventory, legal fees) - be specific to the location if provided
2. Estimate monthly operating costs (rent, utilities, staff, supplies, insurance) - location-specific estimates
3. Suggest how to creatively allocate the {budget_display} budget across different startup needs
4. Identify potential funding sources:
   - Local grants and community programs (location-specific)
   - Small-business loans (SBA and local options)
   - Government programs available in the area
   - Angel investors or startup accelerators in the region
5. Provide cost-saving strategies for early operations
6. Return your findings as an organized cost breakdown and funding plan with specific links and contact information
"""

        result = await runner.run(
            input=formatted_input,
            model="openai/gpt-4.1",
            mcp_servers=[
                "windsor/brave-search-mcp",   # for live cost estimates and financial info
                "joerup/exa-mcp",             # semantic search for funding resources
                "windsor/gov-info-mcp"        # for SBA loans, grants, government programs
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

