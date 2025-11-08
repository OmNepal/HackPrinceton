import asyncio
from dedalus_labs import AsyncDedalus, DedalusRunner
from dotenv import load_dotenv
from dedalus_labs.utils.streaming import stream_async

load_dotenv()

async def main():
    client = AsyncDedalus()
    runner = DedalusRunner(client)

    user_input = """I want to open a small matcha café in Tennessee.
    Please:
    1. Estimate the startup and monthly operating costs (permits, equipment, rent, staff, supplies)
    2. Suggest how to allocate an initial $15,000 budget creatively
    3. Identify potential funding sources (local grants, small-business loans, community programs)
    4. Provide cost-saving strategies for early operations
    5. Return your findings as an organized cost breakdown and funding plan.
    """

    result = await runner.run(
        input=user_input,
        model="openai/gpt-4.1",
        mcp_servers=[
            "windsor/brave-search-mcp",   # for live cost estimates and financial info
            "joerup/exa-mcp",             # semantic search for funding resources
            "windsor/gov-info-mcp"        # for SBA loans, grants, government programs
        ]
    )

    print("\n💰 Financial Planning Results:\n")
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
