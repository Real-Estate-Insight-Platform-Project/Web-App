'use client'

import { useMemo, useState, type MouseEvent as ReactMouseEvent } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"

const statesGeoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"
const countiesGeoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json"

const stateNameToFips: Record<string, string> = {
  Alabama: "01",
  Alaska: "02",
  Arizona: "04",
  Arkansas: "05",
  California: "06",
  Colorado: "08",
  Connecticut: "09",
  Delaware: "10",
  "District of Columbia": "11",
  Florida: "12",
  Georgia: "13",
  Hawaii: "15",
  Idaho: "16",
  Illinois: "17",
  Indiana: "18",
  Iowa: "19",
  Kansas: "20",
  Kentucky: "21",
  Louisiana: "22",
  Maine: "23",
  Maryland: "24",
  Massachusetts: "25",
  Michigan: "26",
  Minnesota: "27",
  Mississippi: "28",
  Missouri: "29",
  Montana: "30",
  Nebraska: "31",
  Nevada: "32",
  "New Hampshire": "33",
  "New Jersey": "34",
  "New Mexico": "35",
  "New York": "36",
  "North Carolina": "37",
  "North Dakota": "38",
  Ohio: "39",
  Oklahoma: "40",
  Oregon: "41",
  Pennsylvania: "42",
  "Rhode Island": "44",
  "South Carolina": "45",
  "South Dakota": "46",
  Tennessee: "47",
  Texas: "48",
  Utah: "49",
  Vermont: "50",
  Virginia: "51",
  Washington: "53",
  "West Virginia": "54",
  Wisconsin: "55",
  Wyoming: "56"
}

const normalizeCountyName = (value: string) => value.toLowerCase().replace(/\s+/g, " ").trim()

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .map((segment) => (segment ? segment[0].toUpperCase() + segment.slice(1) : segment))
    .join(" ")

export const formatCountyLabel = (value: string) => {
  const lower = value.toLowerCase()
  const label = toTitleCase(value)
  const nonCountySuffixes = [
    "parish",
    "census area",
    "borough",
    "municipality",
    "census district",
    "municipio",
    "district",
    "region",
    "plantation"
  ]

  if (lower === "district of columbia") return label

  return nonCountySuffixes.some((suffix) => lower.includes(suffix)) ? label : `${label} County`
}

export type MapGeography = {
  id?: string | number
  rsmKey: string
  properties?: {
    name?: string
  }
}

interface MarketCoverageMapProps {
  selectedCity: string
  selectedCounty: string
  availableCounties: string[]
  onStateSelect: (stateName: string) => void
  onCountySelect: (countyName: string) => void
}

