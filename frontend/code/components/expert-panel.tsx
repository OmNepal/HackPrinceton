import { Card } from "@/components/ui/card"
import { Scale, DollarSign, TrendingUp } from "lucide-react"
import type { Experts } from "@/types"

interface ExpertPanelProps {
  experts: Experts
}

const expertCards = [
  { key: "legalAdvisor", title: "Legal Advisor", icon: Scale, color: "bg-chart-1" },
  { key: "financeAnalyst", title: "Finance Analyst", icon: DollarSign, color: "bg-chart-2" },
  { key: "marketingStrategist", title: "Marketing Strategist", icon: TrendingUp, color: "bg-chart-3" },
] as const

export function ExpertPanel({ experts }: ExpertPanelProps) {
  return (
    <section id="insights" className="scroll-mt-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Expert Panel Summary</h2>
        <p className="text-lg text-muted-foreground">Tailored insights from specialized AI advisors</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {expertCards.map(({ key, title, icon: Icon, color }) => (
          <Card key={key} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-lg ${color} text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">{title}</h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{experts[key]}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
