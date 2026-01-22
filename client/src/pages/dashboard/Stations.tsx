import { useEffect, useState } from 'react';
import { Activity, MapPin, Search, ArrowUpRight, BarChart3, PieChart as PieChartIcon, Microscope } from 'lucide-react';
import { Link } from 'wouter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

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

export default function StationsPage() {
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
                    console.error('Invalid stations data:', data);
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

    const filteredStations = stations.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.station_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Aggregate stats for charts
    const metricStats = [
        { name: 'Water Level', count: stations.filter(s => s.WL !== undefined && s.WL !== null).length, color: '#60a5fa' },
        { name: 'Air Temp', count: stations.filter(s => s.AT !== undefined && s.AT !== null).length, color: '#f87171' },
        { name: 'Humidity', count: stations.filter(s => s.HU !== undefined && s.HU !== null).length, color: '#22d3ee' },
        { name: 'Rainfall', count: stations.filter(s => s.RN !== undefined && s.RN !== null).length, color: '#818cf8' },
        { name: 'Pressure', count: stations.filter(s => s.BP !== undefined && s.BP !== null).length, color: '#fbbf24' },
    ];

    const statusData = [
        { name: 'Reporting', value: stations.length, fill: '#10b981' },
        { name: 'Offline', value: 0, fill: '#64748b' },
    ];

    return (
        <div className="container">
            <header className="header" style={{ border: 'none', marginBottom: '3rem' }}>
                <div>
                    <h1 className="title" style={{ fontSize: '3rem' }}>Network Stations</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Management and health overview of all active monitoring sites</p>
                </div>

                <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 1.5rem', borderRadius: '12px', gap: '0.75rem' }}>
                    <Search size={18} className="text-muted" />
                    <input
                        type="text"
                        placeholder="Filter stations..."
                        className="bg-transparent"
                        style={{ border: 'none', outline: 'none', color: 'white', background: 'transparent' }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <div className="grid" style={{ marginBottom: '3rem' }}>
                <div className="card glass">
                    <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Microscope size={20} className="text-primary" /> Metric Coverage
                    </h3>
                    <div className="chart-container" style={{ height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metricStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {metricStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card glass">
                    <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={20} className="text-primary" /> Operational Status
                    </h3>
                    <div className="chart-container" style={{ height: '240px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="card glass" style={{ marginBottom: '2rem' }}>
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Station Name</th>
                                <th>ID</th>
                                <th>Coordinates</th>
                                <th>Status</th>
                                <th>Last Pulse</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6}><div className="loader" style={{ margin: '1rem auto' }}></div></td>
                                    </tr>
                                ))
                            ) : filteredStations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                        No stations found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredStations.map(station => (
                                    <tr key={station.station_id}>
                                        <td style={{ fontWeight: 600 }}>{station.name}</td>
                                        <td><code>{station.station_id}</code></td>
                                        <td>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                                                {station.latitude !== null && station.longitude !== null && station.latitude !== undefined && station.longitude !== undefined
                                                    ? `Lat: ${station.latitude.toFixed(2)}, Lon: ${station.longitude.toFixed(2)}`
                                                    : 'No location data'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="status-badge">
                                                <span className="pulse"></span> Active
                                            </div>
                                        </td>
                                        <td>{new Date(station.latest_ts).toLocaleString()}</td>
                                        <td>
                                            <Link href={`/stations/${station.station_id}`}>
                                                <a>
                                                    <button className="glass" style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                                        Manage <ArrowUpRight size={14} />
                                                    </button>
                                                </a>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