export function MarketCoverageMap({
  selectedCity,
  selectedCounty,
  availableCounties,
  onStateSelect,
  onCountySelect
}: MarketCoverageMapProps) {
  const [tooltip, setTooltip] = useState<{ label: string; x: number; y: number } | null>(null)

  const selectedStateFips = stateNameToFips[selectedCity] ?? ""

  const countyLookup = useMemo(() => {
    const map = new Map<string, string>()
    availableCounties.forEach((county) => {
      map.set(normalizeCountyName(county), county)
    })
    return map
  }, [availableCounties])

  const normalizedSelectedCounty = normalizeCountyName(selectedCounty)

  const showTooltip = (
    event: ReactMouseEvent<SVGPathElement, globalThis.MouseEvent>,
    label: string
  ) => {
    setTooltip({ label, x: event.clientX, y: event.clientY })
  }

  const moveTooltip = (event: ReactMouseEvent<SVGPathElement, globalThis.MouseEvent>) => {
    setTooltip((current) => (current ? { ...current, x: event.clientX, y: event.clientY } : current))
  }

  const hideTooltip = () => setTooltip(null)

  return (
    <div className="relative">
      <div className="aspect-[16/9] w-full min-h-[320px]">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{ scale: 850 }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={statesGeoUrl}>
            {({ geographies }: { geographies: MapGeography[] }) =>
              geographies.map((geo: MapGeography) => {
                const stateName = (geo.properties?.name as string) || ""
                const isActiveState = stateName === selectedCity
                const fill = isActiveState
                  ? selectedCounty !== "none"
                    ? "#bfdbfe"
                    : "#2563eb"
                  : "#e2e8f0"

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={isActiveState ? "#1d4ed8" : "#94a3b8"}
                    strokeWidth={isActiveState ? 1 : 0.6}
                    onClick={() => {
                      setTooltip(null)
                      onStateSelect(stateName)
                    }}
                    onMouseEnter={(
                      event: ReactMouseEvent<SVGPathElement, globalThis.MouseEvent>
                    ) => showTooltip(event, stateName)}
                    onMouseMove={(
                      event: ReactMouseEvent<SVGPathElement, globalThis.MouseEvent>
                    ) => moveTooltip(event)}
                    onMouseLeave={hideTooltip}
                    style={{
                      default: { outline: "none" },
                      hover: { outline: "none", fill: "#93c5fd" },
                      pressed: { outline: "none" }
                    }}
                  />
                )
              })
            }
          </Geographies>

          {selectedStateFips && (
            <Geographies geography={countiesGeoUrl}>
              {({ geographies }: { geographies: MapGeography[] }) =>
                geographies
                  .filter((geo: MapGeography) => String(geo.id ?? "").startsWith(selectedStateFips))
                  .map((geo: MapGeography) => {
                    const countyName = (geo.properties?.name as string) || ""
                    const normalizedName = normalizeCountyName(countyName)
                    const lookupValue = countyLookup.get(normalizedName)
                    const isSelected =
                      lookupValue &&
                      selectedCounty !== "none" &&
                      normalizeCountyName(lookupValue) === normalizedSelectedCounty
                    const isClickable = Boolean(lookupValue)
                    const fill = isSelected
                      ? "#1d4ed8"
                      : isClickable
                        ? "rgba(59,130,246,0.18)"
                        : "rgba(148,163,184,0.12)"
                    const strokeColor = isSelected ? "#1d4ed8" : "#94a3b8"
                    const strokeWidth = isSelected ? 1.1 : 0.4

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fill}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        onClick={(
                          event: ReactMouseEvent<SVGPathElement, globalThis.MouseEvent>
                        ) => {
                          event.stopPropagation()
                          if (lookupValue) {
                            setTooltip(null)
                            onCountySelect(lookupValue)
                          }
                        }}
                        onMouseEnter={(
                          event: ReactMouseEvent<SVGPathElement, globalThis.MouseEvent>
                        ) => {
                          if (!lookupValue) return
                          showTooltip(event, `${formatCountyLabel(lookupValue)}, ${selectedCity}`)
                        }}
                        onMouseMove={(
                          event: ReactMouseEvent<SVGPathElement, globalThis.MouseEvent>
                        ) => {
                          if (!lookupValue) return
                          moveTooltip(event)
                        }}
                        onMouseLeave={hideTooltip}
                        style={{
                          default: { outline: "none" },
                          hover: {
                            outline: "none",
                            fill: isClickable ? "#2563eb" : "rgba(148,163,184,0.2)"
                          },
                          pressed: { outline: "none" }
                        }}
                      />
                    )
                  })
              }
            </Geographies>
          )}
        </ComposableMap>
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-30 rounded bg-slate-900/90 px-2 py-1 text-xs font-medium text-white shadow"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          {tooltip.label}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-slate-300 bg-slate-200" />
          <span>Other states</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm border border-blue-600 bg-blue-500" />
          <span>{selectedCounty !== "none" ? "Selected county" : "Selected state"}</span>
        </div>
        {availableCounties.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm border border-blue-400 bg-blue-200" />
            <span>Other counties in {selectedCity}</span>
          </div>
        )}
      </div>
    </div>
  )
}
