'use client';

import { useEffect, useRef } from 'react';
import { PlanStop } from '@/lib/types';

interface Props {
  stops: PlanStop[];
}

export function RouteMap({ stops }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || stops.length === 0) return;
    if (typeof window === 'undefined') return;

    if (mapRef.current) return; // Already initialized

    import('leaflet').then((L) => {
      // Fix for default marker icons in webpack
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!mapContainer.current) return;

      const firstStop = stops[0];

      mapRef.current = L.map(mapContainer.current).setView(
        [firstStop.restaurant.location.coordinates.latitude, firstStop.restaurant.location.coordinates.longitude],
        14
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapRef.current);

      const markers: [number, number][] = [];
      stops.forEach((stop, index) => {
        const lat = stop.restaurant.location.coordinates.latitude;
        const lng = stop.restaurant.location.coordinates.longitude;
        markers.push([lat, lng]);

        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="width:32px;height:32px;border-radius:50%;background:#f59e0b;border:2px solid white;display:flex;align-items:center;justify-content:center;color:#18181b;font-weight:bold;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${index + 1}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        L.marker([lat, lng], { icon })
          .addTo(mapRef.current!)
          .bindPopup(`<b>${stop.restaurant.name}</b><br>${stop.time}`);
      });

      if (stops.length > 1) {
        L.polyline(markers, {
          color: '#f59e0b',
          weight: 4,
          dashArray: '10, 10',
        }).addTo(mapRef.current);

        mapRef.current.fitBounds(markers, { padding: [40, 40] });
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [stops]);

  useEffect(() => {
    // Load Leaflet CSS
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }
  }, []);

  if (stops.length === 0) {
    return (
      <div className="w-full h-64 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
        No stops to display
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="w-full h-64 rounded-xl overflow-hidden border border-zinc-800"
      style={{ background: '#1a1a1a' }}
    />
  );
}
