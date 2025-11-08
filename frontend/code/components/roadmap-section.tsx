"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Scale, DollarSign, TrendingUp, Rocket } from "lucide-react"
import type { Roadmap } from "@/types"

interface RoadmapSectionProps {
  roadmap: Roadmap
}

const columns = [
  { key: "legal", title: "Legal & Compliance", icon: Scale, color: "text-chart-1" },
  { key: "finance", title: "Finance & Costs", icon: DollarSign, color: "text-chart-2" },
  { key: "marketing", title: "Marketing & Growth", icon: TrendingUp, color: "text-chart-3" },
  { key: "launch", title: "Launch & Operations", icon: Rocket, color: "text-chart-4" },
] as const

export function RoadmapSection({ roadmap }: RoadmapSectionProps) {
  const [tasks, setTasks] = useState(roadmap)

  useEffect(() => {
    const stored = localStorage.getItem("bizpilot-tasks")
    if (stored) {
      setTasks(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("bizpilot-tasks", JSON.stringify(tasks))
  }, [tasks])

  const toggleTask = (column: keyof Roadmap, index: number) => {
    setTasks((prev) => ({
      ...prev,
      [column]: prev[column].map((task, i) => (i === index ? { ...task, completed: !task.completed } : task)),
    }))
  }

  return (
    <section id="roadmap" className="scroll-mt-20">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Your Launch Roadmap</h2>
        <p className="text-lg text-muted-foreground">Follow these steps to bring your business to life</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map(({ key, title, icon: Icon, color }) => (
          <Card key={key} className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg bg-secondary ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg">{title}</h3>
            </div>

            <div className="space-y-4">
              {tasks[key].map((task, index) => (
                <div key={index} className="flex gap-3">
                  <Checkbox
                    id={`${key}-${index}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(key, index)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`${key}-${index}`}
                      className={`text-sm font-medium cursor-pointer ${
                        task.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {task.title}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
