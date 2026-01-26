import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wind, Thermometer, Droplets, Activity, CloudRain, Waves, Shield } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface StationSummary {
    station_id: string;
    name: string;
    AT?: number;
    WL?: number;
    HU?: number;
    RN?: number;
    BP?: number;
    WI?: number;
    WT?: number;
}

const METRICS = [
    { code: 'AT', name: 'Air Temperature', unit: '°C', icon: Thermometer, color: '#f87171' },
    { code: 'WL', name: 'Water Level', unit: 'm', icon: Waves, color: '#60a5fa' },
    { code: 'HU', name: 'Humidity', unit: '%', icon: Droplets, color: '#22d3ee' },
    { code: 'RN', name: 'Rainfall', unit: 'mm', icon: CloudRain, color: '#818cf8' },
    { code: 'BP', name: 'Pressure', unit: 'hPa', icon: Shield, color: '#fbbf24' },
    { code: 'WI', name: 'Wind Speed', unit: 'm/s', icon: Wind, color: '#94a3b8' },
    { code: 'WT', name: 'Water Temp', unit: '°C', icon: Thermometer, color: '#38bdf8' },
];

export default function AnalysisPage() {
    const [stations, setStations] = useState<StationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState(METRICS[1]); // Default to WL

    useEffect(() => {
        fetch('/api/dashboard')
            .then(async res => {
                const data = await res.json();
                if (res.ok && Array.isArray(data)) {
                    setStations(data);
                } else {
                    console.error('Invalid analysis data:', data);
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

    const chartData = stations
        .filter(s => (s as any)[selectedMetric.code] !== undefined)
        .map(s => ({
            name: s.name || 'Unnamed',
            value: (s as any)[selectedMetric.code],
        }))
        .sort((a, b) => b.value - a.value);

    if (loading) return <div className="loader"></div>;

    const MetricIcon = selectedMetric.icon;

    return (
        <DashboardLayout>
            <div className="container">
                <header className="header" style={{ border: 'none' }}>
                    <div>
                        <h1 className="title">Comparative Analysis</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Compare metrics across all reporting stations</p>
                    </div>
                </header>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {METRICS.map(m => (
                        <button
                            key={m.code}
                            onClick={() => setSelectedMetric(m)}
                            className={`glass ${selectedMetric.code === m.code ? 'active' : ''}`}
                            style={{
                                padding: '1rem 2rem',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                cursor: 'pointer',
                                border: selectedMetric.code === m.code ? `1px solid ${m.color}` : '1px solid var(--card-border)',
                                background: selectedMetric.code === m.code ? `${m.color}15` : 'rgba(30, 41, 59, 0.5)',
                                color: selectedMetric.code === m.code ? m.color : 'white',
                                transition: 'all 0.2s'
                            }}
                        >
                            <m.icon size={20} />
                            <span style={{ fontWeight: 600 }}>{m.name}</span>
                        </button>
                    ))}
                </div>

                <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
                    <div className="card glass">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 className="chart-title">
                                <MetricIcon size={24} style={{ color: selectedMetric.color }} />
                                Spatial Distribution: {selectedMetric.name} ({selectedMetric.unit})
                            </h3>
                            <div className="timestamp">Showing {chartData.length} stations</div>
                        </div>

                        <div className="chart-container" style={{ height: '500px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                    <XAxis type="number" stroke="#64748b" fontSize={12} />
                                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={150} />
                                    <Tooltip
                                        contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={selectedMetric.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="card glass">
                        <h3 className="chart-title">Ranked Data Table</h3>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Station Name</th>
                                        <th>Value</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chartData.map((d, i) => (
                                        <tr key={i}>
                                            <td>#{i + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{d.name || 'Unnamed Station'}</td>
                                            <td style={{ color: selectedMetric.color, fontWeight: 700, fontSize: '1.1rem' }}>
                                                {(d.value !== null && d.value !== undefined) ? d.value.toFixed(2) : '--'} {selectedMetric.unit}
                                            </td>
                                            <td>
                                                <div className="status-badge">Normal</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
