import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Cost } from "@/types"

interface CostPlannerProps {
  costs: Cost[]
  fundingSuggestions: string[]
}

export function CostPlanner({ costs, fundingSuggestions }: CostPlannerProps) {
  const totalInitial = costs.reduce((sum, cost) => sum + cost.initial, 0)
  const totalMonthly = costs.reduce((sum, cost) => sum + cost.monthly, 0)

  return (
    <section className="scroll-mt-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Cost & Funding Overview</h2>
        <p className="text-lg text-muted-foreground">Estimate your startup and ongoing expenses</p>
      </div>

      <Card className="p-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 font-semibold">Category</th>
                <th className="text-right py-4 px-4 font-semibold">Initial Cost</th>
                <th className="text-right py-4 px-4 font-semibold">Monthly Cost</th>
                <th className="text-left py-4 px-4 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {costs.map((cost, index) => (
                <tr key={index} className="border-b border-border/50">
                  <td className="py-4 px-4 font-medium">{cost.category}</td>
                  <td className="text-right py-4 px-4">${cost.initial.toLocaleString()}</td>
                  <td className="text-right py-4 px-4">${cost.monthly.toLocaleString()}</td>
                  <td className="py-4 px-4 text-sm text-muted-foreground">{cost.note}</td>
                </tr>
              ))}
              <tr className="font-bold bg-muted/30">
                <td className="py-4 px-4">Total</td>
                <td className="text-right py-4 px-4">${totalInitial.toLocaleString()}</td>
                <td className="text-right py-4 px-4">${totalMonthly.toLocaleString()}</td>
                <td className="py-4 px-4"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <h4 className="font-semibold mb-4">Suggested Funding Paths</h4>
          <div className="flex flex-wrap gap-2">
            {fundingSuggestions.map((suggestion, index) => (
              <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </section>
  )
}
