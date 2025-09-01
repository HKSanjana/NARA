import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define the data type for our chart
interface DataPoint {
  date: string;
  value: number;
}

// Sample data extracted from the Google Drive files.
const allData: DataPoint[] = [
  // Data for July 2025
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
  // Data for August 2025
  { date: '2025-08-01', value: 5 },
  { date: '2025-08-02', value: 15 },
  { date: '2025-08-03', value: -10 },
  { date: '2025-08-04', value: -25 },
  { date: '2025-08-05', value: -30 },
  { date: '2025-08-06', value: -15 },
  { date: '2025-08-07', value: -17 },
  { date: '2025-08-08', value: -22 },
  { date: '2025-08-09', value: -24 },
  { date: '2025-08-10', value: -15 },
  { date: '2025-08-11', value: -18 },
  { date: '2025-08-12', value: -20 },
  { date: '2025-08-13', value: -18 },
  { date: '2025-08-14', value: -19 },
  { date: '2025-08-15', value: -17 },
  { date: '2025-08-16', value: -12 },
];

// Filter data to exclude all entries from August
const julyData: DataPoint[] = allData.filter(d => !d.date.startsWith('2025-08'));

const DataVisualization: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Data Visualization (Excluding August)</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={julyData}
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