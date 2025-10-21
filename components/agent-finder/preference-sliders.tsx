"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface UserPreferences {
  responsiveness: number
  negotiation: number
  professionalism: number
  market_expertise: number
}

interface PreferenceSlidersProps {
  preferences: UserPreferences
  onChange: (preferences: UserPreferences) => void
  className?: string
}

const PREFERENCE_DEFINITIONS = {
  responsiveness: {
    title: "Responsiveness",
    description: "Quick communication and availability",
    tooltip: "Values communication speed and availability. Important for time-sensitive transactions."
  },
  negotiation: {
    title: "Negotiation Skills", 
    description: "Deal-making and price optimization",
    tooltip: "Strong negotiation skills can save/earn thousands in your transaction."
  },
  professionalism: {
    title: "Professionalism",
    description: "Reliability and expertise",
    tooltip: "Includes ethical conduct, punctuality, preparation, and industry knowledge."
  },
  market_expertise: {
    title: "Market Expertise",
    description: "Local market knowledge",
    tooltip: "Local market insights, pricing strategies, and neighborhood expertise."
  }
}

const getImportanceLabel = (value: number): string => {
  if (value <= 0.2) return "Low"
  if (value <= 0.4) return "Some"
  if (value <= 0.6) return "Important"
  if (value <= 0.8) return "Very Important"
  return "Critical"
}

const getValueFromLabel = (label: string): number => {
  switch (label) {
    case "Low": return 0.2
    case "Some": return 0.4
    case "Important": return 0.6
    case "Very Important": return 0.8
    case "Critical": return 1.0
    default: return 0.6
  }
}

const IMPORTANCE_OPTIONS = [
  { label: "Low", value: 0.2 },
  { label: "Some", value: 0.4 },
  { label: "Important", value: 0.6 },
  { label: "Very Important", value: 0.8 },
  { label: "Critical", value: 1.0 }
]

// Removed color changing functionality

export function PreferenceSliders({ preferences, onChange, className }: PreferenceSlidersProps) {
  const updatePreference = (key: keyof UserPreferences, value: string) => {
    onChange({
      ...preferences,
      [key]: getValueFromLabel(value)
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          What's Important to You?
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Set your priorities to find agents who excel in what matters most to you.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Choose what matters most in your ideal agent
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Grid with 1 card per row */}
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(PREFERENCE_DEFINITIONS).map(([key, def]) => {
        const value = preferences[key as keyof UserPreferences]
        return (
          <Card
            key={key}
            className="relative transition-all duration-200 hover:shadow-md border-red-100 bg-red-50/30 py-2"
          >
            {/* Information tooltip in top right corner */}
            <div className="absolute top-2 right-3 z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
            <button className="text-red-600 hover:text-red-700 transition-colors">
              <Info className="h-4 w-4" />
            </button>
              </TooltipTrigger>
              <TooltipContent>
            <p className="max-w-xs">{def.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
            </div>

            <CardContent className="p-3 pr-10">
          <div className="flex items-center justify-between">
            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 mb-1">{def.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{def.description}</p>
            </div>

            {/* Dropdown */}
            <div className="ml-6 flex-shrink-0">
              <Select
            value={getImportanceLabel(value)}
            onValueChange={(selectedValue) =>
              updatePreference(key as keyof UserPreferences, selectedValue)
            }
              >
            <SelectTrigger className="w-[140px] h-8 border-red-200 bg-white text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMPORTANCE_OPTIONS.map((option) => (
                <SelectItem key={option.label} value={option.label}>
              {option.label}
                </SelectItem>
              ))}
            </SelectContent>
              </Select>
            </div>
          </div>
            </CardContent>
          </Card>
        )
          })}
        </div>
      </CardContent>
    </Card>
  )
}