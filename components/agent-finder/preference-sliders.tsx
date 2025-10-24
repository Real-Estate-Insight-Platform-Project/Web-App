"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SubScorePreferences {
  responsiveness?: number
  negotiation?: number
  professionalism?: number
  market_expertise?: number
}

interface SkillPreferences {
  communication?: number
  local_knowledge?: number
  attention_to_detail?: number
  patience?: number
  honesty?: number
  problem_solving?: number
  dedication?: number
}

interface PreferenceSlidersProps {
  preferences: SubScorePreferences
  skillPreferences?: SkillPreferences
  onPreferencesChange: (preferences: SubScorePreferences) => void
  onSkillPreferencesChange?: (skillPreferences: SkillPreferences) => void
  className?: string
}

const subScoreItems = [
  {
    key: "responsiveness" as const,
    label: "Responsiveness",
    description: "How quickly the agent responds to inquiries and requests",
    icon: "⚡"
  },
  {
    key: "negotiation" as const,
    label: "Negotiation Skills",
    description: "Ability to negotiate favorable terms and prices",
    icon: "🤝"
  },
  {
    key: "professionalism" as const,
    label: "Professionalism",
    description: "Professional conduct, ethics, and communication",
    icon: "👔"
  },
  {
    key: "market_expertise" as const,
    label: "Market Expertise",
    description: "Knowledge of local market trends and property values",
    icon: "📊"
  }
]

const skillItems = [
  {
    key: "communication" as const,
    label: "Communication",
    description: "Clear and effective communication style",
    icon: "💬"
  },
  {
    key: "local_knowledge" as const,
    label: "Local Knowledge",
    description: "Deep understanding of the local area",
    icon: "📍"
  },
  {
    key: "attention_to_detail" as const,
    label: "Attention to Detail",
    description: "Thoroughness in handling all aspects of transactions",
    icon: "🔍"
  },
  {
    key: "patience" as const,
    label: "Patience",
    description: "Patient and understanding approach with clients",
    icon: "⏱️"
  },
  {
    key: "honesty" as const,
    label: "Honesty",
    description: "Transparent and truthful in all dealings",
    icon: "✨"
  },
  {
    key: "problem_solving" as const,
    label: "Problem Solving",
    description: "Ability to find creative solutions to challenges",
    icon: "🧩"
  },
  {
    key: "dedication" as const,
    label: "Dedication",
    description: "Committed and devoted to client success",
    icon: "🎯"
  }
]

export function PreferenceSliders({
  preferences,
  skillPreferences = {},
  onPreferencesChange,
  onSkillPreferencesChange,
  className
}: PreferenceSlidersProps) {
  
  const handleSubScoreChange = (key: keyof SubScorePreferences, value: number[]) => {
    onPreferencesChange({
      ...preferences,
      [key]: value[0]
    })
  }

  const handleSkillChange = (key: keyof SkillPreferences, value: number[]) => {
    if (onSkillPreferencesChange) {
      onSkillPreferencesChange({
        ...skillPreferences,
        [key]: value[0]
      })
    }
  }

  const getImportanceLabel = (value: number) => {
    if (value >= 0.75) return "Very High"
    if (value >= 0.5) return "High"
    if (value >= 0.25) return "Medium"
    return "Low"
  }

  const getImportanceColor = (value: number) => {
    if (value >= 0.75) return "text-red-600 bg-red-50"
    if (value >= 0.5) return "text-orange-600 bg-orange-50"
    if (value >= 0.25) return "text-yellow-600 bg-yellow-50"
    return "text-gray-600 bg-gray-50"
  }

  const getTotalWeight = () => {
    const subScoreTotal = Object.values(preferences).reduce((sum, val) => sum + (val || 0), 0)
    const skillTotal = Object.values(skillPreferences).reduce((sum, val) => sum + (val || 0), 0)
    return subScoreTotal + skillTotal
  }

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Core Skills Card */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-red-800">What Matters Most to You?</CardTitle>
              <CardDescription className="text-red-600">
                Adjust the importance of each quality. Higher values = more important.
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <Info className="h-5 w-5 text-red-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    These preferences help us find agents that match your priorities. 
                    The system will rank agents based on how well they perform in the areas you care about most.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {subScoreItems.map((item) => {
            const value = preferences[item.key] || 0
            return (
              <div key={item.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <Label htmlFor={item.key} className="font-medium text-gray-900">
                        {item.label}
                      </Label>
                      <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
                    </div>
                  </div>
                  <Badge className={`${getImportanceColor(value)} font-semibold min-w-[80px] justify-center`}>
                    {getImportanceLabel(value)}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <Slider
                    id={item.key}
                    min={0}
                    max={1}
                    step={0.01}
                    value={[value]}
                    onValueChange={(val) => handleSubScoreChange(item.key, val)}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-700 min-w-[40px] text-right">
                    {(value * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Additional Skills Card */}
      {onSkillPreferencesChange && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">Additional Qualities (Optional)</CardTitle>
            <CardDescription className="text-purple-600">
              Fine-tune your search with additional agent qualities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {skillItems.map((item) => {
              const value = skillPreferences[item.key] || 0
              const isActive = value > 0
              
              return (
                <div key={item.key} className={`space-y-3 ${!isActive ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <Label htmlFor={`skill-${item.key}`} className="font-medium text-gray-900">
                          {item.label}
                        </Label>
                        <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                    {isActive && (
                      <Badge className={`${getImportanceColor(value)} font-semibold min-w-[80px] justify-center`}>
                        {getImportanceLabel(value)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <Slider
                      id={`skill-${item.key}`}
                      min={0}
                      max={1}
                      step={0.01}
                      value={[value]}
                      onValueChange={(val) => handleSkillChange(item.key, val)}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-700 min-w-[40px] text-right">
                      {(value * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800 space-y-2">
              <p className="font-medium">How it works:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>Higher weights = agents strong in those areas rank higher</li>
                <li>The system learns from thousands of reviews to score each quality</li>
                <li>You can adjust preferences at any time and search again</li>
                <li>Equal weights means all qualities are considered equally important</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}