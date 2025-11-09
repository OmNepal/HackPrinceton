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
