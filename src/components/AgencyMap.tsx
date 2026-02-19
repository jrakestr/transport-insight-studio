import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';

interface AgencyMapProps {
  address: string;
  agencyName: string;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoianJha2VzdHIiLCJhIjoiY20xcTVjZjdsMGNiODJscTdzbDB4M3c3dCJ9.3m-2_gsDceYVB8vRA0YoyQ';

export const AgencyMap: React.FC<AgencyMapProps> = ({ address, agencyName }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !address) return;

    const geocodeAndInitMap = async () => {
      try {
        // Geocode the address
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
        );
        const data = await response.json();

        if (!data.features || data.features.length === 0) {
          setError('Location not found');
          setIsLoading(false);
          return;
        }

        const [lng, lat] = data.features[0].center;

        // Initialize map
        mapboxgl.accessToken = MAPBOX_TOKEN;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [lng, lat],
          zoom: 14,
        });

        // Add navigation controls
        map.current.addControl(
          new mapboxgl.NavigationControl({ visualizePitch: false }),
          'top-right'
        );

        // Add marker with a fixed color (CSS variables don't work here)
        new mapboxgl.Marker({ color: '#2563eb' })
          .setLngLat([lng, lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<strong>${agencyName}</strong><br/><span style="font-size: 12px; color: #666;">${address}</span>`
            )
          )
          .addTo(map.current);

        map.current.on('load', () => {
          setIsLoading(false);
        });

      } catch (err) {
        console.error('Map error:', err);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    geocodeAndInitMap();

    return () => {
      map.current?.remove();
    };
  }, [address, agencyName]);

  if (!address) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-64 w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : (
            <div ref={mapContainer} className="h-full w-full" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
