"""
Snowflake AI (Cortex) REST API Service
Handles intent parsing and response formatting using Snowflake's LLM API
"""

import os
import json
import httpx
from typing import Dict, Literal
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- SNOWFLAKE CONFIGURATION ---
SNOWFLAKE_ACCOUNT = os.getenv("SNOWFLAKE_ACCOUNT")
SNOWFLAKE_USER = os.getenv("SNOWFLAKE_USER")
SNOWFLAKE_ROLE = os.getenv("SNOWFLAKE_ROLE")
SNOWFLAKE_PAT = os.getenv("SNOWFLAKE_PAT")
SNOWFLAKE_MODEL = os.getenv("SNOWFLAKE_MODEL")
SNOWFLAKE_HOST = os.getenv("SNOWFLAKE_HOST")



# Ensure endpoint is correct
def ensure_protocol(url: str) -> str:
    """Ensure URL has https:// protocol"""
    if not url:
        return url
    url = url.strip().rstrip('/')
    if url.startswith('http://') or url.startswith('https://'):
        return url
    return f"https://{url}"

if SNOWFLAKE_HOST:
    BASE_ENDPOINT = ensure_protocol(SNOWFLAKE_HOST)
    CORTEX_ENDPOINT = f"{BASE_ENDPOINT}/api/v2/cortex/inference:complete"
else:
    BASE_ENDPOINT = None
    CORTEX_ENDPOINT = None

# --- HELPER FUNCTIONS ---
def _build_headers() -> dict:
    return {
        "Authorization": f'Bearer {SNOWFLAKE_PAT}',
        "Content-Type": "application/json",
        # "X-Snowflake-Account": SNOWFLAKE_ACCOUNT,
        # "X-Snowflake-User": SNOWFLAKE_USER,
        # "X-Snowflake-Role": SNOWFLAKE_ROLE,
        "Accept": "application/json",
    }



# --- CORE FUNCTION: PARSE INTENT ---
async def parse_intent(user_text: str) -> Dict:
    """Extract structured info (business type, industry, etc.) from user text using Snowflake LLM."""
    if not SNOWFLAKE_PAT or not SNOWFLAKE_HOST:
        raise ValueError("SNOWFLAKE_PAT and SNOWFLAKE_HOST must be set in environment variables")
    if not CORTEX_ENDPOINT:
        raise ValueError("SNOWFLAKE_HOST must be set to construct the endpoint")
    
    system_prompt = """You are a business intent parser. Extract structured information from user business ideas.
Return ONLY valid JSON with this structure:
{
  "business_type": "string",
  "industry": "string",
  "location": "string",
  "needs": { "legal": true/false, "finance": true/false }
}"""

    user_prompt = f"""Parse the following business idea and extract structured information:
{user_text}

Return only the JSON object, no extra text."""

    payload = {
        "model": SNOWFLAKE_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
        # "temperature": 0.3,
        # "response_format": {"type": "json_object"},
    }

    headers = _build_headers()

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(CORTEX_ENDPOINT, json=payload, headers=headers)
        resp.raise_for_status()
        result = resp.json()

    try:
          # This will raise a ValueError if the JSON is invalid

        
        # Cortex responses are OpenAI-compatible
        content = result["choices"][0]["message"]["content"]
        print(type(content)) #this is string
        print(content)

        # cleaned_content = content.strip().replace("\n", "").replace("```", "")
        # print(type(cleaned_content))
        # print(cleaned_content)
        # return json.loads(cleaned_content)
        # print(content.research_results)
        cleaned_content = content.strip().replace("\n", "").replace("", "").replace("```", "").replace("json", "", 1).strip() #cleanup the string, only have json stuff in
        print("cleaned_content", cleaned_content)
        return json.loads(cleaned_content)# converting string to dict 
    except Exception as e:
        raise Exception(f"Unexpected response format from Snowflake API: {result}") from e


# --- CORE FUNCTION: ORCHESTRATE AGENTS ---
async def orchestrate_agents(user_message: str, budget: str = None, location: str = None, parsed_intent: Dict = None) -> Dict:
    """
    Use Snowflake to orchestrate agent routing and determine which agents to call.
    Returns a decision object with agent routing recommendations.
    """
    if not SNOWFLAKE_PAT or not SNOWFLAKE_HOST:
        raise ValueError("SNOWFLAKE_PAT and SNOWFLAKE_HOST must be set in environment variables")
    if not CORTEX_ENDPOINT:
        raise ValueError("SNOWFLAKE_HOST must be set to construct the endpoint")
    
    context_info = []
    if location:
        context_info.append(f"Location: {location}")
    if budget:
        context_info.append(f"Budget: {budget}")
    context_str = ", ".join(context_info) if context_info else "No additional context"
    
    intent_info = ""
    if parsed_intent:
        intent_info = f"\nParsed Intent: Business type: {parsed_intent.get('business_type', 'unknown')}, Industry: {parsed_intent.get('industry', 'unknown')}, Needs: {parsed_intent.get('needs', {})}"
    
    system_prompt = """You are an agent orchestration system. Analyze the business idea and context to determine which agents should be called and with what priority.
Return ONLY valid JSON with this structure:
{
  "should_call_legal": true/false,
  "should_call_financial": true/false,
  "legal_priority": "high/medium/low",
  "financial_priority": "high/medium/low",
  "reasoning": "brief explanation of routing decisions",
  "enhanced_prompts": {
    "legal": "suggested enhancements to legal agent prompt",
    "financial": "suggested enhancements to financial agent prompt"
  }
}"""

    user_prompt = f"""Analyze this business idea and determine agent routing:
Business Idea: {user_message}
Context: {context_str}{intent_info}

Consider:
- Legal agent should be called if business needs licenses, permits, or regulatory compliance
- Financial agent should be called if budget is provided OR if financial planning is needed
- Priority indicates urgency/importance of each agent's research

Return only the JSON object."""

    payload = {
        "model": SNOWFLAKE_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
    }

    headers = _build_headers()

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(CORTEX_ENDPOINT, json=payload, headers=headers)
        resp.raise_for_status()
        result = resp.json()

    try:
        content = result["choices"][0]["message"]["content"]
        cleaned_content = content.strip().replace("\n", "").replace("", "").replace("```", "").replace("json", "", 1).strip()
        return json.loads(cleaned_content)
    except Exception as e:
        raise Exception(f"Unexpected response format from Snowflake orchestration API: {result}") from e


