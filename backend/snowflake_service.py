"""
Snowflake AI (Cortex) REST API Service
Handles intent parsing, orchestration, and response formatting plus synthesizing using Snowflake's LLM API
"""

import os
import json
import httpx
from typing import Dict, Literal
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# CONFIGURATION 
SNOWFLAKE_ACCOUNT = os.getenv("SNOWFLAKE_ACCOUNT")
SNOWFLAKE_USER = os.getenv("SNOWFLAKE_USER")
SNOWFLAKE_ROLE = os.getenv("SNOWFLAKE_ROLE")
SNOWFLAKE_PAT = os.getenv("SNOWFLAKE_PAT")
SNOWFLAKE_MODEL = os.getenv("SNOWFLAKE_MODEL")
SNOWFLAKE_HOST = os.getenv("SNOWFLAKE_HOST")




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



    """Extract structured info (business type, industry, etc.) from user text using Snowflake LLM."""
async def parse_intent(user_text: str) -> Dict:

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


#ORCHESTRATE AGENTS 
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


# synthesizing responses from different agents into a single business plan
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
}

IMPORTANT: For links in the "steps" array:
- Prefer homepage URLs (e.g., https://www.nj.gov) unless you verified a specific page exists
- Only use specific page URLs if you are certain they are valid and accessible
- Always use full URLs starting with https://
"""
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
}

IMPORTANT: For links in "funding_sources":
- Prefer homepage URLs (e.g., https://www.sba.gov) unless you verified a specific page exists
- Only use specific page URLs if you are certain they are valid and accessible
- Always use full URLs starting with https://
"""

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


# Model for business brief generation
# Defaults to claude-4-sonnet, but falls back to SNOWFLAKE_MODEL if claude-4-sonnet is unavailable
# To use claude-4-sonnet, I have SET ENABLE_CROSS_REGION_INFERENCE to all regions
BRIEF_MODEL = os.getenv("BRIEF_MODEL")
if not BRIEF_MODEL:
    # Try claude-4-sonnet first, but fall back to SNOWFLAKE_MODEL if unavailable
    BRIEF_MODEL = "claude-4-sonnet"
    # Note: If claude-4-sonnet fails due to region, the code will need to catch and retry with SNOWFLAKE_MODEL


async def generate_idea_summary_with_snowflake(
    raw_idea: str,
    budget: str = None,
    location: str = None
) -> str:
    """Generate a clean, professional summary of the business idea using Snowflake Cortex with Claude."""
    if not SNOWFLAKE_PAT or not SNOWFLAKE_HOST:
        raise ValueError("SNOWFLAKE_PAT and SNOWFLAKE_HOST must be set in environment variables")
    if not CORTEX_ENDPOINT:
        raise ValueError("SNOWFLAKE_HOST must be set to construct the endpoint")
    
    context_info = []
    if location:
        context_info.append(f"Location: {location}")
    if budget:
        context_info.append(f"Budget: {budget}")
    context_str = "\n".join(context_info) if context_info else "Not specified"
    
    system_prompt = """You are a business consultant. Create a professional, concise summary of a business idea.

Generate a polished, professional one-sentence to two-sentence summary that clearly describes the business concept. 
Make it suitable for a business brief document. Focus on what the business does and its core value proposition.

Example format: "An online platform connecting local farmers with consumers to sell organic produce directly, promoting sustainable agriculture and supporting local communities."

Return ONLY the summary text, no additional commentary or labels."""
    
    user_prompt = f"""Raw user input: "{raw_idea}"
Additional context:
{context_str}

Generate the professional business idea summary."""

    payload = {
        "model": BRIEF_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
    }

    headers = _build_headers()

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(CORTEX_ENDPOINT, json=payload, headers=headers)
        if not resp.is_success:
            error_text = resp.text
            # Check if it's a region availability error and fall back to SNOWFLAKE_MODEL
            if "unavailable in your region" in error_text or "cross region inference" in error_text.lower():
                print(f"Model {BRIEF_MODEL} unavailable in region. Falling back to SNOWFLAKE_MODEL: {SNOWFLAKE_MODEL}")
                if SNOWFLAKE_MODEL and SNOWFLAKE_MODEL != BRIEF_MODEL:
                    # Retry with SNOWFLAKE_MODEL
                    payload["model"] = SNOWFLAKE_MODEL
                    resp = await client.post(CORTEX_ENDPOINT, json=payload, headers=headers)
                    if resp.is_success:
                        resp.raise_for_status()
                        result = resp.json()
                    else:
                        error_text = resp.text
                        print(f"Snowflake API Error Response (fallback): {error_text}")
                        raise Exception(f"Snowflake API error ({resp.status_code}): {error_text}")
                else:
                    raise Exception(f"Model {BRIEF_MODEL} unavailable in your region. Please enable cross-region inference or set BRIEF_MODEL to a model available in your region. Error: {error_text}")
            else:
                print(f"Snowflake API Error Response: {error_text}")
                print(f"Request payload model: {BRIEF_MODEL}")
                raise Exception(f"Snowflake API error ({resp.status_code}): {error_text}")
        else:
            resp.raise_for_status()
            result = resp.json()

    try:
        content = result["choices"][0]["message"]["content"]
        return content.strip()
    except Exception as e:
        raise Exception(f"Unexpected response format from Snowflake idea summary API: {result}") from e


async def generate_section_with_snowflake(
    section_name: str,
    section_prompt: str,
    idea_summary: str,
    context_str: str = "",
    additional_context: str = ""
) -> str:
    """Generate a section using Snowflake Cortex with Claude model."""
    if not SNOWFLAKE_PAT or not SNOWFLAKE_HOST:
        raise ValueError("SNOWFLAKE_PAT and SNOWFLAKE_HOST must be set in environment variables")
    if not CORTEX_ENDPOINT:
        raise ValueError("SNOWFLAKE_HOST must be set to construct the endpoint")
    
    user_prompt = f"""Business Idea: {idea_summary}
{context_str}
{additional_context}

{section_prompt}"""

    payload = {
        "model": BRIEF_MODEL,
        "messages": [
            {"role": "user", "content": user_prompt},
        ],
        "stream": False,
    }

    headers = _build_headers()

    async with httpx.AsyncClient(timeout=90) as client:
        resp = await client.post(CORTEX_ENDPOINT, json=payload, headers=headers)
        if not resp.is_success:
            error_text = resp.text
            # Check if it's a region availability error and fall back to SNOWFLAKE_MODEL
            if "unavailable in your region" in error_text or "cross region inference" in error_text.lower():
                print(f"Model {BRIEF_MODEL} unavailable in region for {section_name}. Falling back to SNOWFLAKE_MODEL: {SNOWFLAKE_MODEL}")
                if SNOWFLAKE_MODEL and SNOWFLAKE_MODEL != BRIEF_MODEL:
                    # Retry with SNOWFLAKE_MODEL
                    payload["model"] = SNOWFLAKE_MODEL
                    resp = await client.post(CORTEX_ENDPOINT, json=payload, headers=headers)
                    if resp.is_success:
                        resp.raise_for_status()
                        result = resp.json()
                    else:
                        error_text = resp.text
                        print(f"Snowflake API Error Response for {section_name} (fallback): {error_text}")
                        raise Exception(f"Snowflake API error ({resp.status_code}): {error_text}")
                else:
                    raise Exception(f"Model {BRIEF_MODEL} unavailable in your region. Please enable cross-region inference or set BRIEF_MODEL to a model available in your region. Error: {error_text}")
            else:
                print(f"Snowflake API Error Response for {section_name}: {error_text}")
                print(f"Request payload model: {BRIEF_MODEL}")
                raise Exception(f"Snowflake API error ({resp.status_code}): {error_text}")
        else:
            resp.raise_for_status()
            result = resp.json()

    try:
        content = result["choices"][0]["message"]["content"]
        return content.strip()
    except Exception as e:
        raise Exception(f"Unexpected response format from Snowflake {section_name} API: {result}") from e


async def generate_complete_business_brief(
    idea: str,
    budget: str = None,
    location: str = None,
    legal_data: Dict = None,
    financial_data: Dict = None,
    synthesized_plan: Dict = None
) -> Dict[str, str]:
    """
    Generate a complete structured business brief with all sections using Snowflake Cortex with Claude model.
    Returns a dictionary with idea_summary and all section contents.
    """

    idea_summary = await generate_idea_summary_with_snowflake(idea, budget, location)
    
    # Building the context string
    context_parts = []
    if location:
        context_parts.append(f"Location: {location}")
    if budget:
        context_parts.append(f"Budget: {budget}")
    context_str = "\n".join(context_parts) if context_parts else "Context: Not specified"
    
    # Build additional context from legal/financial data
    additional_context_parts = []
    if synthesized_plan and isinstance(synthesized_plan, dict):
        exec_summary = synthesized_plan.get("executive_summary", "")
        if exec_summary:
            additional_context_parts.append(f"Existing insights: {exec_summary}")
    
    additional_context = "\n".join(additional_context_parts) if additional_context_parts else ""
    
    # Step 2: Generate Executive Summary
    exec_summary_prompt = """Write a compelling Executive Summary (2-3 paragraphs) that:
- Provides a clear overview of the business opportunity
- Highlights the key value proposition
- Mentions the target market briefly
- Conveys why this is a timely and viable opportunity

Write in a professional, persuasive tone suitable for investors or business partners. 
Return ONLY the Executive Summary text, no section headers or labels."""
    
    executive_summary = await generate_section_with_snowflake(
        "Executive Summary",
        exec_summary_prompt,
        idea_summary,
        context_str,
        additional_context
    )
    
    # Step 3: Generate Market Opportunity
    market_prompt = """Write a compelling "Idea & Market Opportunity" section (2-3 paragraphs) that:
- Explains what market gap or problem this idea addresses
- Describes the size and potential of the target market
- Highlights current market trends that support this opportunity
- Explains why now is the right time for this business

Write in a professional, data-driven tone. Be specific about market opportunities.
Return ONLY the section content, no section headers or labels."""
    
    market_opportunity = await generate_section_with_snowflake(
        "Market Opportunity",
        market_prompt,
        idea_summary,
        context_str
    )
    
    # Step 4: Generate Target Audience
    audience_prompt = """Write a detailed "Target Audience" section (2-3 paragraphs) that:
- Identifies the primary target customers (demographics, psychographics)
- Describes their needs, pain points, and motivations
- Explains why this audience would be interested in this product/service
- Mentions any secondary target segments if relevant

Be specific and detailed. Write in a professional tone.
Return ONLY the section content, no section headers or labels."""
    
    target_audience = await generate_section_with_snowflake(
        "Target Audience",
        audience_prompt,
        idea_summary,
        context_str
    )
    
    # Step 5: Generate Plan of Action
    action_plan_context = ""
    if synthesized_plan and isinstance(synthesized_plan, dict):
        action_plan = synthesized_plan.get("action_plan", {})
        if action_plan:
            immediate = action_plan.get("immediate_steps", [])
            short_term = action_plan.get("short_term_goals", [])
            if immediate or short_term:
                action_plan_context = "\nExisting action plan insights:\n"
                if immediate:
                    action_plan_context += f"Immediate steps: {', '.join(immediate[:5])}\n"
                if short_term:
                    action_plan_context += f"Short-term goals: {', '.join(short_term[:5])}"
    
    plan_prompt = """Write a strategic "Plan of Action" section (2-3 paragraphs) that:
- Outlines high-level strategic steps to launch and grow the business
- Focuses on business strategy, not detailed legal/financial compliance steps
- Describes key milestones and phases
- Explains the approach to market entry and growth

Write in a professional, strategic tone. Keep it high-level and focused on business strategy.
Return ONLY the section content, no section headers or labels."""
    
    plan_of_action = await generate_section_with_snowflake(
        "Plan of Action",
        plan_prompt,
        idea_summary,
        context_str,
        action_plan_context
    )
    
    # Step 6: Generate Why Succeed
    why_succeed_context = ""
    if synthesized_plan and isinstance(synthesized_plan, dict):
        recommendations = synthesized_plan.get("recommendations", [])
        if recommendations:
            why_succeed_context = f"\nKey recommendations: {', '.join(recommendations[:5])}"
    
    why_succeed_prompt = """Write a compelling "Why This Idea Could Succeed" section (2-3 paragraphs) that:
- Identifies key competitive advantages and differentiators
- Explains unique value propositions
- Highlights strengths that position this business for success
- Mentions favorable market conditions or trends
- Addresses why this team/approach can execute successfully

Write in a confident, persuasive tone suitable for investors.
Return ONLY the section content, no section headers or labels."""
    
    why_succeed = await generate_section_with_snowflake(
        "Why Succeed",
        why_succeed_prompt,
        idea_summary,
        context_str,
        why_succeed_context
    )
    
    return {
        "idea_summary": idea_summary,
        "executive_summary": executive_summary,
        "market_opportunity": market_opportunity,
        "target_audience": target_audience,
        "plan_of_action": plan_of_action,
        "why_succeed": why_succeed
    }
