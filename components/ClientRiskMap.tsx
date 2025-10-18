"use client";
import { useEffect, useRef } from "react";
import { getRiskColor, getContrastTextColor, formatCountyName } from "@/lib/riskUtils";

export default function ClientRiskMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    
    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        // Import Leaflet dynamically
        const L = (await import("leaflet")).default;
        await import("leaflet.vectorgrid");

        if (!mounted || !mapRef.current) return;

        // Create map instance const
        const map = L.map(mapRef.current, {
          center: [39.8283, -98.5795],
          zoom: 4,
          minZoom: 3,    // Prevent zooming out too far
          maxZoom: 14,   // Prevent zooming in too far
          scrollWheelZoom: true
        });

        mapInstanceRef.current = map;

        // Add base tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // Add vector tiles layer
        const url = "/api/tiles/counties/{z}/{x}/{y}";
        const vg = (L as any).vectorGrid.protobuf(url, {
          interactive: true,
          maxNativeZoom: 14,
          vectorTileLayerStyles: {
            counties: (p: any) => ({
              weight: 0.5, 
              color: "#fff", 
              fill: true, 
              fillOpacity: 0.7,
              fillColor: getRiskColor(p?.risk_index_rating),
            }),
          },
          getFeatureId: (f: any) => f.properties?.geoid ?? `${f.properties?.statefp ?? ""}${f.properties?.countyfp ?? ""}`,
        });

        vg.on("click", (e: any) => {
          const p = e.layer?.properties || {};
          const color = getRiskColor(p.risk_index_rating);
          const text = getContrastTextColor(color);
          const html = `
            <div style="min-width:280px;font-family:ui-sans-serif,system-ui">
              <h3 style="margin:0 0 8px;font-size:16px;font-weight:600">
                ${formatCountyName(p.county_name || "County", p.state_name || "")}
              </h3>
              <div style="margin:6px 0;display:flex;gap:8px;align-items:center">
                <span style="font-weight:500;font-size:14px">Composite Risk:</span>
                <span style="padding:4px 8px;border-radius:6px;background:${color};color:${text};font-size:12px;font-weight:500">
                  ${p.risk_index_rating ?? "No Data"}${Number.isFinite(p.risk_index_score) ? ` (${p.risk_index_score.toFixed(2)})` : ""}
                </span>
              </div>
              <div style="margin:6px 0;font-size:14px"><strong>Primary Hazard:</strong> ${p.predominant_hazard || "Unknown"}</div>
            </div>`;
          L.popup().setLatLng(e.latlng).setContent(html).openOn(map);
        });

        vg.addTo(map);
      } catch (error) {
        console.error("Failed to initialize map:", error);
      }
    };

    // Delay initialization to avoid strict mode conflicts
    const timer = setTimeout(initMap, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      
      // Cleanup map instance
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.error("Error during map cleanup:", error);
        }
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height: "100%", 
        width: "100%",
        minHeight: "400px" 
      }} 
    />
  );
}
