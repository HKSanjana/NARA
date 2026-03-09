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
            <div className="container">
                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/">
                        <a className="nav-link" style={{ width: 'fit-content', marginBottom: '1rem' }}>
                            <ChevronLeft size={20} />
                            <span>Back to Dashboard</span>
                        </a>
                    </Link>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <h1 className="title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{getStationDisplayName(station.name, station.station_id)}</h1>
                            <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)' }}>
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
                        <div className="status-badge">
                            <span className="pulse"></span>
                            Reporting Live
                        </div>
                    </div>
                </div>

                <div className="stat-group">
                    {activeMetrics.map(code => {
                        const latest = history.find(m => m.code === code);
                        return (latest && (
                            <div key={code} className="stat-card glass">
                                <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {getIcon(code)} {getMetricFullName(code)}
                                </div>
                                <div className="stat-value">
                                    {(latest.value !== null && latest.value !== undefined) ? latest.value.toFixed(2) : '--'}
                                    <span style={{ fontSize: '1rem', marginLeft: '0.5rem', color: 'var(--text-muted)' }}>
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
                            <div key={code} className="card glass station-card">
                                <h3 className="chart-title" style={{ color: '#fff' }}>
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
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                            <XAxis
                                                dataKey="time"
                                                stroke="#64748b"
                                                fontSize={11}
                                                tickMargin={10}
                                            />
                                            <YAxis
                                                stroke="#64748b"
                                                fontSize={11}
                                                domain={['auto', 'auto']}
                                            />
                                            <Tooltip
                                                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                                                labelStyle={{ color: '#fff', marginBottom: '4px' }}
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

                <div className="card glass" style={{ marginTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 className="chart-title" style={{ margin: 0, color: '#fff' }}>Data Log</h3>
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
                            className="glass"
                            style={{ padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--card-border)', color: '#fff' }}
                        >
                            Export CSV
                        </button>
                    </div>
                    <div className="data-table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Metric</th>
                                    <th>Value</th>
                                    <th>Unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.slice(0, 50).map((m, i) => (
                                    <tr key={i}>
                                        <td>{new Date(m.measurement_ts).toLocaleString()}</td>
                                        <td>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {getIcon(m.code)} {getMetricFullName(m.code)}
                                            </span>
                                        </td>
                                        <td>{(m.value !== null && m.value !== undefined) ? m.value.toFixed(4) : '--'}</td>
                                        <td>{m.unit || '-'}</td>
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
