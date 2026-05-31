import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Import default marker assets to fix Vite asset resolving bug in Leaflet
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerIcon2xPng from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2xPng,
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
});

// Category to Emoji mapper for map pins
const getCategoryEmoji = (category) => {
  switch (category) {
    case 'Sports': return '⚽';
    case 'Tech': return '💻';
    case 'Social': return '🎉';
    case 'Food': return '🍕';
    case 'Music': return '🎵';
    case 'Art': return '🎨';
    case 'Study': return '📚';
    case 'Gaming': return '🎮';
    default: return '📍';
  }
};

// Create a custom category colored DivIcon for event pins
const createCustomIcon = (category) => {
  const emoji = getCategoryEmoji(category);
  let color = '#7C3AED'; // default purple
  
  if (category === 'Sports') color = '#10B981';
  else if (category === 'Tech') color = '#3B82F6';
  else if (category === 'Social') color = '#F59E0B';
  else if (category === 'Food') color = '#EF4444';
  else if (category === 'Music') color = '#8B5CF6';
  else if (category === 'Art') color = '#EC4899';
  else if (category === 'Study') color = '#06B6D4';

  return new L.DivIcon({
    html: `<div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      border: 2px solid white;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25);
      cursor: pointer;
      transition: transform 0.1s ease;
    " class="hover:scale-110">${emoji}</div>`,
    className: 'custom-leaflet-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Map sub-component to handle map centering & animations
const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  const lat = center ? center[0] : null;
  const lng = center ? center[1] : null;

  useEffect(() => {
    if (lat !== null && lng !== null) {
      const currentCenter = map.getCenter();
      // Compare values to prevent fighting with user dragging
      const isSame = Math.abs(currentCenter.lat - lat) < 0.0001 && Math.abs(currentCenter.lng - lng) < 0.0001;
      
      if (!isSame) {
        map.setView([lat, lng], zoom || map.getZoom(), { animate: true, duration: 0.8 });
      }
    }
  }, [lat, lng, zoom, map]);
  return null;
};

// Custom map click handler hook for the Location Picker
const MapClickHandler = ({ onMapClick, active }) => {
  useMapEvents({
    click(e) {
      if (active && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// Force map to recalculate its dimensions when dynamic resizing finishes
const ResizeMapTrigger = ({ watchVal }) => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 450); // 450ms matching transition duration + safety margin
    return () => clearTimeout(timer);
  }, [watchVal, map]);
  return null;
};

const userLocationIcon = new L.DivIcon({
  html: `<div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
    <div style="position: absolute; width: 14px; height: 14px; background-color: #3B82F6; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 6px rgba(59, 130, 246, 0.6); z-index: 10;"></div>
    <div style="position: absolute; width: 24px; height: 24px; background-color: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: gps-pulse 2s infinite; top: 0; left: 0;"></div>
  </div>
  <style>
    @keyframes gps-pulse {
      0% { transform: scale(0.5); opacity: 0.9; }
      70% { transform: scale(2.0); opacity: 0; }
      100% { transform: scale(0.5); opacity: 0; }
    }
  </style>`,
  className: 'user-location-pin',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

const LeafletMap = ({
  events = [],
  center = [12.9716, 77.5946], // Default Bangalore
  zoom = 13,
  onMarkerClick = null,
  interactive = false, // True if used as a Location Picker
  onLocationSelect = null,
  selectedLocation = null, // { lat, lng }
  userLocation = null,
  resizeTrigger = null
}) => {
  const [mapCenter, setMapCenter] = useState(center);

  // Synchronize center props
  useEffect(() => {
    if (selectedLocation) {
      setMapCenter([selectedLocation.lat, selectedLocation.lng]);
    } else if (center) {
      setMapCenter(center);
    }
  }, [center, selectedLocation]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '280px' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
          url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        />

        {/* Force recalculating size when container transitions finish */}
        <ResizeMapTrigger watchVal={resizeTrigger} />

        {/* Dynamic Center Adjustment */}
        <ChangeMapView center={mapCenter} zoom={zoom} />

        {/* Location Picker Handler */}
        <MapClickHandler active={interactive} onMapClick={onLocationSelect} />

        {/* Location Picker Selected Marker */}
        {interactive && selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={new L.Icon({
              iconUrl: markerIconPng,
              iconRetinaUrl: markerIcon2xPng,
              shadowUrl: markerShadowPng,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          />
        )}

        {/* User Location Pulse Marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>
              <div className="p-1 font-sans text-xs font-bold text-gray-800">
                You are here
              </div>
            </Popup>
          </Marker>
        )}

        {/* Event Markers Plot */}
        {!interactive && events.map((event) => {
          if (!event.location || !event.location.latitude || !event.location.longitude) return null;
          
          return (
            <Marker
              key={event._id}
              position={[event.location.latitude, event.location.longitude]}
              icon={createCustomIcon(event.category)}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) {
                    onMarkerClick(event);
                  }
                },
              }}
            >
              <Popup>
                <div className="p-1 font-sans">
                  <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">{event.title}</h4>
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-1">
                    <span>{event.category}</span>
                    <span>•</span>
                    <span>{event.spotsLeft} spots left</span>
                  </div>
                  <p className="text-[10px] text-gray-600 line-clamp-1">{event.location.address}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
