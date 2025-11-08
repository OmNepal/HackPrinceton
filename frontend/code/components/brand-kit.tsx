"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import type { Brand } from "@/types"

interface BrandKitProps {
  brand: Brand
}

export function BrandKit({ brand }: BrandKitProps) {
  const [generatingLogo, setGeneratingLogo] = useState(false)
  const [logoGenerated, setLogoGenerated] = useState(false)

  const handleGenerateLogo = async () => {
    setGeneratingLogo(true)
    // TODO: Implement logo generation API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLogoGenerated(true)
    setGeneratingLogo(false)
  }

  return (
    <section id="brand-kit" className="scroll-mt-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Brand & Pitch Kit</h2>
        <p className="text-lg text-muted-foreground">Everything you need to establish your brand identity</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-8">
          <h3 className="font-semibold text-lg mb-4">Business Name Options</h3>
          <div className="space-y-2 mb-6">
            {brand.names.map((name, index) => (
              <Badge key={index} variant="outline" className="px-4 py-2 text-base">
                {name}
              </Badge>
            ))}
          </div>

          <h3 className="font-semibold text-lg mb-4">Tagline</h3>
          <p className="text-muted-foreground italic mb-6">"{brand.tagline}"</p>

          <h3 className="font-semibold text-lg mb-4">Elevator Pitch</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{brand.pitch}</p>
        </Card>

        <Card className="p-8">
          <h3 className="font-semibold text-lg mb-4">Logo Concept</h3>

          {!logoGenerated ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
              <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4 text-center">Generate a unique logo for your brand</p>
              <Button onClick={handleGenerateLogo} disabled={generatingLogo} variant="outline">
                {generatingLogo ? "Generating..." : "Generate Logo"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 border-2 border-border rounded-lg bg-muted/30">
              <div className="text-center">
                <div className="w-32 h-32 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary-foreground">{brand.names[0].charAt(0)}</span>
                </div>
                <p className="text-sm text-muted-foreground">Logo placeholder generated</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}
