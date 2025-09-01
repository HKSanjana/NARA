import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataPoint {
  date: string;
  value: number;
}

// TODO: Replace this with your actual data from the provided Google Drive files.
// For example, fetch and parse the data from your backend.
const yourRawData: DataPoint[] = [
  // Example for Mirissa data (from files like WS0629.dat)
  // The first number is the date (e.g., 20250629), followed by hourly data.
  // The code below assumes you have processed this raw data into the DataPoint format.
  // e.g., { date: '2025-06-29 00:00', value: 12.5 }, { date: '2025-06-29 01:00', value: 13.1 }, ...
  
  // As a placeholder, this uses the previous example data.
  { date: '2025-07-01', value: 15 },
  { date: '2025-07-02', value: -10 },
  { date: '2025-07-03', value: -20 },
  { date: '2025-07-04', value: -12 },
  { date: '2025-07-05', value: 8 },
  { date: '2025-07-06', value: 12 },
  { date: '2025-07-07', value: -5 },
  { date: '2025-07-08', value: 18 },
  { date: '2025-07-09', value: -15 },
  { date: '2025-07-10', value: 2 },
  { date: '2025-07-11', value: -3 },
  { date: '2025-07-12', value: 0 },
  { date: '2025-07-13', value: 5 },
  { date: '2025-07-14', value: 7 },
  { date: '2025-07-15', value: 10 },
  { date: '2025-07-16', value: -4 },
  { date: '2025-07-17', value: 1 },
  { date: '2025-07-18', value: -8 },
  { date: '2025-07-19', value: -14 },
  { date: '2025-07-20', value: 11 },
  { date: '2025-07-21', value: -17 },
  { date: '2025-07-22', value: -30 },
  { date: '2025-07-23', value: 14 },
  { date: '2025-07-24', value: -20 },
  { date: '2025-07-25', value: -25 },
  { date: '2025-07-26', value: -18 },
  { date: '2025-07-27', value: -19 },
  { date: '2025-07-28', value: -12 },
  { date: '2025-07-29', value: -33 },
  { date: '2025-07-30', value: -29 },
  { date: '2025-07-31', value: -18 },
  { date: '2025-08-01', value: 5 },
  { date: '2025-08-02', value: 15 },
];

const getFilteredData = (timeframe: number): DataPoint[] => {
  if (yourRawData.length === 0) return [];
  const latestDate = new Date(yourRawData[yourRawData.length - 1].date);
  const startDate = new Date(latestDate);
  startDate.setDate(latestDate.getDate() - timeframe);

  return yourRawData.filter(d => {
    const dataDate = new Date(d.date);
    return dataDate >= startDate && dataDate <= latestDate;
  });
};

const DataVisualization: React.FC = () => {
  const [timeframe, setTimeframe] = useState<number>(30); // Default to 30 days
  const data = getFilteredData(timeframe);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Data Visualization</h2>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setTimeframe(1)} style={{ marginRight: '10px' }}>1 Day</button>
        <button onClick={() => setTimeframe(14)} style={{ marginRight: '10px' }}>14 Days</button>
        <button onClick={() => setTimeframe(30)}>30 Days</button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataVisualization;