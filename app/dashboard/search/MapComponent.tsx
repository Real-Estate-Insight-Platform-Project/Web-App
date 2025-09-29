"use client"

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Property {
  id: string
  title: string
  price: number
  address: string
  city: string
  state: string
  property_type: string
  latitude_coordinates: number
  longitude_coordinates: number
}

interface MapComponentProps {
  properties: Property[]
}

export default function MapComponent({ properties }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapRef.current || properties.length === 0) return

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([39.8283, -98.5795], 4) // Center of US

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current)
    }

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker)
    })
    markersRef.current = []

    // Add markers for each property
    properties.forEach(property => {
      if (property.latitude_coordinates && property.longitude_coordinates) {
        const marker = L.marker([property.latitude_coordinates, property.longitude_coordinates])
          .addTo(mapInstanceRef.current as L.Map)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">${property.title}</h3>
              <p class="text-sm">${property.address}, ${property.city}, ${property.state}</p>
              <p class="text-sm font-bold text-primary">$${property.price.toLocaleString()}</p>
              <p class="text-xs">${property.property_type}</p>
            </div>
          `)
        
        markersRef.current.push(marker)
      }
    })

    // Fit map to show all markers if there are any
    if (markersRef.current.length > 0) {
      const group = new L.FeatureGroup(markersRef.current)
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [properties])

  return <div ref={mapRef} className="h-full w-full rounded-lg" />
}