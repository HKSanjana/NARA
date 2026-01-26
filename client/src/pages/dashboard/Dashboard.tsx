import { useEffect, useState } from 'react';
import { Wind, Thermometer, Droplets, Activity, CloudRain, Waves, ArrowUpRight, Search } from 'lucide-react';
import { Link } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';

interface StationSummary {
    station_id: string;
    name: string;
    latest_ts: string;
    AT?: number;
    BP?: number;
    HU?: number;
    RN?: number;
    WI?: number;
    WL?: number;
    WT?: number;
    latitude?: number;
    longitude?: number;
}

export default function Dashboard() {
    const [stations, setStations] = useState<StationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch('/api/dashboard')
            .then(async res => {
                const data = await res.json();
                if (res.ok && Array.isArray(data)) {
                    setStations(data);
                } else {
                    console.error('Invalid dashboard data:', data);
                    setStations([]);
                }
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
            <div className="container">
                <header className="header" style={{ border: 'none', marginBottom: '3rem' }}>
                    <div>
                        <h1 className="title" style={{ fontSize: '3rem' }}>System Overview</h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Monitoring {stations.length} active stations across the network</p>
                    </div>

                    <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1.5rem', borderRadius: '12px', gap: '0.75rem' }}>
                        <Search size={18} className="text-muted" />
                        <input
                            type="text"
                            placeholder="Search stations..."
                            className="bg-transparent"
                            style={{ border: 'none', outline: 'none', color: 'white', background: 'transparent' }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </header>

                <div className="stat-group">
                    <div className="stat-card glass">
                        <div className="stat-label">Network Status</div>
                        <div className="stat-value" style={{ color: '#10b981' }}>
                            <span className="pulse"></span> Online
                        </div>
                    </div>
                    <div className="stat-card glass">
                        <div className="stat-label">Average Air Temp</div>
                        <div className="stat-value">{avgTemp.toFixed(1)}°C</div>
                    </div>
                    <div className="stat-card glass">
                        <div className="stat-label">Max Water Level</div>
                        <div className="stat-value">{maxWL.toFixed(2)}m</div>
                    </div>
                </div>

                <div className="grid">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => <div key={i} className="card glass loader" style={{ height: 200, width: '100%', margin: 0 }}></div>)
                    ) : (
                        filteredStations.map(station => (
                            <Link key={station.station_id} href={`/stations/${station.station_id}`}>
                                <a>
                                    <div className="card glass station-card h-full">
                                        <div className="card-header">
                                            <div>
                                                <h2 className="station-name">{station.name || 'Unnamed Station'}</h2>
                                                <span className="timestamp" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                                                    <Activity size={12} /> {station.station_id}
                                                </span>
                                            </div>
                                            <div className="glass" style={{ padding: '0.5rem', borderRadius: '8px' }}>
                                                <ArrowUpRight size={18} className="text-primary" />
                                            </div>
                                        </div>

                                        <div className="metric-grid">
                                            {['WL', 'AT', 'HU', 'RN'].map(code => {
                                                const val = (station as any)[code];
                                                if (val === undefined || val === null) return null;
                                                return (
                                                    <div key={code} className="metric" style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                                                        <span className="metric-label" style={{ fontSize: '0.75rem' }}>{getIcon(code)} {code}</span>
                                                        <span className="metric-value" style={{ fontSize: '1.1rem' }}>{val.toFixed(2)}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="timestamp">Updated {new Date(station.latest_ts).toLocaleTimeString()}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>VIEW DETAILS</span>
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
