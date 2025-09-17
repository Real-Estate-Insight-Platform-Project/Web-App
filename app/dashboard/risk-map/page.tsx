"use client";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { RISK_COLORS } from "@/lib/riskUtils";
import { Suspense } from "react";

const ClientRiskMap = dynamic(() => import("@/components/ClientRiskMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading map...</div>
});

const LEGEND_LEVELS = Object.keys(RISK_COLORS).filter(k => k !== "No Data");

export default function RiskMapPage() {
  const error: string | null = null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Map</h1>
          <p className="text-muted-foreground">Explore natural-disaster risk levels across US counties (FEMA NRI)</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>Risk Legend</span>
            </CardTitle>
            <CardDescription>FEMA National Risk Index composite</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {LEGEND_LEVELS.map(level => (
              <div key={level} className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded border border-gray-300"
                     style={{ backgroundColor: RISK_COLORS[level as keyof typeof RISK_COLORS] }} />
                <span className="text-sm font-medium">{level}</span>
              </div>
            ))}
            <div className="flex items-center space-x-3 pt-2 border-t">
              <div className="w-4 h-4 rounded border border-gray-300"
                   style={{ backgroundColor: RISK_COLORS["No Data"] }} />
              <span className="text-sm text-muted-foreground">No Data</span>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>US Counties Risk Map</CardTitle>
            <CardDescription>Click a county to see details</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div style={{ height: "600px", width: "100%", borderRadius: 8, overflow: "hidden" }}>
              <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading map...</div>}>
                <ClientRiskMap />
              </Suspense>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
