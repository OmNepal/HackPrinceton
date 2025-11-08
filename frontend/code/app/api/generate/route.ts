import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { idea, location, mode, timeline } = await req.json()

    // TODO: Replace with actual LLM integration (e.g., OpenAI, Anthropic via AI SDK)
    // This is mock data for MVP demonstration

    const mockData = {
      roadmap: {
        legal: [
          { title: "Register Business Entity", description: "File LLC or Corporation with state", completed: false },
          { title: "Get Federal EIN", description: "Apply via IRS website", completed: false },
          { title: "Business Licenses", description: "Check local requirements", completed: false },
          { title: "Trademark Registration", description: "Protect your brand name", completed: false },
        ],
        finance: [
          {
            title: "Open Business Bank Account",
            description: "Separate personal and business finances",
            completed: false,
          },
          { title: "Set Up Accounting System", description: "QuickBooks or similar software", completed: false },
          { title: "Create Financial Projections", description: "3-year revenue forecast", completed: false },
          { title: "Secure Initial Funding", description: "Bootstrap or seek investors", completed: false },
        ],
        marketing: [
          { title: "Define Target Audience", description: "Create customer personas", completed: false },
          { title: "Build Website", description: "Professional online presence", completed: false },
          { title: "Social Media Setup", description: "Create business profiles", completed: false },
          { title: "Launch Marketing Campaign", description: "Ads and content strategy", completed: false },
        ],
        launch: [
          { title: "MVP Development", description: "Build minimum viable product", completed: false },
          { title: "Beta Testing", description: "Test with limited audience", completed: false },
          { title: "Soft Launch", description: "Limited market release", completed: false },
          { title: "Full Launch", description: "Go to market publicly", completed: false },
        ],
      },
      experts: {
        legalAdvisor: `For ${mode} businesses in ${location}, start with LLC formation for liability protection. Register your EIN immediately and check local business licenses. Consider trademark registration if your brand name is unique.`,
        financeAnalyst: `Based on ${timeline} timeline, budget $${estimateInitialCost(mode)}-${estimateInitialCost(mode) * 1.5}K for initial costs. Focus on lean startup principles. Track all expenses from day one and maintain separate business banking.`,
        marketingStrategist: `Your ${mode} model needs strong online presence regardless. Start with organic social media, build email list early, and consider local partnerships if targeting ${location}. Content marketing will be key for awareness.`,
      },
      costs: [
        { category: "Business Registration", initial: 500, monthly: 0, note: "LLC filing and licenses" },
        { category: "Technology & Tools", initial: 1000, monthly: 200, note: "Website, software, tools" },
        { category: "Marketing", initial: 1500, monthly: 500, note: "Digital ads and content" },
        { category: "Operations", initial: 2000, monthly: 1000, note: "Depends on business model" },
        { category: "Legal & Accounting", initial: 1000, monthly: 300, note: "Professional services" },
      ],
      fundingSuggestions: ["Bootstrapping", "Small Business Loan", "Angel Investors", "Crowdfunding", "Local Grants"],
      market: {
        viabilityScore: 72,
        insights: [
          `${mode.charAt(0).toUpperCase() + mode.slice(1)} businesses in ${location} show moderate competition.`,
          "Niche positioning and unique value proposition will be critical for differentiation.",
          "Strong digital presence is essential regardless of business model.",
          `Timeline of ${timeline} is realistic for achieving product-market fit.`,
        ],
      },
      brand: {
        names: generateBusinessNames(idea),
        tagline: generateTagline(idea),
        pitch: `${idea.slice(0, 100)}... Our platform solves this by providing a seamless solution that connects customers with the services they need. We're positioned to capture significant market share in ${location} and expand from there.`,
      },
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("[v0] Error in /api/generate:", error)
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 })
  }
}

function estimateInitialCost(mode: string): number {
  if (mode === "online") return 3
  if (mode === "physical") return 10
  return 6
}

function generateBusinessNames(idea: string): string[] {
  const words = idea
    .split(" ")
    .filter((w) => w.length > 3)
    .slice(0, 3)
  return [
    `${words[0]?.charAt(0).toUpperCase()}${words[0]?.slice(1) || "Venture"} Co`,
    `${words[1]?.charAt(0).toUpperCase()}${words[1]?.slice(1) || "Launch"} Hub`,
    `${words[2]?.charAt(0).toUpperCase()}${words[2]?.slice(1) || "Start"} Labs`,
  ]
}

function generateTagline(idea: string): string {
  return "Transforming ideas into reality, one step at a time."
}
