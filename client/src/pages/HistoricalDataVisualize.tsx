import React, { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Brush } from "recharts";
import { Waves, Thermometer, Wind, Droplets } from "lucide-react";

interface DataRow {
  Time: string;
  Temperature: number;
  Pressure: number;
  "Sea pressure": number;
  Depth: number;
}

const SummaryCard = ({ title, value, icon, unit }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-lg border border-gray-200 hover:scale-105 transform transition">
    <div className="p-3 mb-2 rounded-full bg-blue-100 text-blue-600">{icon}</div>
    <div className="text-center">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <span className="text-xs text-gray-400">{unit}</span>
    </div>
  </div>
);

export default function HambanthotaDashboard() {
  const [rawData, setRawData] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParams, setSelectedParams] = useState({
    Temperature: true,
    Pressure: true,
    "Sea pressure": true,
    Depth: true
  });
  const [selectedRange, setSelectedRange] = useState("1D");

  // Read uploaded Excel
  useEffect(() => {
    const fetchExcel = async () => {
      try {
        const arrayBuffer = await fetch("/mnt/data/2ac9ee33-c4a4-40fa-a1ee-21ffc672357a.xlsx").then(res => res.arrayBuffer());
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        // Assuming first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

        const parsedData: DataRow[] = (jsonData as any[]).map(row => ({
          Time: row["Time"],
          Temperature: parseFloat(row["Temperature"]),
          Pressure: parseFloat(row["Pressure"]),
          "Sea pressure": parseFloat(row["Sea pressure"]),
          Depth: parseFloat(row["Depth"]),
        })).filter(d => d.Time && !isNaN(d.Temperature) && !isNaN(d.Pressure) && !isNaN(d["Sea pressure"]) && !isNaN(d.Depth));

        setRawData(parsedData);
      } catch (e) {
        console.error(e);
        setError("Failed to load Excel data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchExcel();
  }, []);

  // Filter data by range
  const filteredData = useMemo(() => {
    if (!rawData.length) return [];
    const now = new Date(rawData[rawData.length - 1].Time);
    let days = 1;
    if (selectedRange === "7D") days = 7;
    if (selectedRange === "14D") days = 14;
    if (selectedRange === "30D") days = 30;

    return rawData.filter(d => {
      const t = new Date(d.Time);
      return t >= new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    });
  }, [rawData, selectedRange]);

  // Summary
  const summary = useMemo(() => {
    if (!rawData.length) return null;
    const avg = (arr: number[]) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : "N/A";
    return {
      avgTemp: avg(rawData.map(d => d.Temperature)),
      avgPressure: avg(rawData.map(d => d.Pressure)),
      avgSeaPressure: avg(rawData.map(d => d["Sea pressure"])),
      avgDepth: avg(rawData.map(d => d.Depth))
    };
  }, [rawData]);

  const toggleParam = (param: string) => setSelectedParams(prev => ({ ...prev, [param]: !prev[param] }));

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-blue-900">Hambanthota Sea Level Dashboard</h1>
        <p className="text-gray-600">Interactive trends of sea parameters.</p>
      </header>

      {error && <div className="text-red-600 text-center mb-6">{error}</div>}
      {isLoading ? <div className="flex justify-center items-center h-96">Loading...</div> : (
        <>
          {/* Range selector */}
          <div className="flex justify-center gap-3 mb-6">
            {["1D", "7D", "14D", "30D"].map(r => (
              <button key={r} onClick={() => setSelectedRange(r)}
                className={`px-4 py-2 rounded-full font-semibold ${selectedRange === r ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}>{r}</button>
            ))}
          </div>

          {/* Checkboxes */}
          <div className="flex justify-center gap-6 mb-6">
            {Object.keys(selectedParams).map(p => (
              <label key={p} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={selectedParams[p]} onChange={() => toggleParam(p)} className="w-4 h-4" />
                <span className="text-gray-700 font-medium">{p}</span>
              </label>
            ))}
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summary && <>
              <SummaryCard title="Avg Temperature" value={summary.avgTemp} unit="°C" icon={<Thermometer className="w-5 h-5" />} />
              <SummaryCard title="Avg Pressure" value={summary.avgPressure} unit="dbar" icon={<Wind className="w-5 h-5" />} />
              <SummaryCard title="Avg Sea Pressure" value={summary.avgSeaPressure} unit="dbar" icon={<Droplets className="w-5 h-5" />} />
              <SummaryCard title="Avg Depth" value={summary.avgDepth} unit="m" icon={<Waves className="w-5 h-5" />} />
            </>}
          </div>

          {/* Unified chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-blue-800 mb-4 border-b border-gray-200 pb-2">Sea Parameters Trends</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filteredData} margin={{ top: 10, right: 30, left: -10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Time" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedParams.Temperature && <Line type="monotone" dataKey="Temperature" stroke="#ef4444" dot={false} strokeWidth={2} />}
                {selectedParams.Pressure && <Line type="monotone" dataKey="Pressure" stroke="#3b82f6" dot={false} strokeWidth={2} />}
                {selectedParams["Sea pressure"] && <Line type="monotone" dataKey="Sea pressure" stroke="#10b981" dot={false} strokeWidth={2} />}
                {selectedParams.Depth && <Line type="monotone" dataKey="Depth" stroke="#8b5cf6" dot={false} strokeWidth={2} />}
                <Brush dataKey="Time" height={30} stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
