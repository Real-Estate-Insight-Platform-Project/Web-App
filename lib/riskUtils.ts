export const RISK_LEVELS = {
  "Very High": 5,
  "Relatively High": 4,
  "Relatively Moderate": 3,
  "Relatively Low": 2,
  "Very Low": 1,
  "No Rating": 0, // present for Cold Wave in some counties
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
export type HazardRatings = Record<string, RiskRating | string>

export function getRiskColor(rating?: string) {
  if (!rating) return RISK_COLORS["No Data"]
  return (RISK_COLORS as any)[rating] ?? RISK_COLORS["No Data"]
}

export function getContrastTextColor(bg: string) {
  // simple heuristic: dark fill → white text
  const dark = ["#4575b4", "#d73027", "#fc8d59"]
  return dark.includes(bg) ? "white" : "black"
}

export function sortHazardsByRisk(hz: HazardRatings) {
  return Object.entries(hz).sort(([, a], [, b]) => {
    const sa = (RISK_LEVELS as any)[a] ?? 0
    const sb = (RISK_LEVELS as any)[b] ?? 0
    return sb - sa
  })
}

export function getMostProminentRisk(hz: HazardRatings) {
  const sorted = sortHazardsByRisk(hz)
  return sorted.length ? sorted[0][0] : "Unknown"
}

export function formatCountyName(county: string, state: string) {
  const suffix = county?.toLowerCase().includes("county") ? "" : " County"
  return `${county}${suffix}, ${state}`
}

export function calculateRiskSummary(hz: HazardRatings) {
  const vals = Object.values(hz).filter((r) => r !== "Not Applicable" && r !== "No Rating") as string[]

  const score = (r: string) => (RISK_LEVELS as any)[r] ?? 0

  const avg = vals.length === 0 ? 0 : vals.reduce((s, r) => s + score(r), 0) / vals.length

  let avgLabel = "Very Low"
  if (avg >= 4.5) avgLabel = "Very High"
  else if (avg >= 3.5) avgLabel = "Relatively High"
  else if (avg >= 2.5) avgLabel = "Relatively Moderate"
  else if (avg >= 1.5) avgLabel = "Relatively Low"

  return {
    totalHazards: Object.keys(hz).length,
    applicableHazards: vals.length,
    highRiskCount: vals.filter((r) => ["Very High", "Relatively High"].includes(r)).length,
    moderateRiskCount: vals.filter((r) => r === "Relatively Moderate").length,
    lowRiskCount: vals.filter((r) => ["Relatively Low", "Very Low"].includes(r)).length,
    averageRisk: avgLabel,
  }
}

export type CountyRiskData = {
  fips: string
  county_name: string
  state_name: string
  state_fips: string
  nri_composite_rating: string
  nri_composite_score: number
  hazard_ratings: HazardRatings
}
