import asyncio
from dedalus_labs import AsyncDedalus, DedalusRunner
from dotenv import load_dotenv

load_dotenv()

async def run_legal_agent(client, idea):
    runner = DedalusRunner(client)
    response = await runner.run(
        input=f"""Research the legal requirements for starting this business idea:
        {idea}
        Include:
        1. Required licenses and permits
        2. Local, state, and federal regulations
        3. Labor and tax compliance
        4. Agencies and links to apply
        """,
        model="openai/gpt-4.1",
        mcp_servers=[
            "windsor/brave-search-mcp",
            "joerup/exa-mcp",
            "windsor/gov-info-mcp"
        ]
    )
    return response.final_output


async def run_financial_agent(client, idea):
    runner = DedalusRunner(client)
    response = await runner.run(
        input=f"""Estimate the financial aspects for this business idea:
        {idea}
        Include:
        1. Startup and monthly costs (rent, equipment, supplies, staffing)
        2. Budget allocation suggestions (using $15,000 as a base)
        3. Creative cost-saving ideas
        4. Funding sources and grant opportunities
        5. Summarize as a clear, itemized plan.
        """,
        model="openai/gpt-4.1",
        mcp_servers=[
            "windsor/brave-search-mcp",
            "joerup/exa-mcp",
            "windsor/gov-info-mcp"
        ]
    )
    return response.final_output


async def main():
    client = AsyncDedalus()
    business_idea = input("💡 Enter your business idea: ")

    print("\n⚖️ Running Legal Agent...")
    legal_output = await run_legal_agent(client, business_idea)

    print("\n💰 Running Financial Agent...")
    financial_output = await run_financial_agent(client, business_idea)

    print("\n🚀 Combined Startup Plan:\n")
    print("=== LEGAL REQUIREMENTS ===\n")
    print(legal_output)
    print("\n=== FINANCIAL PLAN ===\n")
    print(financial_output)

if __name__ == "__main__":
    asyncio.run(main())
