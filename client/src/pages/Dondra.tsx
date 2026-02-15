import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { format, parseISO } from "date-fns";

const environmentalData = [
  { timestamp: "2023-11-01T00:00:00", Temperature: 28.894, Salinity: 34.2548 },
  { timestamp: "2023-11-01T02:00:00", Temperature: 28.9029, Salinity: 34.2576 },
  { timestamp: "2023-11-01T04:00:00", Temperature: 28.8913, Salinity: 34.2517 },
  { timestamp: "2023-11-01T06:00:00", Temperature: 28.8924, Salinity: 34.2418 },
  { timestamp: "2023-11-01T08:00:00", Temperature: 29.1, Salinity: 34.2464 },
  { timestamp: "2023-11-01T10:00:00", Temperature: 29.2978, Salinity: 34.2474 },
  { timestamp: "2023-11-01T12:00:00", Temperature: 29.3978, Salinity: 34.2274 },
  { timestamp: "2023-11-01T14:00:00", Temperature: 29.4978, Salinity: 34.2374 },
  { timestamp: "2023-11-01T16:00:00", Temperature: 29.2978, Salinity: 34.2474 },
  { timestamp: "2023-11-01T18:00:00", Temperature: 29.0978, Salinity: 34.2574 },
  { timestamp: "2023-11-01T20:00:00", Temperature: 28.9978, Salinity: 34.2674 },
  { timestamp: "2023-11-01T22:00:00", Temperature: 28.8978, Salinity: 34.2774 }
];

