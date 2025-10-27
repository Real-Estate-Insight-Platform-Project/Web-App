"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Target, Zap, Handshake, Award, TrendingUp } from "lucide-react"

interface Step3Props {
  subScorePreferences: Record<string, number>
  onSubScoreChange: (key: string, value: number) => void
  onNext: () => void
  onBack: () => void
}

const PRIORITIES = [
  {
    key: "responsiveness",
    label: "Response Time",
    description: "How quickly the agent responds to inquiries",
    icon: Zap,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    key: "negotiation",
    label: "Negotiation Skills",
    description: "Ability to negotiate the best deals",
    icon: Handshake,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    key: "professionalism",
    label: "Professionalism",
    description: "Professional conduct and ethics",
    icon: Award,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    key: "market_expertise",
    label: "Market Knowledge",
    description: "Deep understanding of the local market",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
]

const IMPORTANCE_LEVELS = [
  { value: "0", label: "Not Important", weight: 0.0 },
  { value: "1", label: "Low", weight: 0.1 },
  { value: "2", label: "Medium", weight: 0.25 },
  { value: "3", label: "High", weight: 0.5 },
  { value: "4", label: "Very High", weight: 1.0 },
]

export function Step3Priorities({ subScorePreferences, onSubScoreChange, onNext, onBack }: Step3Props) {
  const getValueFromWeight = (weight: number): string => {
    if (weight === 0) return "0"
    if (weight <= 0.1) return "1"
    if (weight <= 0.25) return "2"
    if (weight <= 0.5) return "3"
    return "4"
  }

  const handleChange = (key: string, value: string) => {
    const level = IMPORTANCE_LEVELS.find((l) => l.value === value)
    if (level) {
      onSubScoreChange(key, level.weight)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-gray-900">Agent Priorities</h2>
        <p className="text-lg text-gray-600">
          Help us understand your priorities when choosing an agent
        </p>
      </div>

      <Card className="border-red-100">
        <CardContent className="p-8 space-y-8">
          <div className="flex items-center gap-2 text-red-700 font-semibold text-lg mb-4">
            <Target className="h-5 w-5" />
            <span>Agent Priorities</span>
          </div>

          <div className="space-y-4">
            {PRIORITIES.map((priority) => {
              const Icon = priority.icon
              const currentValue = getValueFromWeight(subScorePreferences[priority.key] || 0.25)

              return (
                <div
                  key={priority.key}
                  className="bg-white p-4 rounded-lg border border-gray-200 transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Icon className="h-6 w-6 text-red-600" />
                      </div>

                      <div>
                        <div className="font-semibold text-gray-900">
                          {priority.label}
                        </div>
                        <div className="text-sm text-gray-600">{priority.description}</div>
                      </div>
                    </div>

                    <div className="w-48">
                      <Select
                        value={currentValue}
                        onValueChange={(value) => handleChange(priority.key, value)}
                      >
                        <SelectTrigger className="h-10 bg-white border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IMPORTANCE_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-700">
              <strong>💡 Tip:</strong> Select "High" or "Very High" for the qualities that are most important
              to you. We'll use this to find agents that match your priorities.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="px-8 border-red-200 text-red-700 hover:bg-red-50"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          size="lg"
          className="px-12 bg-red-600 hover:bg-red-700 text-white"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
