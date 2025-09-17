// lib/riskUtils.ts
export const RISK_LEVELS = {
  "Very High": 5,
  "Relatively High": 4,
  "Relatively Moderate": 3,
  "Relatively Low": 2,
  "Very Low": 1,
  "No Rating": 0,
  "Not Applicable": 0,
} as const

export const RISK_COLORS = {
  "Very Low": "#4575b4",
  "Relatively Low": "#91bfdb",
  "Relatively Moderate": "#fee08b",
  "Relatively High": "#fc8d59",
  "Very High": "#d73027",
  "No Data": "#cfd8dc",
} as const

export type RiskRating = keyof typeof RISK_LEVELS

export function getRiskColor(rating?: string) {
  if (!rating) return RISK_COLORS["No Data"]
  return (RISK_COLORS as any)[rating] ?? RISK_COLORS["No Data"]
}

export function getContrastTextColor(bg: string) {
  const dark = ["#4575b4", "#d73027", "#fc8d59"]
  return dark.includes(bg) ? "white" : "black"
}

export function formatCountyName(county: string, state: string) {
  const suffix = county?.toLowerCase().includes("county") ? "" : " County"
  return `${county}${suffix}, ${state}`
}

// === Backend response shape for /risk/county/:fips ===
export type CountyRiskData = {
  fips: string
  county_name: string
  state_name: string
  state_fips: string
  nri_composite_rating: string
  nri_composite_score: number
  predominant_hazard: string
}
