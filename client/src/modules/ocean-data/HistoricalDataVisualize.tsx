import React, { useEffect, useState, useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Brush } from "recharts";
import { Waves, Thermometer, Wind, Droplets } from "lucide-react";
import { api } from "@/lib/api";

interface DataRow {
  Time: string;
  Temperature: number;
  Pressure: number;
  "Water Level": number;
}

const SummaryCard = ({ title, value, icon, unit }: any) => (
  <div className="flex flex-col items-center justify-center p-4 bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 hover:scale-105 transform transition text-white">
    <div className="p-3 mb-2 rounded-full bg-blue-500/20 text-blue-400">{icon}</div>
    <div className="text-center">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className="text-xl font-bold">{value}</p>
      <span className="text-xs text-gray-500">{unit}</span>
    </div>
  </div>
);

export default function HambanthotaDashboard() {
  const [rawData, setRawData] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParams, setSelectedParams] = useState<Record<string, boolean>>({
    Temperature: true,
    Pressure: true,
    "Water Level": true,
  });
  const [selectedRange, setSelectedRange] = useState("1D");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const stationId = "Hambanthota";
        const [tempData, pressData, wlData] = await Promise.all([
          api.getHistoricalSeries(stationId, "AT", 500),
          api.getHistoricalSeries(stationId, "BP", 500),
          api.getHistoricalSeries(stationId, "WL", 500),
        ]);

        // Merge datasets by timestamp
        const merged: Record<string, DataRow> = {};

        const process = (data: any[], key: keyof DataRow) => {
          data.forEach(item => {
            const ts = new Date(item.measurement_ts).toISOString();
            if (!merged[ts]) {
              merged[ts] = { Time: ts, Temperature: 0, Pressure: 0, "Water Level": 0 };
            }
            (merged[ts] as any)[key] = parseFloat(item.value);
          });
        };

        process(tempData, "Temperature");
        process(pressData, "Pressure");
        process(wlData, "Water Level");

        const sortedData = Object.values(merged).sort((a, b) =>
          new Date(a.Time).getTime() - new Date(b.Time).getTime()
        );

        setRawData(sortedData);
      } catch (e) {
        console.error(e);
        setError("Failed to load real-time data from database.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!rawData.length) return [];
    const latest = new Date(rawData[rawData.length - 1].Time).getTime();
    let days = 1;
    if (selectedRange === "7D") days = 7;
    if (selectedRange === "14D") days = 14;
    if (selectedRange === "30D") days = 30;

    const cutoff = latest - days * 24 * 60 * 60 * 1000;
    return rawData.filter(d => new Date(d.Time).getTime() >= cutoff);
  }, [rawData, selectedRange]);

  const summary = useMemo(() => {
    if (!rawData.length) return null;
    const avg = (arr: number[]) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : "N/A";
    return {
      avgTemp: avg(rawData.map(d => d.Temperature).filter(v => v !== 0)),
      avgPressure: avg(rawData.map(d => d.Pressure).filter(v => v !== 0)),
      avgWL: avg(rawData.map(d => d["Water Level"]).filter(v => v !== 0)),
    };
  }, [rawData]);

  const toggleParam = (param: string) => setSelectedParams(prev => ({ ...prev, [param]: !prev[param] }));

  return (
    <div className="min-h-screen bg-[#0f172a] p-8 text-white">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-blue-400">Hambantota Station Analytics</h1>
        <p className="text-gray-400">Live data insights directly from NeonDB.</p>
      </header>

      {error && <div className="text-red-400 text-center mb-6 bg-red-900/20 p-4 rounded-lg">{error}</div>}

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-96 gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-400 animate-pulse">Querying NeonDB...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-center gap-3 mb-6">
            {["1D", "7D", "14D", "30D"].map(r => (
              <button key={r} onClick={() => setSelectedRange(r)}
                className={`px-4 py-2 rounded-full font-semibold transition ${selectedRange === r ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}>{r}</button>
            ))}
          </div>

          <div className="flex justify-center gap-6 mb-6">
            {Object.keys(selectedParams).map(p => (
              <label key={p} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={selectedParams[p]} onChange={() => toggleParam(p)} className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600" />
                <span className="text-gray-400 group-hover:text-white transition font-medium">{p}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {summary && <>
              <SummaryCard title="Avg Air Temperature" value={summary.avgTemp} unit="°C" icon={<Thermometer className="w-5 h-5" />} />
              <SummaryCard title="Avg Barometric Pressure" value={summary.avgPressure} unit="hPa" icon={<Wind className="w-5 h-5" />} />
              <SummaryCard title="Avg Water Level" value={summary.avgWL} unit="m" icon={<Waves className="w-5 h-5" />} />
            </>}
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Real-Time Trends
            </h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis
                    dataKey="Time"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc' }}
                    labelFormatter={(label) => new Date(label).toLocaleString()}
                  />
                  <Legend iconType="circle" />
                  {selectedParams.Temperature && <Line type="monotone" dataKey="Temperature" name="Air Temp (°C)" stroke="#fb7185" strokeWidth={3} dot={false} animationDuration={1500} />}
                  {selectedParams.Pressure && <Line type="monotone" dataKey="Pressure" name="Pressure (hPa)" stroke="#60a5fa" strokeWidth={3} dot={false} animationDuration={1500} />}
                  {selectedParams["Water Level"] && <Line type="monotone" dataKey="Water Level" name="Water Level (m)" stroke="#34d399" strokeWidth={3} dot={false} animationDuration={1500} />}
                  <Brush dataKey="Time" height={40} stroke="#3b82f6" fill="#1e293b" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
