import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/leaflet.markercluster.js";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import {} from "leaflet.markercluster";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

interface MapProps {
  lat: number;
  lng: number;
  zoom: number;
  onMarkerClick?: (id: number) => void;
  onMarkerNotFound?: () => void;
}

interface PlaceMap {
  id: number;
  x: number;
  y: number;
  name: string;
}

const markerIcon = L.icon({
  iconUrl: "src/assets/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const MapComponent: React.FC<MapProps> = ({
  lat,
  lng,
  zoom,
  onMarkerClick,
  onMarkerNotFound,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  let markerClusterGroup: L.MarkerClusterGroup;

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView([lat, lng], zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    markerClusterGroup = L.markerClusterGroup().addTo(map);

    async function fetchAndDisplayMarkers() {
      const bounds = map.getBounds();
      const places = await fetchPlacesInBounds(bounds);

      if (places.length === 0) {
        {
          onMarkerNotFound && onMarkerNotFound();
        }
      }

      markerClusterGroup.clearLayers();

      places.forEach((place: PlaceMap) => {
        const marker = L.marker([place.y, place.x], { icon: markerIcon })
          .bindPopup(place.name)
          .on("click", () => {
            onMarkerClick && onMarkerClick(place.id);
          });
        markerClusterGroup.addLayer(marker);
      });
    }

    // Load markers initially and on map move
    fetchAndDisplayMarkers();
    map.on("moveend", fetchAndDisplayMarkers);

    return () => {
      map.off("moveend", fetchAndDisplayMarkers);
      map.remove();
    };
  }, [lat, lng, zoom, onMarkerClick]);

  async function fetchPlacesInBounds(
    bounds: L.LatLngBounds
  ): Promise<PlaceMap[]> {
    try {
      const accessToken = getCookie("accessToken");
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const query = `startX=${sw.lng}&startY=${sw.lat}&endX=${ne.lng}&endY=${ne.lat}`;
      const response = await fetch(`${apiBaseUrl}/api/v1/places?${query}`, {
        method: "GET",
        headers: {
          Authorization: `${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch places");

      const { places } = await response.json();
      return places;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  return (
    <div
      ref={mapRef}
      style={{
        height: "400px",
        width: "100%",
        margin: "20px 0px",
        zIndex: "0",
      }}
    />
  );
};

export default MapComponent;

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop()?.split(";").shift() : undefined;
}
