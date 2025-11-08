"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles } from "lucide-react"
import type { GeneratedPlan } from "@/types"

interface HeroSectionProps {
  onGenerate: (plan: GeneratedPlan) => void
  setIsGenerating: (loading: boolean) => void
  isGenerating: boolean
}

export function HeroSection({ onGenerate, setIsGenerating, isGenerating }: HeroSectionProps) {
  const [idea, setIdea] = useState("")
  const [location, setLocation] = useState("")
  const [mode, setMode] = useState<"online" | "physical" | "hybrid">("online")
  const [timeline, setTimeline] = useState("3-6 months")

  const handleGenerate = async () => {
    if (!idea.trim() || !location.trim()) return

    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, location, mode, timeline }),
      })

      const data = await response.json()
      onGenerate(data)

      // Scroll to roadmap
      setTimeout(() => {
        document.getElementById("roadmap")?.scrollIntoView({ behavior: "smooth" })
      }, 500)
    } catch (error) {
      console.error("[v0] Error generating plan:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section id="hero" className="pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Business Planning
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-balance">
              Turn your business idea into a launch-ready plan
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
              Type your idea. Get a custom roadmap with legal steps, costs, market insights, and branding in seconds.
            </p>
          </div>

          <Card className="p-8 shadow-xl border-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="idea">Describe your business idea</Label>
                <Textarea
                  id="idea"
                  placeholder="e.g., A mobile app that connects local farmers with restaurants..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, State/Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mode">Business Mode</Label>
                  <Select value={mode} onValueChange={(v) => setMode(v as any)}>
                    <SelectTrigger id="mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="physical">Physical</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Timeline</Label>
                  <Select value={timeline} onValueChange={setTimeline}>
                    <SelectTrigger id="timeline">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3 months">1-3 months</SelectItem>
                      <SelectItem value="3-6 months">3-6 months</SelectItem>
                      <SelectItem value="6-12 months">6-12 months</SelectItem>
                      <SelectItem value="12+ months">12+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!idea.trim() || !location.trim() || isGenerating}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    Generating Your Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Plan
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
