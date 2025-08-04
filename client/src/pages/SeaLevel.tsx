import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Waves, TrendingUp, MapPin, Calendar, Thermometer, Wind, Droplets } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function SeaLevel() {
  const [selectedStation, setSelectedStation] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("7days");

  const { data: seaLevelData = [], isLoading } = useQuery({
    queryKey: ['/api/sea-level', selectedStation, selectedPeriod],
  });

  // Mock stations data for display
  const stations = [
    { id: "COL01", name: "Colombo Port", location: "Colombo", lat: "6.9344", lon: "79.8428" },
    { id: "GAL01", name: "Galle Harbor", location: "Galle", lat: "6.0367", lon: "80.2170" },
    { id: "TRI01", name: "Trincomalee Bay", location: "Trincomalee", lat: "8.5874", lon: "81.2152" },
    { id: "HAM01", name: "Hambantota Port", location: "Hambantota", lat: "6.1240", lon: "81.1185" },
  ];

  // Mock current data for demonstration
  const currentData = [
    {
      station: "Colombo Port",
      seaLevel: "1.24m",
      temperature: "28.5°C",
      salinity: "34.2 PSU",
      waveHeight: "0.8m",
      windSpeed: "12 km/h",
      windDirection: "SW",
      trend: "rising",
      lastUpdated: "2024-01-15 14:30"
    },
    {
      station: "Galle Harbor", 
      seaLevel: "1.18m",
      temperature: "29.1°C",
      salinity: "34.5 PSU",
      waveHeight: "1.2m",
      windSpeed: "15 km/h",
      windDirection: "W",
      trend: "stable",
      lastUpdated: "2024-01-15 14:25"
    },
    {
      station: "Trincomalee Bay",
      seaLevel: "1.31m",
      temperature: "27.8°C", 
      salinity: "33.9 PSU",
      waveHeight: "0.6m",
      windSpeed: "8 km/h",
      windDirection: "NE",
      trend: "falling",
      lastUpdated: "2024-01-15 14:28"
    },
    {
      station: "Hambantota Port",
      seaLevel: "1.22m",
      temperature: "28.9°C",
      salinity: "34.1 PSU", 
      waveHeight: "1.0m",
      windSpeed: "18 km/h",
      windDirection: "SW",
      trend: "rising",
      lastUpdated: "2024-01-15 14:32"
    }
  ];

  // Mock chart data
  const chartData = [
    { time: '00:00', seaLevel: 1.20, temperature: 27.5 },
    { time: '02:00', seaLevel: 1.18, temperature: 27.2 },
    { time: '04:00', seaLevel: 1.22, temperature: 27.0 },
    { time: '06:00', seaLevel: 1.25, temperature: 27.8 },
    { time: '08:00', seaLevel: 1.28, temperature: 28.5 },
    { time: '10:00', seaLevel: 1.30, temperature: 29.2 },
    { time: '12:00', seaLevel: 1.27, temperature: 29.8 },
    { time: '14:00', seaLevel: 1.24, temperature: 28.9 },
    { time: '16:00', seaLevel: 1.21, temperature: 28.3 },
    { time: '18:00', seaLevel: 1.19, temperature: 27.9 },
    { time: '20:00', seaLevel: 1.23, temperature: 27.6 },
    { time: '22:00', seaLevel: 1.26, temperature: 27.4 },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'falling':
        return <TrendingUp className="w-4 h-4 text-blue-500 transform rotate-180" />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising':
        return 'text-red-600';
      case 'falling':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-nara-light to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-nara-navy mb-6">Sea Level Monitoring</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time sea level data and environmental monitoring from strategically located stations around Sri Lanka's coastline.
          </p>
        </div>
      </section>

      {/* Controls Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="w-full lg:w-64">
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stations</SelectItem>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-64">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24hours">Last 24 Hours</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="bg-nara-navy hover:bg-blue-800">
              Download Data
            </Button>
          </div>
        </div>
      </section>

      {/* Current Conditions */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-nara-navy mb-8">Current Conditions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {currentData.map((station, index) => (
              <Card key={index} className="card-hover">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{station.station}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        Station
                      </CardDescription>
                    </div>
                    {getTrendIcon(station.trend)}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-nara-navy">{station.seaLevel}</div>
                      <div className="text-sm text-gray-600">Sea Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-gray-800">{station.temperature}</div>
                      <div className="text-sm text-gray-600">Temperature</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salinity:</span>
                      <span className="font-medium">{station.salinity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wave Height:</span>
                      <span className="font-medium">{station.waveHeight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wind:</span>
                      <span className="font-medium">{station.windSpeed} {station.windDirection}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${getTrendColor(station.trend)}`}>
                        {station.trend.charAt(0).toUpperCase() + station.trend.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">{station.lastUpdated}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sea Level Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Waves className="w-5 h-5 mr-2 text-nara-navy" />
                  Sea Level Trends
                </CardTitle>
                <CardDescription>24-hour sea level measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={['dataMin - 0.05', 'dataMax + 0.05']} />
                    <Tooltip 
                      formatter={(value: any) => [`${value}m`, 'Sea Level']}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="seaLevel" 
                      stroke="#002c6d" 
                      strokeWidth={2}
                      dot={{ fill: '#002c6d', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Temperature Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Thermometer className="w-5 h-5 mr-2 text-nara-navy" />
                  Temperature Trends
                </CardTitle>
                <CardDescription>24-hour water temperature measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip 
                      formatter={(value: any) => [`${value}°C`, 'Temperature']}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#00b4ff" 
                      fill="#00b4ff" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Station Information */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-nara-navy mb-8">Monitoring Stations</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stations.map((station) => (
              <Card key={station.id} className="card-hover">
                <CardHeader>
                  <CardTitle className="text-lg">{station.name}</CardTitle>
                  <CardDescription>{station.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Station ID:</span>
                      <span className="font-medium">{station.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Latitude:</span>
                      <span className="font-medium">{station.lat}°N</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Longitude:</span>
                      <span className="font-medium">{station.lon}°E</span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => setSelectedStation(station.id)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Information */}
      <section className="py-12 bg-nara-navy text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Waves className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
              <p className="text-blue-200">
                Continuous data collection every 15 minutes from all monitoring stations.
              </p>
            </div>
            <div>
              <TrendingUp className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Trend Analysis</h3>
              <p className="text-blue-200">
                Advanced algorithms analyze patterns for early warning systems.
              </p>
            </div>
            <div>
              <Calendar className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Historical Data</h3>
              <p className="text-blue-200">
                Access to comprehensive historical records dating back to 2010.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
