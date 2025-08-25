import React, { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Brush } from "recharts";
import { Waves, Thermometer, Wind, Droplets } from "lucide-react";

// Import the Excel file using the specified path
import seaDataFile from "@/assets/Hambanthota.xlsx";

interface DataRow {
  Time: string;
  Temperature: number;
  Pressure: number;
  "Sea pressure": number;
  Depth: number;
}

// A simple component for the summary cards
const SummaryCard = ({ title, value, icon, unit }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="p-3 mb-2 rounded-full bg-blue-100 text-blue-600">
      {icon}
    </div>
    <div className="text-center">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <span className="text-xs text-gray-400">{unit}</span>
    </div>
  </div>
);

export default function HistoricalDataPage() {
  const [rawData, setRawData] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExcel = async () => {
      try {
        const response = await fetch(seaDataFile);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[2];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const headerRowIndex = jsonData.findIndex(row => 
          Array.isArray(row) && row.includes('Time') && row.includes('Temperature')
        );

        if (headerRowIndex === -1) {
          throw new Error("Could not find expected headers in the Excel file.");
        }

        const headers = jsonData[headerRowIndex] as string[];
        const dataRows = jsonData.slice(headerRowIndex + 1);

        const parsedData: DataRow[] = dataRows
          .map((row: any[]) => {
            const rowData: { [key: string]: any } = {};
            headers.forEach((header, index) => {
              rowData[header] = row[index];
            });
            
            const time = rowData['Time'] ? String(rowData['Time']) : null;
            const temp = parseFloat(rowData['Temperature']);
            const pressure = parseFloat(rowData['Pressure']);
            const seaPressure = parseFloat(rowData['Sea pressure']);
            const depth = parseFloat(rowData['Depth']);

            if (!time || isNaN(temp) || isNaN(pressure) || isNaN(seaPressure) || isNaN(depth)) {
              return null;
            }
            
            return {
              Time: time,
              Temperature: temp,
              Pressure: pressure,
              "Sea pressure": seaPressure,
              Depth: depth,
            };
          })
          .filter(Boolean) as DataRow[];

        setRawData(parsedData);
      } catch (e) {
        console.error("Failed to fetch or parse Excel file:", e);
        setError("Failed to load data. Please ensure the file exists at the correct path.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExcel();
  }, []);

  // Use the entire dataset for the summary
  const summary = useMemo(() => {
    if (rawData.length === 0) return null;
    const temps = rawData.map(d => d.Temperature).filter(v => !isNaN(v));
    const pressures = rawData.map(d => d.Pressure).filter(v => !isNaN(v));
    const seaPressures = rawData.map(d => d["Sea pressure"]).filter(v => !isNaN(v));
    const depths = rawData.map(d => d.Depth).filter(v => !isNaN(v));

    const avg = (arr: number[]) => (arr.length > 0 ? (arr.reduce((sum, val) => sum + val, 0) / arr.length).toFixed(2) : "N/A");
    
    return {
      avgTemp: avg(temps),
      avgPressure: avg(pressures),
      avgSeaPressure: avg(seaPressures),
      avgDepth: avg(depths),
    };
  }, [rawData]);

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">
            Hambantota Historical Data
          </h1>
          <p className="mt-2 text-md text-gray-600">
            A simple overview of sea data trends with interactive zoom.
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 shadow-sm">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-96 bg-white rounded-xl shadow-lg">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : rawData.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg">
            No data available.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {summary && (
                <>
                  <SummaryCard title="Avg. Temperature" value={summary.avgTemp} unit="°C" icon={<Thermometer className="w-5 h-5" />} />
                  <SummaryCard title="Avg. Pressure" value={summary.avgPressure} unit="dbar" icon={<Wind className="w-5 h-5" />} />
                  <SummaryCard title="Avg. Sea Pressure" value={summary.avgSeaPressure} unit="dbar" icon={<Droplets className="w-5 h-5" />} />
                  <SummaryCard title="Avg. Depth" value={summary.avgDepth} unit="m" icon={<Waves className="w-5 h-5" />} />
                </>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
              <h2 className="text-xl font-bold text-blue-800 mb-4 border-b border-gray-200 pb-2">
                Historical Trends
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={rawData} syncId="any-unique-string" margin={{ top: 10, right: 30, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="Time" tick={{ fontSize: 10 }} />
                  <YAxis padding={{ top: 20 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold' }}
                    itemStyle={{ color: '#333' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line type="monotone" dataKey="Temperature" stroke="#ef4444" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="Pressure" stroke="#3b82f6" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="Sea pressure" stroke="#10b981" dot={false} strokeWidth={2} />
                  <Line type="monotone" dataKey="Depth" stroke="#8b5cf6" dot={false} strokeWidth={2} />
                  <Brush dataKey="Time" height={30} stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}