import { Card } from "@/components/ui/card"
import { TrendingUp, AlertCircle } from "lucide-react"
import type { Market } from "@/types"

interface MarketSnapshotProps {
  market: Market
}

export function MarketSnapshot({ market }: MarketSnapshotProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-orange-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-green-100"
    if (score >= 50) return "bg-yellow-100"
    return "bg-orange-100"
  }

  return (
    <section className="scroll-mt-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Market Snapshot</h2>
        <p className="text-lg text-muted-foreground">AI-powered market intelligence for your business</p>
      </div>

      <Card className="p-8">
        <div className="grid md:grid-cols-[300px,1fr] gap-8">
          <div className="text-center">
            <div
              className={`inline-flex items-center justify-center w-48 h-48 rounded-full ${getScoreBg(market.viabilityScore)}`}
            >
              <div>
                <div className={`text-5xl font-bold ${getScoreColor(market.viabilityScore)}`}>
                  {market.viabilityScore}
                </div>
                <div className="text-sm font-medium text-muted-foreground mt-2">Viability Score</div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-2">Market Insights</h4>
                <ul className="space-y-2">
                  {market.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-muted-foreground leading-relaxed">
                      • {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Market data powered by AI analysis. For deeper insights, consider integrating with Daedalus Labs for
                  real-time market intelligence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
