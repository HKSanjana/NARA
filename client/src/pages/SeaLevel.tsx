// src/components/MapComponent.tsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Waves } from 'lucide-react'; // Assuming you have lucide-react installed

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Pin {
    id: number;
    position: [number, number];
    name: string;
    description: string;
}

const pins: Pin[] = [
    { id: 1, position: [6.9271, 79.8612], name: 'Colombo', description: 'Colombo is the commercial capital and largest city of Sri Lanka.' },
    { id: 2, position: [9.6615, 80.0255], name: 'Jaffna', description: 'Jaffna is a city on the northern tip of Sri Lanka.' },
    { id: 3, position: [6.1287, 81.1219], name: 'Hambanthota', description: 'Hambanthota is a coastal city located in the southeastern part of Sri Lanka.' },
    { id: 4, position: [5.9529, 80.4719], name: 'Mirissa', description: 'Mirissa is a small coastal town famous for its pristine beaches and whale watching.' },
    { id: 5, position: [8.5878, 81.2155], name: 'Trincomalee', description: 'Trincomalee is a port city located on the northeast coast of Sri Lanka.' },
    { id: 6, position: [6.035, 80.217], name: 'Sea Level', description: 'This pin represents a coastal area where sea level monitoring can be conducted.' },
];

const SeaLevelComponent: React.FC = () => {
    const [selectedPin, setSelectedPin] = useState<Pin | null>(null);

    return (
        <section>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                    {/* Left - Paragraph */}
                    <div className="lg:w-1/2 space-y-4 bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Waves className="text-blue-600 w-8 h-8" />
                            <h2 className="text-2xl font-bold text-blue-800">Sea Level Variation in Sri Lanka</h2>
                        </div>
                        <p className="text-gray-700 text-justify leading-relaxed">
                            Sea level variation refers to the short- and long-term fluctuations in ocean water levels caused by astronomical,
                            meteorological, and hydrological factors specific to a location. These changes can occur over time spans ranging
                            from just a few minutes to several decades or even centuries. 
                        </p>
                        <p className="text-gray-700 text-justify leading-relaxed">
                            Along the Sri Lankan coast, sea-level-related events have included meteotsunamis, tsunamis, storm surges, tidal
                            variations, seasonal patterns, El Niño phenomena, and gradual sea-level rise. Each of these events carries unique
                            environmental and socio-economic impacts, making regular monitoring crucial for coastal communities.
                        </p>
                        <p className="text-gray-700 text-justify leading-relaxed">
                            While tidal variations are largely driven by the gravitational pull of the moon and the sun, non-tidal variations
                            stem from influences like atmospheric pressure changes (inverse barometric effect), strong winds, wave action,
                            and seismic disturbances. Understanding these dynamics is essential for developing effective coastal protection
                            and disaster preparedness strategies.
                        </p>
                    </div>

                    {/* Right - Map Component */}
                    <div className="lg:w-1/2">
                        <MapContainer
                            center={[7.8731, 80.7718]}
                            zoom={7}
                            style={{
                                height: '70vh', // Mobile-friendly height
                                width: '100%',
                                border: '1px solid #ccc',
                                borderRadius: '10px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                overflow: 'hidden'
                            }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {pins.map(pin => (
                                <Marker key={pin.id} position={pin.position} eventHandlers={{
                                    click: () => setSelectedPin(pin),
                                }}>
                                    <Popup>{pin.name}</Popup>
                                </Marker>
                            ))}
                            {selectedPin && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '10px', // Closer to the bottom on mobile
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: 'white',
                                    padding: '10px', // Smaller padding
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                    zIndex: 1000,
                                    maxWidth: '90%',
                                    textAlign: 'center'
                                }}>
                                    <h3>{selectedPin.name}</h3>
                                    <p>{selectedPin.description}</p>
                                </div>
                            )}
                        </MapContainer>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SeaLevelComponent;