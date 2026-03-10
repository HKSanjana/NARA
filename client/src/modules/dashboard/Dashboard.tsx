import { useEffect, useState } from 'react';
import { Wind, Thermometer, Droplets, Activity, CloudRain, Waves, ArrowUpRight, Search } from 'lucide-react';
import { Link } from 'wouter';
import DashboardLayout from '@core/DashboardLayout';
import { getStationDisplayName } from '@/lib/stationNames';
import { api, type StationSummary } from '@/lib/api';

export default function Dashboard() {
    const [stations, setStations] = useState<StationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        api.getDashboardData()
            .then(data => {
                setStations(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setStations([]);
                setLoading(false);
            });
    }, []);

    const getIcon = (code: string) => {
        switch (code) {
            case 'AT': return <Thermometer className="w-4 h-4 text-red-400" />;
            case 'WL': return <Waves className="w-4 h-4 text-blue-400" />;
            case 'HU': return <Droplets className="w-4 h-4 text-cyan-400" />;
            case 'RN': return <CloudRain className="w-4 h-4 text-indigo-400" />;
            case 'WI': return <Wind className="w-4 h-4 text-gray-400" />;
            default: return <Activity className="w-4 h-4 text-gray-400" />;
        }
    };

    const filteredStations = stations.filter(s =>
        (s.name?.toLowerCase() ?? "").includes(searchQuery.toLowerCase()) ||
        (s.station_id?.toLowerCase() ?? "").includes(searchQuery.toLowerCase())
    );

    // Simple global stats
    const tempStations = stations.filter(s => s.AT !== undefined && s.AT !== null);
    const avgTemp = tempStations.length > 0
        ? tempStations.reduce((acc, s) => acc + (s.AT || 0), 0) / tempStations.length
        : 0;

    const wlValues = stations.map(s => s.WL).filter(v => v !== undefined && v !== null) as number[];
    const maxWL = wlValues.length > 0 ? Math.max(...wlValues) : 0;

    return (
        <DashboardLayout>
            <div className="container" style={{ backgroundColor: '#ffffff', color: '#000000', minHeight: '100vh', padding: '2rem' }}>
                <header className="header" style={{ border: 'none', marginBottom: '3rem' }}>
                    <div>
                        <h1 className="title" style={{ fontSize: '3rem', color: '#000000' }}>System Overview</h1>
                        <p style={{ color: '#000000', marginTop: '0.5rem' }}>Monitoring {stations.length} active stations across the network</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1.5rem', borderRadius: '12px', gap: '0.75rem', background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                        <Search size={18} className="text-black" />
                        <input
                            type="text"
                            placeholder="Search stations..."
                            className="bg-transparent"
                            style={{ border: 'none', outline: 'none', color: '#000000', background: 'transparent', width: '100%' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </header>

                <div className="stat-group">
                    <div className="stat-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div className="stat-label" style={{ color: '#000000', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Network Status</div>
                        <div className="stat-value" style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                            <span className="pulse"></span> Online
                        </div>
                    </div>
                    <div className="stat-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div className="stat-label" style={{ color: '#000000', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Air Temp</div>
                        <div className="stat-value" style={{ color: '#000000', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{avgTemp.toFixed(1)}°C</div>
                    </div>
                    <div className="stat-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div className="stat-label" style={{ color: '#000000', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Water Level</div>
                        <div className="stat-value" style={{ color: '#000000', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{maxWL.toFixed(2)}m</div>
                    </div>
                </div>

                <div className="grid">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => <div key={i} className="card loader" style={{ height: 200, width: '100%', margin: 0, background: '#f3f4f6', borderRadius: '12px' }}></div>)
                    ) : (
                        filteredStations.map(station => (
                            <Link key={station.station_id} href={`/stations/${station.station_id}`}>
                                <a>
                                    <div className="card station-card h-full" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', color: '#000000' }}>
                                        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h2 className="station-name" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#000000', margin: 0 }}>{getStationDisplayName(station.name, station.station_id)}</h2>
                                                <span className="timestamp" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', color: '#000000', fontSize: '0.875rem' }}>
                                                    <Activity size={12} /> {station.station_id}
                                                </span>
                                            </div>
                                            <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#f3f4f6' }}>
                                                <ArrowUpRight size={18} className="text-blue-600" />
                                            </div>
                                        </div>

                                        <div className="metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
                                            {['WL', 'AT', 'HU', 'RN'].map(code => {
                                                const val = (station as any)[code];
                                                if (val === undefined || val === null) return null;
                                                return (
                                                    <div key={code} className="metric" style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <span className="metric-label" style={{ fontSize: '0.75rem', color: '#000000', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}>{getIcon(code)} {code}</span>
                                                        <span className="metric-value" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#000000' }}>{val.toFixed(2)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="timestamp" style={{ color: '#000000', fontSize: '0.75rem' }}>Updated {station.latest_ts ? new Date(station.latest_ts).toLocaleTimeString() : 'Never'}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600, letterSpacing: '0.05em' }}>VIEW DETAILS</span>
                                        </div>
                                    </div>
                                </a>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
