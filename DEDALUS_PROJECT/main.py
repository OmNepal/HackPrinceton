import asyncio
from dedalus_labs import AsyncDedalus, DedalusRunner
from dotenv import load_dotenv
from dedalus_labs.utils.streaming import stream_async

load_dotenv()

async def main():
    client = AsyncDedalus()
    runner = DedalusRunner(client)

    # User-provided input
    user_input = """I want to start a matcha café in Tennessee.
    Please research:
    1. The required business licenses and health permits
    2. Food safety regulations for small cafés
    3. Any state or local taxes I need to register for
    4. Labor laws for hiring employees
    5. Suggested forms or agencies where I can file these
    6. Provide links or references for each requirement
    """

    result = await runner.run(
        input=user_input,
        model="openai/gpt-4.1",
        mcp_servers=[
            "windsor/brave-search-mcp",   # General legal and regulation search
            "joerup/exa-mcp",             # Semantic web research
            "windsor/gov-info-mcp"        # U.S. government info and permit resources (if available)
        ]
    )

    print("\n🔍 Business Formation Research Results:\n")
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
