"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { RoadmapSection } from "@/components/roadmap-section"
import { ExpertPanel } from "@/components/expert-panel"
import { CostPlanner } from "@/components/cost-planner"
import { MarketSnapshot } from "@/components/market-snapshot"
import { BrandKit } from "@/components/brand-kit"
import { ProgressTracker } from "@/components/progress-tracker"
import type { GeneratedPlan } from "@/types"

export default function Home() {
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <div className="min-h-screen">
      <Navigation />

      <main>
        <HeroSection onGenerate={setGeneratedPlan} setIsGenerating={setIsGenerating} isGenerating={isGenerating} />

        {generatedPlan && (
          <div className="relative">
            <ProgressTracker roadmap={generatedPlan.roadmap} />

            <div className="container mx-auto px-4 py-16 space-y-24">
              <RoadmapSection roadmap={generatedPlan.roadmap} />
              <ExpertPanel experts={generatedPlan.experts} />
              <CostPlanner costs={generatedPlan.costs} fundingSuggestions={generatedPlan.fundingSuggestions} />
              <MarketSnapshot market={generatedPlan.market} />
              <BrandKit brand={generatedPlan.brand} />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-24">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 BizPilot AI. Built with Next.js and Vercel.
          </p>
        </div>
      </footer>
    </div>
  )
}
