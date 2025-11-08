"use client"

import { Button } from "@/components/ui/button"
import { Rocket } from "lucide-react"

export function Navigation() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold">BizPilot AI</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("roadmap")}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Roadmap
          </button>
          <button
            onClick={() => scrollToSection("insights")}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Insights
          </button>
          <button
            onClick={() => scrollToSection("brand-kit")}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Brand Kit
          </button>
        </div>

        <Button
          onClick={() => scrollToSection("hero")}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Start Now
        </Button>
      </div>
    </nav>
  )
}
