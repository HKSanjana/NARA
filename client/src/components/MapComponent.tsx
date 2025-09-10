import React, { useState, useEffect, useMemo } from "react";
import { Waves, TrendingUp, MapPin, Calendar, Thermometer, Wind, Droplets, RefreshCw } from "lucide-react";
import myImage1 from '@/assets/new5.jpg';

// Define types for the real tide data
interface TideData {
  time: string;
  bat: string;
  prs: string;
  ra2: string;
  rad: string;
  sw1: string;
  sw2: string;
  enc: string;
}

interface ChartDataPoint {
  time: string;
  seaLevel: number;
  pressure: number;
  battery: number;
}

export default function SeaLevelMonitor() {
  const [selectedStation, setSelectedStation] = useState("colo");
  const [selectedPeriod, setSelectedPeriod] = useState("1hr");
  const [tideData, setTideData] = useState<TideData[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Available monitoring stations
  const stations = [
    { id: "colo", name: "Colombo Port", location: "Colombo", lat: "6.9344", lon: "79.8428", code: "colo" },
    //{ id: "Jaffna", name: "Jaffna", location: "Jaffna", lat: "6.0367", lon: "80.2170", code: "jaff" },
    { id: "trin", name: "Trincomalee ", location: "Trincomalee", lat: "8.5874", lon: "81.2152", code: "trin" },
    //{ id: "Mirissa", name: "Mirissa", location: "Mirissa", lat: "6.1240", lon: "81.1185", code: "miri" },
  ];
  
  // Define periods and their corresponding API codes
  const periods = [
    { id: "1hr", name: "Last 1 Hour", code: "0.5", chartPoints: 12 },
    { id: "day", name: "Last Day", code: "1", chartPoints: 48 },
    { id: "7days", name: "Last 7 Days", code: "7", chartPoints: 84 },
    { id: "14days", name: "Last 14 Days", code: "14", chartPoints: 84 },
    { id: "month", name: "Last 30 Days", code: "30", chartPoints: 120 },
  ];

  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  
  const fetchRealTideData = async (stationCode: string, periodCode: string) => {
    setIsLoading(true);
    try {
      const targetUrl = `https://www.ioc-sealevelmonitoring.org/bgraph.php?code=${stationCode}&output=tab&period=${periodCode}`;
      const response = await fetch(proxyUrl + targetUrl);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      
      const headers = Array.from(doc.querySelectorAll('table tr th, table tr td.field'))
        .map(el => el.textContent?.trim().toLowerCase() || '');
      
      const timeIndex = 0;
      const batIndex = headers.findIndex(h => h.includes('bat'));
      const prsIndex = headers.findIndex(h => h.includes('prs'));
      const encIndex = headers.findIndex(h => h.includes('enc'));
      const ra2Index = headers.findIndex(h => h.includes('ra2'));
      const radIndex = headers.findIndex(h => h.includes('rad'));
      const sw1Index = headers.findIndex(h => h.includes('sw1'));
      const sw2Index = headers.findIndex(h => h.includes('sw2'));
      
      const rows = doc.querySelectorAll('table tr');
      const extractedData: TideData[] = [];
      
      for (let i = 2; i < rows.length; i++) {
        const cells = rows[i].querySelectorAll('td');
        if (cells.length >= 2) {
          const timeText = cells[timeIndex]?.textContent || '';
          
          const dataPoint: TideData = {
            time: timeText, bat: '', prs: '', ra2: '', rad: '', sw1: '', sw2: '', enc: ''
          };
          
          if (batIndex > 0 && cells[batIndex]) dataPoint.bat = cells[batIndex].textContent?.trim() || '';
          if (prsIndex > 0 && cells[prsIndex]) dataPoint.prs = cells[prsIndex].textContent?.trim() || '';
          if (encIndex > 0 && cells[encIndex]) dataPoint.enc = cells[encIndex].textContent?.trim() || '';
          if (ra2Index > 0 && cells[ra2Index]) dataPoint.ra2 = cells[ra2Index].textContent?.trim() || '';
          if (radIndex > 0 && cells[radIndex]) dataPoint.rad = cells[radIndex].textContent?.trim() || '';
          if (sw1Index > 0 && cells[sw1Index]) dataPoint.sw1 = cells[sw1Index].textContent?.trim() || '';
          if (sw2Index > 0 && cells[sw2Index]) dataPoint.sw2 = cells[sw2Index].textContent?.trim() || '';
          
          extractedData.push(dataPoint);
        }
      }
      
      setTideData(extractedData.filter(d => d.time.trim() !== ''));
      
      const chartPoints: ChartDataPoint[] = extractedData
        .filter(d => (d.prs && d.prs !== '' && !isNaN(parseFloat(d.prs))) || (d.enc && d.enc !== '' && !isNaN(parseFloat(d.enc))))
        .map(d => {
          const seaLevelValue = d.prs && d.prs !== '' ? parseFloat(d.prs) : (d.enc && d.enc !== '' ? parseFloat(d.enc) : 0);
          const pressureValue = d.ra2 && d.ra2 !== '' ? parseFloat(d.ra2) : 0;
          const batteryValue = d.bat && d.bat !== '' ? parseFloat(d.bat) : 0;
          
          return {
            time: d.time,
            seaLevel: seaLevelValue,
            pressure: pressureValue,
            battery: batteryValue
          };
        });
      
      setChartData(chartPoints);
      setLastUpdated(new Date().toLocaleString());
      
    } catch (error) {
      console.error("Error fetching real tide data:", error);
      setTideData([]);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Get station from URL parameters
    const params = new URLSearchParams(window.location.search);
    const stationParam = params.get('station');
    
    // Set the station if it exists in our stations array
    if (stationParam && stations.some(s => s.id === stationParam)) {
      setSelectedStation(stationParam);
    }

    const station = stations.find(s => s.id === (stationParam || selectedStation));
    const period = periods.find(p => p.id === selectedPeriod);
    if (station && period) {
      fetchRealTideData(station.code, period.code);
    }
  }, [selectedStation, selectedPeriod]);

  const currentConditions = useMemo(() => {
    if (tideData.length === 0) return null;
    const latest = tideData.reverse()[0];
    tideData.reverse(); // Reverse back to original order
    
    let prsValue;
    if (latest.prs && latest.prs !== '' && !isNaN(parseFloat(latest.prs))) {
      prsValue = parseFloat(latest.prs);
    } else if (latest.enc && latest.enc !== '' && !isNaN(parseFloat(latest.enc))) {
      prsValue = parseFloat(latest.enc);
    } else {
      return null;
    }
    
    let trend = 'stable';
    if (tideData.length > 3) {
      const recent = tideData.slice(-4).map(d => {
        if (d.prs && !isNaN(parseFloat(d.prs))) return parseFloat(d.prs);
        else if (d.enc && !isNaN(parseFloat(d.enc))) return parseFloat(d.enc);
        return NaN;
      }).filter(v => !isNaN(v));
      
      if (recent.length >= 3) {
        const avgRecent = (recent[recent.length-1] + recent[recent.length-2]) / 2;
        const avgPrevious = (recent[0] + recent[1]) / 2;
        
        if (avgRecent > avgPrevious + 0.005) trend = 'rising';
        else if (avgRecent < avgPrevious - 0.005) trend = 'falling';
      }
    }
    
    const pressureData = latest.ra2 && latest.ra2 !== '' ? `${parseFloat(latest.ra2).toFixed(1)} hPa` : 'N/A';
    const radarData = latest.rad && latest.rad !== '' ? `${parseFloat(latest.rad).toFixed(2)}m` : latest.enc && latest.enc !== '' ? `${parseFloat(latest.enc).toFixed(2)}m` : 'N/A';
    
    return {
      seaLevel: `${prsValue.toFixed(2)}m`,
      trend,
      pressure: pressureData,
      battery: latest.bat && latest.bat !== '' ? `${parseFloat(latest.bat).toFixed(1)}V` : 'N/A',
      radar1: radarData,
      lastReading: latest.time
    };
  }, [tideData]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'falling': return <TrendingUp className="w-4 h-4 text-blue-500 transform rotate-180" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising': return 'text-red-600';
      case 'falling': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
      className="relative bg-cover bg-center py-16"
      style={{ backgroundImage: `url(${myImage1})` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
  <h1
    className="text-4xl lg:text-5xl font-bold mb-6 text-white"
    style={{
      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    }}
  >
    Real-Time Sea Level Monitoring
  </h1>
  <p
    className="text-xl max-w-3xl mx-auto text-white"
    style={{
      textShadow: "1px 1px 3px rgba(0,0,0,0.7)",
    }}
  >
    Live data from IOC Sea Level Monitoring stations around Sri Lanka's coastline
  </p>
</div>

      </section>


      {/* Controls Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div className="w-64">
                <select 
                  value={selectedStation} 
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-48">
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {periods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <button 
                onClick={() => {
                  const station = stations.find(s => s.id === selectedStation);
                  const period = periods.find(p => p.id === selectedPeriod);
                  if (station && period) fetchRealTideData(station.code, period.code);
                }}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
              <a 
                href="http://localhost:5000/hdVisualize"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View Historical Data
              </a>
            </div>
            <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </section>

      {/* Current Conditions */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-8">Current Conditions</h2>
          
          {currentConditions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Main Station Data */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {stations.find(s => s.id === selectedStation)?.name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Live Station Data
                    </p>
                  </div>
                  {getTrendIcon(currentConditions.trend)}
                </div>
                
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-900">{currentConditions.seaLevel}</div>
                    <div className="text-sm text-gray-600">Sea Level (prs)</div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${getTrendColor(currentConditions.trend)}`}>
                        {currentConditions.trend.charAt(0).toUpperCase() + currentConditions.trend.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">{currentConditions.lastReading}</span>
                    </div>
                  </div>
              </div>
              </div>

              {/* Environmental Data */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Environmental Data</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pressure (ra2):</span>
                    <span className="font-medium">{currentConditions.pressure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Radar (rad):</span>
                    <span className="font-medium">{currentConditions.radar1}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Battery:</span>
                    <span className="font-medium">{currentConditions.battery}</span>
                  </div>
                </div>
              </div>

              {/* Data Status */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Data Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Readings:</span>
                    <span className="font-medium">{tideData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valid Data Points:</span>
                    <span className="font-medium">{chartData.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Update:</span>
                    <span className="font-medium text-sm">{lastUpdated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">
                      {isLoading ? 'Updating...' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading real-time data...</p>
                </>
              ) : (
                <p className="text-gray-600">No valid data available. Please try refreshing or select a different station.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Chart Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-6">
              <Waves className="w-5 h-5 mr-2 text-blue-600" />
              <h3 className="text-xl font-semibold">Sea Level Trends</h3>
              <span className="ml-4 text-sm text-gray-500">
                Real-time measurements ({chartData.length} data points)
              </span>
            </div>
            
            {chartData.length > 0 ? (
              <div className="h-80">
                <svg viewBox="0 0 800 300" className="w-full h-full">
                  <defs>
                    <linearGradient id="seaLevelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 0.8}} />
                      <stop offset="100%" style={{stopColor: '#3B82F6', stopOpacity: 0.1}} />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  <g stroke="#E5E7EB" strokeWidth="1" opacity="0.5">
                    {[0, 1, 2, 3, 4].map(i => (
                      <line key={i} x1="60" y1={60 + i * 48} x2="740" y2={60 + i * 48} />
                    ))}
                  </g>
                  
                  {(() => {
                    const minVal = Math.min(...chartData.map(p => p.seaLevel));
                    const maxVal = Math.max(...chartData.map(p => p.seaLevel));
                    const range = Math.max(maxVal - minVal, 0.1);
                    const padding = range * 0.1;
                    const adjustedMin = minVal - padding;
                    const adjustedMax = maxVal + padding;
                    const adjustedRange = adjustedMax - adjustedMin;
                    
                    return (
                      <>
                        {/* Chart area */}
                        <path
                          d={`M 60 252 ${chartData.map((d, i) => {
                            const x = 60 + (i * 680 / Math.max(chartData.length - 1, 1));
                            const y = 252 - ((d.seaLevel - adjustedMin) / adjustedRange) * 192;
                            return `L ${x} ${y}`;
                          }).join(' ')} L 740 252 Z`}
                          fill="url(#seaLevelGradient)"
                        />
                        
                        {/* Chart line */}
                        <path
                          d={`${chartData.map((d, i) => {
                            const x = 60 + (i * 680 / Math.max(chartData.length - 1, 1));
                            const y = 252 - ((d.seaLevel - adjustedMin) / adjustedRange) * 192;
                            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                          }).join(' ')}`}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="3"
                        />
                        
                        {/* Data points */}
                        {chartData.map((d, i) => {
                          const x = 60 + (i * 680 / Math.max(chartData.length - 1, 1));
                          const y = 252 - ((d.seaLevel - adjustedMin) / adjustedRange) * 192;
                          return (
                            <circle
                              key={i}
                              cx={x}
                              cy={y}
                              r="3"
                              fill="#3B82F6"
                              stroke="white"
                              strokeWidth="2"
                            />
                          );
                        })}
                        
                        {/* Y-axis labels */}
                        {[0, 1, 2, 3, 4].map(i => {
                          const value = adjustedMin + (adjustedRange * i / 4);
                          return (
                            <text
                              key={i}
                              x="45"
                              y={256 - i * 48}
                              textAnchor="end"
                              className="text-xs fill-gray-600"
                            >
                              {value.toFixed(2)}m
                            </text>
                          );
                        })}
                      </>
                    );
                  })()}
                  
                  {/* X-axis labels with improved spacing */}
                  {chartData.filter((_, i) => i % Math.max(Math.floor(chartData.length / 8), 1) === 0).map((d, i) => {
                    const originalIndex = chartData.indexOf(d); // Use original index for correct x position
                    const x = 60 + (originalIndex * 680 / Math.max(chartData.length - 1, 1));
                    
                    let labelText;
                    
                    if (selectedPeriod === "1hr" || selectedPeriod === "day") {
                      labelText = d.time.substring(d.time.length - 5);
                    } else {
                      const dateParts = d.time.split(' ');
                      labelText = dateParts[0];
                    }
                    
                    return (
                      <text
                        key={i}
                        x={x}
                        y="275"
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                      >
                        {labelText}
                      </text>
                    );
                  })}
                </svg>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500">
                {isLoading ? 'Loading chart data...' : 'No valid data points available for chart'}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Raw Data Table */}
      {tideData.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Recent Measurements</h2>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      {tideData[0]?.prs !== undefined && tideData.some(d => d.prs) && (<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sea Level (prs) m</th>)}
                      {tideData[0]?.enc !== undefined && tideData.some(d => d.enc) && (<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Encoder (enc) m</th>)}
                      {tideData[0]?.ra2 !== undefined && tideData.some(d => d.ra2) && (<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pressure (ra2) hPa</th>)}
                      {tideData[0]?.rad !== undefined && tideData.some(d => d.rad) && (<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Radar (rad) m</th>)}
                      {tideData[0]?.bat !== undefined && tideData.some(d => d.bat) && (<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Battery (bat) V</th>)}
                      {tideData[0]?.sw1 !== undefined && tideData.some(d => d.sw1) && (<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SW1 m</th>)}
                      {tideData[0]?.sw2 !== undefined && tideData.some(d => d.sw2) && (<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SW2 m</th>)}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tideData.map((data, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.time}</td>
                        {tideData[0]?.prs !== undefined && tideData.some(d => d.prs) && (<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{data.prs || 'N/A'}</td>)}
                        {tideData[0]?.enc !== undefined && tideData.some(d => d.enc) && (<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{data.enc || 'N/A'}</td>)}
                        {tideData[0]?.ra2 !== undefined && tideData.some(d => d.ra2) && (<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.ra2 || 'N/A'}</td>)}
                        {tideData[0]?.rad !== undefined && tideData.some(d => d.rad) && (<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.rad || 'N/A'}</td>)}
                        {tideData[0]?.bat !== undefined && tideData.some(d => d.bat) && (<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.bat || 'N/A'}</td>)}
                        {tideData[0]?.sw1 !== undefined && tideData.some(d => d.sw1) && (<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.sw1 || 'N/A'}</td>)}
                        {tideData[0]?.sw2 !== undefined && tideData.some(d => d.sw2) && (<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.sw2 || 'N/A'}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">

        

        {/* Right - Contact Form */}
        <div className="lg:w-1/2 bg-gradient-to-br from-blue-100 via-teal-50 to-white p-6 rounded-lg shadow-lg border border-blue-200">
          <h2 className="text-xl font-bold mb-4 text-blue-800">Get in Touch</h2>
          <p className="text-gray-600 mb-6">
            Have questions or need more details about sea level data? Fill in your details below and our team will get back to you.
          </p>
          <form className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold text-gray-800">Your Name <span className="text-red-500">*</span></label>
              <input type="text" className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm" />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-800">Your Email <span className="text-red-500">*</span></label>
              <input type="email" className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm" />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-800">Subject</label>
              <input type="text" className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm" />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-800">Your Message</label>
              <textarea className="border border-gray-300 p-2 w-full rounded focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm" rows="5"></textarea>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-2 px-6 rounded-lg hover:opacity-90 transition duration-200 shadow-md"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>


      </section>

      {/* Footer Info */}
      <section className="py-12 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Waves className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Data</h3>
              <p className="text-blue-200">
                Direct connection to IOC Sea Level Monitoring Network stations
              </p>
            </div>
            <div>
              <TrendingUp className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Live Analysis</h3>
              <p className="text-blue-200">
                Immediate processing and trend analysis of incoming data
              </p>
            </div>
            <div>
              <RefreshCw className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Continuous Updates</h3>
              <p className="text-blue-200">
                Fresh data every few minutes from active monitoring stations
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}