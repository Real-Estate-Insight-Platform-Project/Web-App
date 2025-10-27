"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Globe, Star, Zap, Hash, X, Home, TrendingUp, Shield, Users, Truck, Building2, TrendingDown, Key } from "lucide-react"

interface Step5Props {
  language: string
  isUrgent: boolean
  maxResults: number
  additionalSpecializations: string[]
  onLanguageChange: (language: string) => void
  onUrgentChange: (urgent: boolean) => void
  onMaxResultsChange: (max: number) => void
  onSpecializationsChange: (specs: string[]) => void
  onBack: () => void
  onSubmit: () => void
  isLoading: boolean
}

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese",
  "Russian", "Chinese (Mandarin)", "Chinese (Cantonese)", "Japanese",
  "Korean", "Arabic", "Hindi", "Vietnamese", "Tagalog", "Polish",
  "Greek", "Hebrew", "Thai", "Dutch"
]

const SPECIALIZATIONS = [
  { value: "first_time_buyer", label: "First Time Buyer", icon: Home },
  { value: "investor", label: "Investor", icon: TrendingUp },
  { value: "veteran", label: "Veteran", icon: Shield },
  { value: "senior", label: "Senior", icon: Users },
  { value: "relocation", label: "Relocation", icon: Truck },
  { value: "foreclosure", label: "Foreclosure", icon: Building2 },
  { value: "short_sale", label: "Short Sale", icon: TrendingDown },
  { value: "rental", label: "Rental", icon: Key },
]

export function Step5FinalPreferences(props: Step5Props) {
  const toggleSpecialization = (spec: string) => {
    if (props.additionalSpecializations.includes(spec)) {
      props.onSpecializationsChange(
        props.additionalSpecializations.filter((s) => s !== spec)
      )
    } else {
      props.onSpecializationsChange([...props.additionalSpecializations, spec])
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-gray-900">Final Preferences</h2>
        <p className="text-lg text-gray-600">
          Just a few more details to find your perfect match
        </p>
      </div>

      <Card className="border-red-100">
        <CardContent className="p-8 space-y-8">
          {/* Language */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-700 font-semibold text-lg">
              <Globe className="h-5 w-5" />
              <span>Preferred Language</span>
            </div>
            <Select value={props.language} onValueChange={props.onLanguageChange}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specializations */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-700 font-semibold text-lg">
              <Star className="h-5 w-5" />
              <span>Additional Specializations (Optional)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SPECIALIZATIONS.map((spec) => {
                const isSelected = props.additionalSpecializations.includes(spec.value)
                const IconComponent = spec.icon
                return (
                  <Card
                    key={spec.value}
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      isSelected
                        ? "border-red-600 border-2 shadow-md bg-red-50"
                        : "border-gray-200 hover:border-red-300"
                    }`}
                    onClick={() => toggleSpecialization(spec.value)}
                  >
                    <CardContent className="p-3 text-center space-y-2">
                      <div className={`mx-auto w-10 h-10 rounded-lg border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-red-600 bg-white"
                          : "border-gray-300"
                      }`}>
                        <IconComponent className={`h-5 w-5 ${
                          isSelected ? "text-red-600" : "text-gray-600"
                        }`} />
                      </div>
                      <div className="text-xs font-medium text-gray-900 leading-tight">
                        {spec.label}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {props.additionalSpecializations.length > 0 && (
              <p className="text-sm text-gray-600">
                {props.additionalSpecializations.length} specialization(s) selected
              </p>
            )}
          </div>

          {/* Urgent Need */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-red-200">
                  <Zap className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <Label htmlFor="urgent" className="text-base font-semibold text-gray-900 cursor-pointer">
                    Urgent Need
                  </Label>
                  <p className="text-sm text-gray-600">
                    Prioritize agents with high activity
                  </p>
                </div>
              </div>
              <Switch
                id="urgent"
                checked={props.isUrgent}
                onCheckedChange={props.onUrgentChange}
                className="data-[state=checked]:bg-red-600"
              />
            </div>
          </div>

          {/* Max Results */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-700 font-semibold text-lg">
              <Hash className="h-5 w-5" />
              <span>Maximum Results</span>
            </div>
            <Select
              value={String(props.maxResults)}
              onValueChange={(value) => props.onMaxResultsChange(Number(value))}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 agents</SelectItem>
                <SelectItem value="20">20 agents</SelectItem>
                <SelectItem value="30">30 agents</SelectItem>
                <SelectItem value="50">50 agents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
            <p className="text-sm text-red-900">
              <strong>All set!</strong> Click "Find My Ideal Agents" to get personalized recommendations
              based on your preferences.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button
          onClick={props.onBack}
          variant="outline"
          size="lg"
          disabled={props.isLoading}
          className="px-8 border-red-200 text-red-700 hover:bg-red-50"
        >
          Back
        </Button>
        <Button
          onClick={props.onSubmit}
          disabled={props.isLoading}
          size="lg"
          className="px-12 bg-red-600 hover:bg-red-700 text-white"
        >
          {props.isLoading ? "Searching..." : "Find My Ideal Agents"}
        </Button>
      </div>
    </div>
  )
}
