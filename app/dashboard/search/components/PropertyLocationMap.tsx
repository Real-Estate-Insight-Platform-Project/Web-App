"use client"

import React, { useEffect, useRef } from 'react';

// Note: We are not importing 'leaflet' or its CSS at the top level of the file.
// This prevents Next.js from trying to bundle this client-side library on the server.

interface PropertyLocationMapProps {
  latitude: number;
  longitude: number;
}

export default function PropertyLocationMap({ latitude, longitude }: PropertyLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any | null>(null); // Using 'any' for the Leaflet map instance type

  useEffect(() => {
    let isMounted = true; // A flag to prevent state updates if the component unmounts during async operations

    // We only proceed if the component is mounted in a browser environment
    if (mapRef.current && typeof window !== 'undefined') {
      
      // Dynamically import the Leaflet library. This ensures it's only loaded on the client-side.
      import('leaflet').then(L => {
        // We also dynamically import the CSS file required by Leaflet.
        import('leaflet/dist/leaflet.css');

        if (!isMounted) return; // If the component has unmounted while Leaflet was loading, we do nothing.

        // This is a standard fix for a common issue where default marker icons don't appear.
        // We are explicitly setting the paths to the icon images from a CDN.
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Initialize the map only if it hasn't been created yet.
        if (!mapInstanceRef.current && mapRef.current) {
          const map = L.map(mapRef.current).setView([latitude, longitude], 15);
          mapInstanceRef.current = map;

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

          L.marker([latitude, longitude]).addTo(map);
        } else if (mapInstanceRef.current) {
          // If the map instance already exists, we just update its view to the new coordinates.
          mapInstanceRef.current.setView([latitude, longitude], 15);
        }
      }).catch(error => {
        console.error("Failed to load Leaflet map library", error);
      });
    }

    // This is a cleanup function that React runs when the component unmounts.
    // It's important for preventing memory leaks.
    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove(); // Properly destroy the map instance
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude]); // The effect will re-run if latitude or longitude changes.

  // This div is the container where the Leaflet map will be rendered.
  return <div ref={mapRef} className="h-full w-full" />;
}

