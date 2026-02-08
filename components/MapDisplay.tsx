import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapDisplayProps {
    userLoc: { lat: number; lng: number };
    mechanicLoc: { lat: number; lng: number };
    mechanicName: string;
}

// Component to handle auto-fitting the map to show both markers
const RecenterMap: React.FC<{ userLoc: [number, number], mechanicLoc: [number, number] }> = ({ userLoc, mechanicLoc }) => {
    const map = useMap();
    useEffect(() => {
        const bounds = L.latLngBounds([userLoc, mechanicLoc]);
        map.fitBounds(bounds, { padding: [50, 50] });
    }, [map, userLoc, mechanicLoc]);
    return null;
};

const MapDisplay: React.FC<MapDisplayProps> = ({ userLoc, mechanicLoc, mechanicName }) => {
    const userPos: [number, number] = [userLoc.lat, userLoc.lng];
    const mechPos: [number, number] = [mechanicLoc.lat, mechanicLoc.lng];

    return (
        <div className="w-full h-64 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner relative z-10">
            <MapContainer
                center={userPos}
                zoom={13}
                scrollWheelZoom={false}
                className="w-full h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={userPos}>
                    <Popup>
                        <div className="text-sm font-bold">You are here</div>
                    </Popup>
                </Marker>

                <Marker position={mechPos}>
                    <Popup>
                        <div className="text-sm font-bold">{mechanicName}</div>
                        <div className="text-xs text-slate-500">Arriving Soon</div>
                    </Popup>
                </Marker>

                <RecenterMap userLoc={userPos} mechanicLoc={mechPos} />
            </MapContainer>
        </div>
    );
};

export default MapDisplay;
