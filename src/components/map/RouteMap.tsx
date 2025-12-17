'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PlanStop } from '@/lib/types';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Props {
  stops: PlanStop[];
}

export function RouteMap({ stops }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || stops.length === 0 || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const firstStop = stops[0];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [
        firstStop.restaurant.location.coordinates.longitude,
        firstStop.restaurant.location.coordinates.latitude,
      ],
      zoom: 14,
    });

    map.current.on('load', () => {
      stops.forEach((stop, index) => {
        const el = document.createElement('div');
        el.className = 'flex items-center justify-center';
        el.innerHTML = `
          <div class="w-10 h-10 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-zinc-900 font-bold shadow-lg text-sm">
            ${index + 1}
          </div>
        `;

        new mapboxgl.Marker(el)
          .setLngLat([
            stop.restaurant.location.coordinates.longitude,
            stop.restaurant.location.coordinates.latitude,
          ])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="text-zinc-900">
                <strong>${stop.restaurant.name}</strong>
                <p class="text-sm">${stop.time}</p>
              </div>
            `)
          )
          .addTo(map.current!);
      });

      if (stops.length > 1) {
        const coordinates = stops.map(s => [
          s.restaurant.location.coordinates.longitude,
          s.restaurant.location.coordinates.latitude,
        ] as [number, number]);

        map.current!.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates,
            },
          },
        });

        map.current!.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#f59e0b',
            'line-width': 4,
            'line-dasharray': [2, 2],
          },
        });

        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord));
        map.current!.fitBounds(bounds, { padding: 60 });
      }
    });

    return () => map.current?.remove();
  }, [stops]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-64 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
        Map unavailable - Configure Mapbox token
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="w-full h-64 rounded-xl overflow-hidden border border-zinc-800"
    />
  );
}
