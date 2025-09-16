"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import type { Map as LeafletMap, GeoJSON as LGeoJSON } from "leaflet"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Info, Loader2 } from "lucide-react"
import {
  getRiskColor,
  getContrastTextColor,
  getMostProminentRisk,
  sortHazardsByRisk,
  calculateRiskSummary,
  formatCountyName,
  RISK_COLORS,
  type CountyRiskData,
} from "@/lib/riskUtils"

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false })
const GeoJSON = dynamic(() => import("react-leaflet").then((m) => m.GeoJSON), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false })

type Feature = {
  type: "Feature"
  properties: {
    county_fips?: string
    county_name?: string
    state_name?: string
    risk_score_composite?: number
    risk_rating_composite?: string
    STATEFP?: string
    NAME?: string
    hazards?: any
  }
  geometry: any
}

const RISK_LEVELS = Object.keys(RISK_COLORS).filter((level) => level !== "No Data")

export default function RiskMapPage() {
  const [fc, setFc] = useState<{ type: string; features: Feature[] } | null>(null)
  const [selected, setSelected] = useState<CountyRiskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const layerRef = useRef<LGeoJSON | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const r = await fetch("/api/risk-map/geojson", { cache: "no-store" })
        if (!r.ok) throw new Error("Failed to fetch GeoJSON data")
        const j = await r.json()
        setFc(j)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load risk data")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const styleFn = useCallback((feat: any) => {
    const rating = feat?.properties?.risk_rating_composite as string | undefined
    const fill = getRiskColor(rating)
    return {
      fillColor: fill,
      weight: 0.5,
      color: "#fff",
      opacity: 0.9,
      fillOpacity: 0.7,
    }
  }, [])

  const onEachFeature = useCallback((feature: any, layer: any) => {
    layer.on("click", async () => {
      const fips = (feature?.properties?.county_fips || "").toString().padStart(5, "0")
      if (!/^\d{5}$/.test(fips)) return

      try {
        const r = await fetch(`/api/risk-map/county/${fips}`, { cache: "no-store" })
        if (!r.ok) return
        const detail = (await r.json()) as CountyRiskData
        setSelected(detail)

        // Create popup content
        const popupContent = renderPopupContent(detail)
        layer.bindPopup(popupContent, { maxWidth: 300 }).openPopup()
      } catch (err) {
        console.error("[v0] Failed to fetch county details:", err)
      }
    })

    // Add hover effects
    layer.on("mouseover", () => {
      layer.setStyle({
        weight: 2,
        color: "#ffffff",
        fillOpacity: 0.8,
      })
    })

    layer.on("mouseout", () => {
      layer.setStyle({
        weight: 0.5,
        color: "#fff",
        fillOpacity: 0.7,
      })
    })
  }, [])

  const renderPopupContent = (d: CountyRiskData) => {
    const most = getMostProminentRisk(d.hazard_ratings)
    const summary = calculateRiskSummary(d.hazard_ratings)
    const color = getRiskColor(d.nri_composite_rating)
    const textColor = getContrastTextColor(color)

    const rows = sortHazardsByRisk(d.hazard_ratings)
      .map(
        ([haz, rating]) => `<tr><td style="padding:2px 4px">${haz}</td><td style="padding:2px 4px">${rating}</td></tr>`,
      )
      .join("")

    return `
      <div style="min-width:280px; font-family: ui-sans-serif, system-ui, sans-serif;">
        <h3 style="margin:0 0 8px 0; font-size:16px; font-weight:600;">${formatCountyName(d.county_name, d.state_name)}</h3>
        <div style="margin:6px 0; display:flex; align-items:center; gap:8px;">
          <span style="font-weight:500; font-size:14px;">Composite Risk:</span>
          <span style="display:inline-block; padding:4px 8px; border-radius:6px; background:${color}; color:${textColor}; font-size:12px; font-weight:500;">
            ${d.nri_composite_rating}${d.nri_composite_score ? ` (${d.nri_composite_score.toFixed(2)})` : ""}
          </span>
        </div>
        <div style="margin:6px 0; font-size:14px;"><strong>Primary Threat:</strong> ${most}</div>
        <div style="margin:8px 0; font-size:12px; color:#666;">
          <strong>Summary:</strong> ${summary.highRiskCount} High · ${summary.moderateRiskCount} Moderate · ${summary.lowRiskCount} Low
        </div>
        <details style="margin-top:8px;">
          <summary style="cursor:pointer; font-size:13px; font-weight:500; margin-bottom:4px;">Individual Risk Ratings</summary>
          <div style="max-height:160px; overflow:auto; margin-top:6px;">
            <table style="width:100%; font-size:12px; border-collapse:collapse;">
              <thead>
                <tr style="border-bottom:1px solid #ddd;">
                  <th style="text-align:left; padding:4px; font-weight:600;">Hazard</th>
                  <th style="text-align:left; padding:4px; font-weight:600;">Rating</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </details>
        <div style="margin-top:8px; font-size:11px; color:#888;">Source: FEMA National Risk Index</div>
      </div>
    `
  }

  const center = useMemo<[number, number]>(() => [39.8283, -98.5795], [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading risk map...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Map</h1>
          <p className="text-muted-foreground">
            Explore natural disaster risk levels across US counties using FEMA National Risk Index data
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Legend Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Risk Legend</span>
            </CardTitle>
            <CardDescription>FEMA National Risk Index Composite Rating</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {RISK_LEVELS.map((level) => (
              <div key={level} className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: RISK_COLORS[level as keyof typeof RISK_COLORS] }}
                />
                <span className="text-sm font-medium">{level}</span>
              </div>
            ))}
            <div className="flex items-center space-x-3 pt-2 border-t">
              <div
                className="w-4 h-4 rounded border border-gray-300"
                style={{ backgroundColor: RISK_COLORS["No Data"] }}
              />
              <span className="text-sm text-muted-foreground">No Data Available</span>
            </div>
          </CardContent>
        </Card>

        {/* Map Section */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>US Counties Risk Map</CardTitle>
            <CardDescription>Click on any county to view detailed risk information</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative">
              <div style={{ height: "600px", width: "100%", borderRadius: "8px", overflow: "hidden" }}>
                <MapContainer
                  center={center}
                  zoom={4}
                  ref={mapRef}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {fc && (
                    <GeoJSON
                      data={fc as any}
                      style={styleFn}
                      onEachFeature={onEachFeature}
                      ref={(ref) => (layerRef.current = (ref as any)?.leafletElement ?? null)}
                    />
                  )}
                </MapContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
