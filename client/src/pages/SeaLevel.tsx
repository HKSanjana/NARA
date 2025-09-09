// src/components/MapComponent.tsx

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Waves, TrendingUp, RefreshCw } from 'lucide-react';
import { useLocation } from "wouter";
import myImage1 from '@/assets/new4.jpg';


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
    //{ id: 6, position: [6.035, 80.217], name: 'Sea Level', description: 'This pin represents a coastal area where sea level monitoring can be conducted.' },
];

const MapComponent: React.FC = () => {
    const [location, setLocation] = useLocation();

    const handlePinClick = (pinName: string) => {
        if (pinName === 'Jaffna') {
            // Redirect to the external URL for Jaffna data visualization
            window.location.href = 'http://localhost:5000/data-visualization';
        } else if (pinName === 'Mirissa') {
            // Redirect to the external URL for Mirissa data visualization
            window.location.href = 'http://localhost:5000/mirissa-data';
        } else if (pinName === 'Hambanthota') {
            setLocation('/hdVisualize');
        } else if (pinName === 'Trincomalee') {
            // Redirect to the external URL for Trincomalee data visualization
            window.location.href = '/map?station=trin';
        } else {
            // Redirects all other pins to the /map page
            setLocation('/map');
        }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section
          className="relative bg-cover bg-center py-16"
          style={{ backgroundImage: `url(${myImage1})` }}
        >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
  <h1
    className="text-4xl lg:text-5xl font-bold mb-6 text-white"
    style={{
      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    }}
  >
    Real-Time Sea Level Monitoring
  </h1>
  <p
    className="text-xl max-w-3xl mx-auto text-white"
    style={{
      textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
    }}
  >
    Live data from IOC Sea Level Monitoring stations around Sri Lanka's coastline
  </p>
</div>

      </section>

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
                                height: '70vh',
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
                                    click: () => handlePinClick(pin.name),
                                }}>
                                    <Popup>{pin.name}</Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                    
                </div>
            </div>

              {/* Footer Info */}
      <section className="py-12 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Waves className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Data</h3>
              <p className="text-blue-200">
                Direct connection to IOC Sea Level Monitoring Network stations
              </p>
            </div>
            <div>
              <TrendingUp className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Live Analysis</h3>
              <p className="text-blue-200">
                Immediate processing and trend analysis of incoming data
              </p>
            </div>
            <div>
              <RefreshCw className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Continuous Updates</h3>
              <p className="text-blue-200">
                Fresh data every few minutes from active monitoring stations
              </p>
            </div>
          </div>
        </div>
      </section>
        </section>
      </div>
    );
  }

export default MapComponent;