const EnvironmentalDashboard = () => {
  const [showTemp, setShowTemp] = useState(true);
  const [showSal, setShowSal] = useState(true);
  const [selectedRange, setSelectedRange] = useState("1D"); // UI only, graph won't change
  const rangesMs: Record<string, number> = {
    "1H": 1 * 60 * 60 * 1000,
    "1D": 24 * 60 * 60 * 1000,
    "7D": 7 * 24 * 60 * 60 * 1000,
    "14D": 14 * 24 * 60 * 60 * 1000,
    "30D": 30 * 24 * 60 * 60 * 1000
  };

  // Filter data according to selectedRange (relative to latest datapoint)
  const filteredData = useMemo(() => {
    if (!environmentalData || environmentalData.length === 0) return [];
    const latestTs = parseISO(environmentalData[environmentalData.length - 1].timestamp).getTime();
    const ms = rangesMs[selectedRange] ?? rangesMs["1D"];
    const threshold = latestTs - ms;
    return environmentalData.filter(d => parseISO(d.timestamp).getTime() >= threshold);
  }, [selectedRange]);

  // Stats for currently-displayed data
  const stats = useMemo(() => {
    const data = filteredData.length ? filteredData : environmentalData;
    const temps = data.map(d => d.Temperature);
    const sal = data.map(d => d.Salinity);
    const latest = data[data.length - 1];
    const previous = data[data.length - 2] ?? latest;

    const percentageChange = (current, previous) =>
      (((current - previous) / previous) * 100).toFixed(2);

    return {
      avgTemp: (temps.reduce((a,b)=>a+b,0)/temps.length).toFixed(2),
      avgSal: (sal.reduce((a,b)=>a+b,0)/sal.length).toFixed(2),
      tempChange: percentageChange(latest.Temperature, previous.Temperature),
      salChange: percentageChange(latest.Salinity, previous.Salinity)
    };
  }, [filteredData]);

  return (
    <div style={styles.page}>
      <h2 style={styles.header}>🌊 Dondra Station – Sea Level Dashboard</h2>

      {/* RANGE SELECTOR: UI only */}
      <div style={styles.rangeSelector}>
        {["1H", "1D", "7D", "14D", "30D"].map(r => (
          <button
            key={r}
            onClick={() => setSelectedRange(r)}
            style={{
              ...styles.rangeButton,
              backgroundColor: selectedRange === r ? "#1890ff" : "transparent",
              color: "#fff",
              boxShadow: selectedRange === r ? "0 0 12px rgba(24,144,255,0.8)" : "none"
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* CHECKBOXES */}
      <div style={styles.checkboxContainer}>
        <label style={styles.checkboxLabel}>
          <input type="checkbox" checked={showTemp} onChange={() => setShowTemp(!showTemp)} /> Temperature
        </label>
        <label style={styles.checkboxLabel}>
          <input type="checkbox" checked={showSal} onChange={() => setShowSal(!showSal)} /> Salinity
        </label>
      </div>

      {/* Stats cards */}
      <div style={styles.percentageContainer}>
        {showTemp && (
          <div style={styles.percentCard}>
            <h4>Temperature Change</h4>
            <p style={{ color: stats.tempChange >= 0 ? "#ff4d4f" : "#52c41a", fontSize: 22, fontWeight: "bold" }}>
              {stats.tempChange}% {stats.tempChange >= 0 ? "↑" : "↓"}
            </p>
          </div>
        )}
        {showSal && (
          <div style={styles.percentCard}>
            <h4>Salinity Change</h4>
            <p style={{ color: stats.salChange >= 0 ? "#1890ff" : "#52c41a", fontSize: 22, fontWeight: "bold" }}>
              {stats.salChange}% {stats.salChange >= 0 ? "↑" : "↓"}
            </p>
          </div>
        )}
        {showTemp && (
          <div style={styles.percentCard}>
            <h4>Average Temperature</h4>
            <p style={{ fontSize: 20, fontWeight: "bold" }}>{stats.avgTemp} °C</p>
          </div>
        )}
        {showSal && (
          <div style={styles.percentCard}>
            <h4>Average Salinity</h4>
            <p style={{ fontSize: 20, fontWeight: "bold" }}>{stats.avgSal} PSU</p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={styles.chartCard}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={filteredData} // show filtered dataset based on range selector
            margin={{ top: 20, right: 40, left: 10, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />

            {/* X-axis: always shows time */}
            <XAxis
              dataKey="timestamp"
              tickFormatter={value => format(parseISO(value), "HH:mm")}
              tick={{ fill: "#000" }}
              interval={0}
              angle={-30}
              textAnchor="end"
              height={60}
              label={{ value: "Time (local)", position: "insideBottom", dy: 30, fill: "#000" }}
            />

            {showTemp && <YAxis yAxisId="temp" domain={[28.5,30]} stroke="#ff4d4f" label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft", fill: "#ff4d4f" }} />}
            {showSal && <YAxis yAxisId="sal" orientation="right" domain={[34.2,34.3]} stroke="#1890ff" label={{ value: "Salinity (PSU)", angle: 90, position: "insideRight", fill: "#1890ff" }} />}

            <Tooltip labelFormatter={label => format(parseISO(label), "HH:mm")} contentStyle={{ backgroundColor: "#1f2937", color: "#fff", borderRadius: 8 }} />
            <Legend />

            {showTemp && <Line yAxisId="temp" type="monotone" dataKey="Temperature" stroke="#ff4d4f" strokeWidth={3} dot={false} />}
            {showSal && <Line yAxisId="sal" type="monotone" dataKey="Salinity" stroke="#1890ff" strokeWidth={3} dot={false} />}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const styles = {
  page: { padding: 30, background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)", minHeight: "100vh", color: "#fff", fontFamily: "Segoe UI" },
  header: { textAlign: "center", marginBottom: 20, fontSize: 28, fontWeight: "bold" },
  rangeSelector: { display: "flex", justifyContent: "center", gap: 12, marginBottom: 20 },
  rangeButton: { padding: "8px 20px", borderRadius: 30, border: "2px solid rgba(255,255,255,0.5)", cursor: "pointer", fontWeight: 600, background: "rgba(255,255,255,0.1)", color: "#fff", backdropFilter: "blur(6px)", transition: "all 0.3s ease" },
  checkboxContainer: { display: "flex", justifyContent: "center", gap: 20, marginBottom: 20 },
  checkboxLabel: { fontSize: 16, fontWeight: "bold", cursor: "pointer" },
  percentageContainer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 30 },
  percentCard: { background: "rgba(255,255,255,0.1)", padding: 20, borderRadius: 15, textAlign: "center", backdropFilter: "blur(6px)", boxShadow: "0 5px 15px rgba(0,0,0,0.3)" },
  chartCard: { background: "#fff", padding: 20, borderRadius: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }
};

export default EnvironmentalDashboard;
