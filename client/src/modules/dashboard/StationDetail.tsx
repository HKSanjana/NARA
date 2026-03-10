import { useEffect, useState } from 'react';
import { useRoute, Link } from 'wouter';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Wind, Thermometer, Droplets, Activity, CloudRain, Waves, Clock, MapPin, ChevronLeft } from 'lucide-react';
import DashboardLayout from '@core/DashboardLayout';
import { getStationDisplayName } from '@/lib/stationNames';
import { api, type StationSummary } from '@/lib/api';

interface Measurement {
    measurement_ts: string;
    value: number;
    code: string;
    unit?: string;
}

export default function StationDetail() {
    const [, params] = useRoute('/stations/:id');
    const id = params?.id;

    const [station, setStation] = useState<StationSummary | null>(null);
    const [history, setHistory] = useState<Measurement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        setLoading(true);

        // Fetch station summary and history in parallel
        Promise.all([
            api.getDashboardData(),
            api.getMeasurements(id)
        ])
            .then(([dashboard, measurements]) => {
                const found = dashboard.find(s => s.station_id === id);
                if (found) setStation(found);
                setHistory(measurements);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const getIcon = (code: string) => {
        switch (code) {
            case 'AT': return <Thermometer className="w-5 h-5 text-red-400" />;
            case 'WL': return <Waves className="w-5 h-5 text-blue-400" />;
            case 'HU': return <Droplets className="w-5 h-5 text-cyan-400" />;
            case 'RN': return <CloudRain className="w-5 h-5 text-indigo-400" />;
            case 'WI': return <Wind className="w-5 h-5 text-gray-400" />;
            case 'BP': return <Activity className="w-5 h-5 text-purple-400" />;
            case 'WT': return <Thermometer className="w-5 h-5 text-teal-400" />;
            default: return <Activity className="w-5 h-5 text-gray-400" />;
        }
    };

    const getMetricFullName = (code: string) => {
        switch (code) {
            case 'AT': return `${code} - Air Temperature`;
            case 'WL': return `${code} - Water Level`;
            case 'HU': return `${code} - Humidity`;
            case 'RN': return `${code} - Rainfall`;
            case 'WI': return `${code} - Wind`;
            case 'BP': return `${code} - Air Pressure`;
            case 'WT': return `${code} - Water Temperature`;
            default: return code;
        }
    };

    const getChartData = (code: string) => {
        return history
            .filter(m => m.code === code)
            .map(m => ({
                time: new Date(m.measurement_ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                value: m.value,
                fullTime: new Date(m.measurement_ts).toLocaleString()
            }))
            .reverse();
    };

    if (loading) return <div className="loader"></div>;
    if (!station) return <div className="container">Station not found.</div>;

    const activeMetrics = Array.from(new Set(history.map(m => m.code)));

    return (
        <DashboardLayout>
            <div className="container" style={{ backgroundColor: '#ffffff', color: '#000000', minHeight: '100vh', padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/">
                        <a className="nav-link" style={{ width: 'fit-content', marginBottom: '1rem', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                            <ChevronLeft size={20} />
                            <span>Back to Dashboard</span>
                        </a>
                    </Link>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#000000' }}>{getStationDisplayName(station.name, station.station_id)}</h1>
                            <div style={{ display: 'flex', gap: '1.5rem', color: '#000000' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MapPin size={16} />
                                    {station.latitude !== null && station.longitude !== null && station.latitude !== undefined && station.longitude !== undefined
                                        ? `Coord: ${station.latitude.toFixed(2)}, ${station.longitude.toFixed(2)}`
                                        : `Station ID: ${id}`}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={16} /> Last Update: {station.latest_ts ? new Date(station.latest_ts).toLocaleString() : 'Never'}
                                </span>
                            </div>
                        </div>
                        <div className="status-badge" style={{ background: '#ecfdf5', color: '#10b981', padding: '0.5rem 1rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, border: '1px solid #a7f3d0' }}>
                            <span className="pulse" style={{ background: '#10b981' }}></span>
                            Reporting Live
                        </div>
                    </div>
                </div>

                <div className="stat-group">
                    {activeMetrics.map(code => {
                        const latest = history.find(m => m.code === code);
                        return (latest && (
                            <div key={code} className="stat-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#000000', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {getIcon(code)} {getMetricFullName(code)}
                                </div>
                                <div className="stat-value" style={{ color: '#000000', fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                    {(latest.value !== null && latest.value !== undefined) ? latest.value.toFixed(2) : '--'}
                                    <span style={{ fontSize: '1rem', marginLeft: '0.5rem', color: '#000000', fontWeight: 'normal' }}>
                                        {latest.unit || ''}
                                    </span>
                                </div>
                            </div>
                        ));
                    })}
                </div>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))' }}>
                    {activeMetrics.map(code => {
                        const data = getChartData(code);
                        if (data.length === 0) return null;

                        return (
                            <div key={code} className="card station-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                                <h3 className="chart-title" style={{ color: '#000000', fontSize: '1.125rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {getIcon(code)} {getMetricFullName(code)}
                                </h3>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data}>
                                            <defs>
                                                <linearGradient id={`color${code}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                            <XAxis
                                                dataKey="time"
                                                stroke="#000000"
                                                fontSize={11}
                                                tickMargin={10}
                                            />
                                            <YAxis
                                                stroke="#000000"
                                                fontSize={11}
                                                domain={['auto', 'auto']}
                                            />
                                            <Tooltip
                                                contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#000000', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                labelStyle={{ color: '#000000', marginBottom: '4px', fontWeight: 500 }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#3b82f6"
                                                fillOpacity={1}
                                                fill={`url(#color${code})`}
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="card" style={{ marginTop: '2rem', background: '#ffffff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 className="chart-title" style={{ margin: 0, color: '#000000', fontSize: '1.25rem', fontWeight: 'bold' }}>Data Log</h3>
                        <button
                            onClick={() => {
                                const headers = ['Timestamp', 'Metric', 'Value', 'Unit'];
                                const rows = history.map(m => [
                                    new Date(m.measurement_ts).toLocaleString(),
                                    getMetricFullName(m.code),
                                    m.value,
                                    m.unit || ''
                                ]);
                                const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
                                const blob = new Blob([csvContent], { type: 'text/csv' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.setAttribute('hidden', '');
                                a.setAttribute('href', url);
                                a.setAttribute('download', `station_${id}_data.csv`);
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                            }}
                            style={{ padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e5e7eb', color: '#000000', background: '#f9fafb', fontWeight: 500 }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#f9fafb'}
                        >
                            Export CSV
                        </button>
                    </div>
                    <div className="data-table-container">
                        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#000000', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <th style={{ padding: '0.75rem 1rem' }}>Timestamp</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Metric</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Value</th>
                                    <th style={{ padding: '0.75rem 1rem' }}>Unit</th>
                                </tr>
                            </thead>
                            <tbody style={{ color: '#000000' }}>
                                {history.slice(0, 50).map((m, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '0.75rem 1rem' }}>{new Date(m.measurement_ts).toLocaleString()}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {getIcon(m.code)} {getMetricFullName(m.code)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{(m.value !== null && m.value !== undefined) ? m.value.toFixed(4) : '--'}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#000000' }}>{m.unit || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
