"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2 } from "lucide-react"
import type { Roadmap } from "@/types"

interface ProgressTrackerProps {
  roadmap: Roadmap
}

export function ProgressTracker({ roadmap: initialRoadmap }: ProgressTrackerProps) {
  const [roadmap, setRoadmap] = useState(initialRoadmap)

  useEffect(() => {
    const stored = localStorage.getItem("bizpilot-tasks")
    if (stored) {
      setRoadmap(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem("bizpilot-tasks")
      if (stored) {
        setRoadmap(JSON.parse(stored))
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  const allTasks = [...roadmap.legal, ...roadmap.finance, ...roadmap.marketing, ...roadmap.launch]

  const completedTasks = allTasks.filter((task) => task.completed).length
  const totalTasks = allTasks.length
  const percentage = Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="sticky top-20 z-40 mb-8">
      <div className="container mx-auto px-4">
        <Card className="p-6 shadow-lg border-2">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm font-medium">Launch Progress</p>
                <p className="text-2xl font-bold">
                  {completedTasks} of {totalTasks} tasks
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-md">
              <div className="flex items-center gap-4">
                <Progress value={percentage} className="flex-1 h-3" />
                <span className="text-2xl font-bold text-primary min-w-[4ch] text-right">{percentage}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
