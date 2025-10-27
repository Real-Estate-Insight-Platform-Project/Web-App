"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, MessageCircle, MapIcon, Eye, Heart, Lightbulb, Star } from "lucide-react"

interface Step4Props {
  skillPreferences: Record<string, number>
  onSkillChange: (key: string, value: number) => void
  onNext: () => void
  onBack: () => void
}

const SKILLS = [
  {
    key: "communication",
    label: "Communication",
    description: "Clear and effective communication skills",
    icon: MessageCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    key: "local_knowledge",
    label: "Local Knowledge",
    description: "Deep understanding of the neighborhood",
    icon: MapIcon,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    key: "attention_to_detail",
    label: "Attention to Detail",
    description: "Thorough and detail-oriented approach",
    icon: Eye,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    key: "patience",
    label: "Patience",
    description: "Patient and understanding throughout the process",
    icon: Heart,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
  },
  {
    key: "honesty",
    label: "Honesty & Integrity",
    description: "Transparent and trustworthy",
    icon: Star,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    key: "problem_solving",
    label: "Problem Solving",
    description: "Creative solutions to challenges",
    icon: Lightbulb,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
]

const IMPORTANCE_LEVELS = [
  { value: "0", label: "Not Important", weight: 0.0 },
  { value: "1", label: "Low", weight: 0.1 },
  { value: "2", label: "Medium", weight: 0.25 },
  { value: "3", label: "High", weight: 0.5 },
  { value: "4", label: "Very High", weight: 1.0 },
]

export function Step4AdditionalQualities({ skillPreferences, onSkillChange, onNext, onBack }: Step4Props) {
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
      onSkillChange(key, level.weight)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-gray-900">Additional Qualities</h2>
        <p className="text-lg text-gray-600">
          Which soft skills and personal qualities are important to you?
        </p>
      </div>

      <Card className="border-red-100">
        <CardContent className="p-8 space-y-8">
          <div className="flex items-center gap-2 text-red-700 font-semibold text-lg mb-4">
            <Sparkles className="h-5 w-5" />
            <span>Personal Qualities</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SKILLS.map((skill) => {
              const Icon = skill.icon
              const currentValue = getValueFromWeight(skillPreferences[skill.key] || 0)

              return (
                <div
                  key={skill.key}
                  className="bg-white p-4 rounded-lg border border-gray-200 transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <Icon className="h-5 w-5 text-red-600" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {skill.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{skill.description}</div>
                      </div>

                      <div className="space-y-1">
                        <Select
                          value={currentValue}
                          onValueChange={(value) => handleChange(skill.key, value)}
                        >
                          <SelectTrigger className="h-10 bg-white text-sm border-gray-300">
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
                </div>
              )
            })}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-700">
              <strong>💡 Tip:</strong> These qualities are extracted from actual client reviews. Select the ones that matter most to you for a more personalized match.
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