# --- CORE FUNCTION: SYNTHESIZE RESPONSES ---
async def synthesize_responses(legal_data: Dict = None, financial_data: Dict = None, user_message: str = None, location: str = None, budget: str = None) -> Dict:
    """
    Use Snowflake to synthesize and combine agent responses into a cohesive business plan.
    """
    if not SNOWFLAKE_PAT or not SNOWFLAKE_HOST:
        raise ValueError("SNOWFLAKE_PAT and SNOWFLAKE_HOST must be set in environment variables")
    if not CORTEX_ENDPOINT:
        raise ValueError("SNOWFLAKE_HOST must be set to construct the endpoint")
    
    legal_text = json.dumps(legal_data) if legal_data else "No legal data available"
    financial_text = json.dumps(financial_data) if financial_data else "No financial data available"
    
    context_parts = []
    if location:
        context_parts.append(f"Location: {location}")
    if budget:
        context_parts.append(f"Budget: {budget}")
    context_str = ", ".join(context_parts) if context_parts else "No specific context"
    
    system_prompt = """You are a business advisor synthesizer. Combine legal and financial research into a cohesive, actionable business plan.
Return ONLY valid JSON with this structure:
{
  "executive_summary": "brief overview of the business opportunity and key requirements",
  "action_plan": {
    "immediate_steps": ["step1", "step2"],
    "short_term_goals": ["goal1", "goal2"],
    "long_term_considerations": ["consideration1", "consideration2"]
  },
  "risk_assessment": {
    "legal_risks": ["risk1", "risk2"],
    "financial_risks": ["risk1", "risk2"],
    "mitigation_strategies": ["strategy1", "strategy2"]
  },
  "recommendations": ["recommendation1", "recommendation2"],
  "next_steps": ["next step1", "next step2"]
}"""

    user_prompt = f"""Synthesize this business research into an actionable plan:
Business Idea: {user_message}
Context: {context_str}

Legal Research:
{legal_text}

Financial Research:
{financial_text}

Create a comprehensive, actionable business plan that combines both legal and financial insights.
Return only the JSON object."""

    payload = {
        "model": SNOWFLAKE_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
    }

    headers = _build_headers()

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(CORTEX_ENDPOINT, json=payload, headers=headers)
        resp.raise_for_status()
        result = resp.json()

    try:
        content = result["choices"][0]["message"]["content"]
        cleaned_content = content.strip().replace("\n", "").replace("", "").replace("```", "").replace("json", "", 1).strip()
        return json.loads(cleaned_content)
    except Exception as e:
        raise Exception(f"Unexpected response format from Snowflake synthesis API: {result}") from e


# --- CORE FUNCTION: FORMAT RESPONSE ---
async def format_response(raw_text: str, response_type: Literal["legal", "finance"]) -> Dict:

    print("raw_text", raw_text)
    print(type(raw_text))
    print("response_type", response_type)
    """Format legal or financial text into structured JSON via Snowflake LLM."""
    if not SNOWFLAKE_PAT or not SNOWFLAKE_HOST:
        raise ValueError("SNOWFLAKE_PAT and SNOWFLAKE_HOST must be set in environment variables")
    if not CORTEX_ENDPOINT:
        raise ValueError("SNOWFLAKE_HOST must be set to construct the endpoint")

    if response_type == "legal":
        system_prompt = """You are a legal information formatter.
Return ONLY valid JSON with:
{
  "summary": "brief summary",
  "steps": [{"title": "step", "description": "details", "agency": "agency", "links": ["url"]}],
  "key_requirements": ["requirement1", "requirement2"],
  "estimated_timeline": "time"
}"""
    else:
        system_prompt = """You are a financial formatter.
Return ONLY valid JSON with:
{
  "summary": "brief summary",
  "cost_breakdown": {
    "startup_costs": 0,
    "monthly_operating_costs": 0,
    "breakdown": [{"category": "name", "amount": 0, "description": "desc"}]
  },
  "funding_sources": [{"name": "source", "type": "loan/grant", "description": "desc", "link": "url"}],
  "recommendations": ["recommendation1", "recommendation2"]
}"""

    user_prompt = f"""Format the following {response_type} info into structured JSON:
{raw_text}

Return only the JSON object."""

    payload = {
        "model": SNOWFLAKE_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
        # "temperature": 0.3,
        # "response_format": {"type": "json_object"},
    }

    headers = _build_headers()

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(CORTEX_ENDPOINT, json=payload, headers=headers)
        resp.raise_for_status()
        result = resp.json() #type is dict

    print("result", result)
    print(type(result))

    try:
        content = result["choices"][0]["message"]["content"]

        print("content", content)
        print(type(content)) #string

        cleaned_content = content.strip().replace("\n", "").replace("", "").replace("```", "").replace("json", "", 1).strip()
        print("cleaned_content", cleaned_content)
        print(type(cleaned_content))
        json_content = json.loads(cleaned_content)
        print("json_content", json_content)
        print(type(json_content))
        return json_content
    except Exception as e:
        raise Exception(f"Unexpected response format from Snowflake API: {result}") from e
