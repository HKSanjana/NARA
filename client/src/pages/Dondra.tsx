import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';

// --- (Insert the 'environmentalData' array from Section 1 here) ---
const environmentalData = [
  { timestamp: '2023-11-01T00:00:00', Temperature: 28.8940, Salinity: 34.2548 },
  { timestamp: '2023-11-01T02:00:00', Temperature: 28.9029, Salinity: 34.2576 },
  { timestamp: '2023-11-01T04:00:00', Temperature: 28.8913, Salinity: 34.2517 },
  { timestamp: '2023-11-01T06:00:00', Temperature: 28.8924, Salinity: 34.2418 },
  { timestamp: '2023-11-01T08:00:00', Temperature: 29.1000, Salinity: 34.2464 },
  { timestamp: '2023-11-01T10:00:00', Temperature: 29.2978, Salinity: 34.2474 },
  { timestamp: '2023-11-01T12:00:00', Temperature: 29.3978, Salinity: 34.2274 },
  { timestamp: '2023-11-01T14:00:00', Temperature: 29.4978, Salinity: 34.2374 },
  { timestamp: '2023-11-01T16:00:00', Temperature: 29.2978, Salinity: 34.2474 },
  { timestamp: '2023-11-01T18:00:00', Temperature: 29.0978, Salinity: 34.2574 },
  { timestamp: '2023-11-01T20:00:00', Temperature: 28.9978, Salinity: 34.2674 },
  { timestamp: '2023-11-01T22:00:00', Temperature: 28.8978, Salinity: 34.2774 },
];
// ------------------------------------------------------------------

const EnvironmentalChart = () => {
  return (
    <div style={{ width: '100%', height: 450 }}>
      <h2>24-Hour Environmental Data: Temperature & Salinity (November 1, 2023)</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={environmentalData}
          margin={{ top: 10, right: 40, left: 10, bottom: 20 }}
        >
          {/* Grid lines */}
          <CartesianGrid strokeDasharray="3 3" />
          
          {/* X-Axis: Time */}
          <XAxis 
            dataKey="timestamp"
            tickFormatter={(value) => format(parseISO(value), 'HH:mm')}
            label={{ value: 'Time (24-hour)', position: 'bottom', offset: 0 }}
          />
          
          {/* Tooltip for hovering over data points */}
          <Tooltip />
          
          {/* Legend to identify the lines */}
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          {/* LEFT Y-Axis: Temperature_2 (°C) */}
          <YAxis
            yAxisId="temp"
            domain={['auto', 'auto']}
            dataKey="Temperature"
            stroke="#e74c3c" // Red color for temperature
            label={{ 
              value: 'Temperature (°C)', 
              angle: -90, 
              position: 'left',
              style: { fill: '#e74c3c' }
            }}
          />
          
          {/* RIGHT Y-Axis: Salinity_2 (PSU) */}
          <YAxis
            yAxisId="sal"
            orientation="right"
            domain={['auto', 'auto']}
            dataKey="Salinity"
            stroke="#3498db" // Blue color for salinity
            label={{ 
              value: 'Salinity (PSU)', 
              angle: 90, 
              position: 'right',
              style: { fill: '#3498db' }
            }}
          />
          
          {/* LINE 1: Temperature_2 */}
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="Temperature"
            stroke="#e74c3c"
            name="Temperature_2"
            dot={false}
            strokeWidth={2}
          />
          
          {/* LINE 2: Salinity_2 */}
          <Line
            yAxisId="sal"
            type="monotone"
            dataKey="Salinity"
            stroke="#3498db"
            name="Salinity_2"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EnvironmentalChart;