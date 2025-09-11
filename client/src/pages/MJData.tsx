import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

type ATData = {
    [date: string]: {
        [hour: string]: {
            [minute: string]: number;
        };
    };
};

interface ApiResponse {
  success: boolean;
  message: string;
  generated_files: string[];
  total_entries_processed: number;
  timestamp: string;
}

interface ParameterData {
    filename: string;
    paramType: string;
    location: string;
    timePoints: { time: string; value: number }[];
    error?: string;
}

interface LocationGroup {
    location: string;
    parameters: ParameterData[];
    combinedChart: any;
}

const ALL_PARAMETERS = ["AT", "BP", "HU", "RN", "WI", "WL", "WT"];

// Define the available JSON files based on your folder structure
const JSON_FILES = [
    "AT_0002.json",
    "AT_SL01.json", 
    "BP_0002.json",
    "BP_SL01.json",
    "HU_0002.json",
    "HU_SL01.json",
    "RN_0002.json", 
    "RN_SL01.json",
    "WI_0002.json",
    "WI_SL01.json",
    "WL_0002.json",
    "WL_SL01.json",
    "WT_0002.json",
    "WT_SL01.json"
];

const AllChartsViewer: React.FC = () => {
    const API_BASE = "/api/data/files";
    const [files, setFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch the list of generated files
    const fetchFiles = () => {
        setLoading(true);
        fetch(API_BASE)
        .then((res) => res.json())
        .then((data: ApiResponse) => {
            if (data.success) {
            setFiles(data.generated_files);
            } else {
            setError(data.message);
            }
            setLoading(false);
        })
        .catch(() => {
            setError("Failed to fetch files list");
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchFiles();
        const interval = setInterval(fetchFiles, 20000); // 20 seconds
        return () => clearInterval(interval);
    }, []);


    const [locationGroups, setLocationGroups] = useState<LocationGroup[]>([]);
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState<string | null>(null);
    const [totalCharts, setTotalCharts] = useState(0);
    const [selectedParameters, setSelectedParameters] = useState<string[]>(ALL_PARAMETERS);
    const [allParameterData, setAllParameterData] = useState<ParameterData[]>([]);

    // Helper functions
    const getParameterFromFilename = (filename: string): string => {
        if (filename.includes("AT")) return "AT";
        if (filename.includes("BP")) return "BP";
        if (filename.includes("HU")) return "HU";
        if (filename.includes("RN")) return "RN";
        if (filename.includes("WI")) return "WI";
        if (filename.includes("WL")) return "WL";
        if (filename.includes("WT")) return "WT";
        return "Unknown";
    };

    const getLocationFromFilename = (filename: string): string => {
        if (filename.includes("0002")) return "0002";
        if (filename.includes("SL01")) return "SL01";
        return "Unknown";
    };

    const getFullParameterName = (paramCode: string): string => {
        switch (paramCode) {
            case "AT": return "Air Temperature";
            case "BP": return "Barometric Pressure";
            case "HU": return "Humidity";
            case "RN": return "Rainfall";
            case "WI": return "Wind";
            case "WL": return "Water Level";
            case "WT": return "Water Temperature";
            default: return paramCode;
        }
    };

    const getColorForParameter = (paramType: string): string => {
        switch (paramType) {
            case "AT": return "rgba(255,99,132,1)";
            case "BP": return "rgba(54,162,235,1)";
            case "HU": return "rgba(255,205,86,1)";
            case "RN": return "rgba(75,192,192,1)";
            case "WI": return "rgba(153,102,255,1)";
            case "WL": return "rgba(255,159,64,1)";
            case "WT": return "rgba(199,199,199,1)";
            default: return "rgba(201,203,207,1)";
        }
    };

    const getBackgroundColorForParameter = (paramType: string): string => {
        const borderColor = getColorForParameter(paramType);
        return borderColor.replace("1)", "0.1)");
    };

    // Process individual file data
    const processFileData = (data: any[], filename: string): ParameterData | null => {
        try {
            const paramType = getParameterFromFilename(filename);
            const location = getLocationFromFilename(filename);

            if (!ALL_PARAMETERS.includes(paramType) || !data || data.length === 0) {
                return null;
            }

            const dataObj = data[0];
            const dateKey = Object.keys(dataObj).find(
                (k) => k !== "location" && k !== "parameter_type" && k !== "status"
            );
            
            if (!dateKey) return null;

            const hoursObj = dataObj[dateKey] as ATData[string];
            const timePoints: { time: string; value: number }[] = [];
            
            Object.entries(hoursObj).forEach(([hour, minutesObj]) => {
                Object.entries(minutesObj).forEach(([minute, value]) => {
                    timePoints.push({ time: `${hour}:${minute}`, value });
                });
            });

            timePoints.sort((a, b) => a.time.localeCompare(b.time));

            return {
                filename,
                paramType,
                location,
                timePoints
            };
        } catch (err) {
            console.error(`Error processing ${filename}:`, err);
            return {
                filename,
                paramType: getParameterFromFilename(filename),
                location: getLocationFromFilename(filename),
                timePoints: [],
                error: `Failed to process ${filename}`
            };
        }
    };

    // Fetch data for a single JSON file directly
    const fetchFileData = async (filename: string): Promise<ParameterData | null> => {
        try {
            // Try multiple possible paths for the JSON files
            const possiblePaths = [
                `/src/data/${filename}`,
            ];
            
            let response;
            let lastError;
            
            for (const path of possiblePaths) {
                try {
                    console.log(`Attempting to fetch ${filename} from ${path}`);
                    response = await fetch(path);
                    if (response.ok) {
                        console.log(`Successfully fetched ${filename} from ${path}`);
                        break;
                    } else {
                        console.log(`Failed to fetch from ${path}, status: ${response.status}`);
                        lastError = new Error(`HTTP error! status: ${response.status} for path: ${path}`);
                    }
                } catch (err) {
                    console.log(`Error trying path ${path}:`, err);
                    lastError = err;
                    continue;
                }
            }
            
            if (!response || !response.ok) {
                throw lastError || new Error(`All paths failed for ${filename}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Response is not JSON. Content-Type: ${contentType}`);
            }
            
            const data = await response.json();
            return processFileData(data, filename);
        } catch (err) {
            console.error(`Error fetching ${filename}:`, err);
            return {
                filename,
                paramType: getParameterFromFilename(filename),
                location: getLocationFromFilename(filename),
                timePoints: [],
                error: `Failed to fetch ${filename}: ${err instanceof Error ? err.message : 'Unknown error'}`
            };
        }
    };

    // Create combined chart data for a location with selected parameters
    const createCombinedChart = (parameters: ParameterData[], location: string, selectedParams: string[]) => {
        // Filter parameters based on selection
        const filteredParameters = parameters.filter(param => selectedParams.includes(param.paramType));
        
        // Get all unique time points
        const allTimes = new Set<string>();
        filteredParameters.forEach(param => {
            param.timePoints.forEach(point => allTimes.add(point.time));
        });
        
        const sortedTimes = Array.from(allTimes).sort();

        // Create datasets for each selected parameter
        const datasets = filteredParameters
            .filter(param => !param.error && param.timePoints.length > 0)
            .map(param => {
                // Create data array aligned with time points
                const dataPoints = sortedTimes.map(time => {
                    const point = param.timePoints.find(p => p.time === time);
                    return point ? point.value : null;
                });

                return {
                    label: getFullParameterName(param.paramType),
                    data: dataPoints,
                    borderColor: getColorForParameter(param.paramType),
                    backgroundColor: getBackgroundColorForParameter(param.paramType),
                    tension: 0.3,
                    pointRadius: 2,
                    pointHoverRadius: 4,
                    fill: false,
                    spanGaps: true
                };
            });

        return {
            labels: sortedTimes,
            datasets
        };
    };

    // Group parameters by location and create combined charts
    const groupAndCombineData = (parameterData: ParameterData[], selectedParams: string[]) => {
        const locationMap = new Map<string, ParameterData[]>();
        
        // Group by location
        parameterData.forEach(param => {
            if (!locationMap.has(param.location)) {
                locationMap.set(param.location, []);
            }
            locationMap.get(param.location)!.push(param);
        });

        // Create location groups with combined charts
        const groups: LocationGroup[] = Array.from(locationMap.entries()).map(([location, parameters]) => {
            const combinedChart = createCombinedChart(parameters, location, selectedParams);
            return {
                location,
                parameters,
                combinedChart
            };
        });

        return groups;
    };

    // Handle parameter selection
    const handleParameterChange = (paramType: string) => {
        setSelectedParameters(prev => {
            if (prev.includes(paramType)) {
                return prev.filter(p => p !== paramType);
            } else {
                return [...prev, paramType];
            }
        });
    };

    // Select all parameters
    const selectAllParameters = () => {
        setSelectedParameters(ALL_PARAMETERS);
    };

    // Clear all parameters
    const clearAllParameters = () => {
        setSelectedParameters([]);
    };

    // Fetch all JSON files and process data
    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log(`Fetching data for ${JSON_FILES.length} JSON files simultaneously...`);
            
            // Fetch all JSON files simultaneously
            const promises = JSON_FILES.map(fetchFileData);
            const results = await Promise.all(promises);
            
            // Filter valid results
            const validResults = results.filter(result => result !== null) as ParameterData[];
            setTotalCharts(validResults.length);
            setAllParameterData(validResults);

            if (validResults.length === 0) {
                setError("No valid data found in JSON files");
                return;
            }

            console.log(`Processed ${validResults.length} JSON files`);
            
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to fetch and process JSON files");
        } finally {
            setLoading(false);
        }
    };

    // Update charts when selected parameters change
    useEffect(() => {
        if (allParameterData.length > 0) {
            const groups = groupAndCombineData(allParameterData, selectedParameters);
            setLocationGroups(groups);
        }
    }, [allParameterData, selectedParameters]);

    // Chart options
    const getChartOptions = (location: string) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: `Selected Parameters - Location ${location}`,
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            legend: {
                position: 'top' as const,
                labels: {
                    boxWidth: 15,
                    padding: 15,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255,255,255,0.2)',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Time'
                },
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Values'
                },
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                }
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        }
    });

    useEffect(() => {
        fetchAllData();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchAllData, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="all-charts-container">
            <div className="header">
                <h1>Real-time Environmental Monitoring Dashboard</h1>
                <div className="header-info">
                    <div className="status-info">
                        <div className="status-item">
                            <strong>Available Parameters:</strong> {ALL_PARAMETERS.join(', ')}
                        </div>
                        <div className="status-item">
                            <strong>Selected Parameters:</strong> {selectedParameters.length > 0 ? selectedParameters.join(', ') : 'None'}
                        </div>
                        <div className="status-item">
                            <strong>JSON Files:</strong> {JSON_FILES.length}
                        </div>
                        <div className="status-item">
                            <strong>Processed Data Files:</strong> {totalCharts}
                        </div>
                        <div className="status-item">
                            <strong>Locations:</strong> {locationGroups.map(g => g.location).join(', ')}
                        </div>
                    </div>
                    <button onClick={fetchAllData} disabled={loading} className="refresh-btn">
                        {loading ? "Loading..." : "Refresh All Data"}
                    </button>
                </div>
            </div>

            {/* Parameter Selection Panel */}
            <div className="parameter-selection-panel">
                <h2>Select Parameters to Display</h2>
                <div className="selection-controls">
                    <button onClick={selectAllParameters} className="control-btn select-all">
                        Select All
                    </button>
                    <button onClick={clearAllParameters} className="control-btn clear-all">
                        Clear All
                    </button>
                    <span className="selection-count">
                        ({selectedParameters.length} of {ALL_PARAMETERS.length} selected)
                    </span>
                </div>
                <div className="parameter-checkboxes">
                    {ALL_PARAMETERS.map(param => (
                        <label key={param} className="parameter-checkbox">
                            <input
                                type="checkbox"
                                checked={selectedParameters.includes(param)}
                                onChange={() => handleParameterChange(param)}
                            />
                            <span 
                                className="checkbox-custom" 
                                style={{ borderColor: getColorForParameter(param) }}
                            >
                                <span 
                                    className="checkbox-indicator"
                                    style={{ backgroundColor: getColorForParameter(param) }}
                                ></span>
                            </span>
                            <span className="parameter-name" style={{ color: getColorForParameter(param) }}>
                                {getFullParameterName(param)} ({param})
                            </span>
                        </label>
                    ))}
                </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="charts-container">
                {loading ? (
                    <div className="loading-message">
                        <div className="loading-spinner"></div>
                       <h3>Loading JSON Files Simultaneously...</h3>
                        <p>Processing {JSON_FILES.length} JSON files for all parameters</p>
                    </div>
                ) : selectedParameters.length === 0 ? (
                    <div className="no-selection-message">
                        <h3>No Parameters Selected</h3>
                        <p>Please select at least one parameter to display charts.</p>
                    </div>
                ) : locationGroups.length === 0 ? (
                    <div className="no-data-message">
                        <h3>No Data Available</h3>
                        <p>No valid data found for selected parameters: {selectedParameters.join(', ')}</p>
                        <p>Make sure JSON files are available in the ./data/ folder</p>
                    </div>
                ) : (
                    <div className="charts-grid">
                        {locationGroups.map((group) => {
                            const selectedParamsForLocation = group.parameters.filter(p => selectedParameters.includes(p.paramType));
                            return (
                                <div key={group.location} className="chart-section">
                                    <div className="chart-wrapper">
                                        <Line 
                                            data={group.combinedChart} 
                                            options={getChartOptions(group.location)}
                                        />
                                    </div>
                                    <div className="chart-details">
                                        <h4>Location {group.location} - Selected Parameters Summary</h4>
                                        <div className="parameter-list">
                                            {selectedParamsForLocation.map(param => (
                                                <div key={param.filename} className="parameter-item">
                                                    <span className="param-name" style={{color: getColorForParameter(param.paramType)}}>
                                                        ● {getFullParameterName(param.paramType)}
                                                    </span>
                                                    <span className="param-points">
                                                        ({param.timePoints.length} data points)
                                                    </span>
                                                    {param.error && <span className="param-error">Error: {param.error}</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style jsx>{`
                .all-charts-container {
                    padding: 20px;
                    max-width: 1800px;
                    margin: 0 auto;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                }

                .header {
                    background: rgba(255, 255, 255, 0.95);
                    padding: 25px;
                    border-radius: 12px;
                    margin-bottom: 25px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    backdrop-filter: blur(10px);
                }

                .header h1 {
                    margin: 0 0 20px 0;
                    color: #333;
                    text-align: center;
                    font-size: 2em;
                    font-weight: 700;
                }

                .header-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 20px;
                }

                .status-info {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 10px;
                    flex: 1;
                }

                .status-item {
                    padding: 8px 12px;
                    background: rgba(0, 123, 255, 0.1);
                    border-radius: 6px;
                    font-size: 0.9em;
                }

                .status-item strong {
                    color: #0066cc;
                }

                .parameter-selection-panel {
                    background: rgba(255, 255, 255, 0.95);
                    padding: 25px;
                    border-radius: 12px;
                    margin-bottom: 25px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    backdrop-filter: blur(10px);
                }

                .parameter-selection-panel h2 {
                    margin: 0 0 20px 0;
                    color: #333;
                    font-size: 1.5em;
                    font-weight: 600;
                }

                .selection-controls {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }

                .control-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 0.9em;
                    transition: all 0.3s ease;
                }

                .select-all {
                    background: linear-gradient(45deg, #28a745, #20c997);
                    color: white;
                }

                .clear-all {
                    background: linear-gradient(45deg, #dc3545, #fd7e14);
                    color: white;
                }

                .control-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }

                .selection-count {
                    color: #666;
                    font-weight: 500;
                }

                .parameter-checkboxes {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 15px;
                }

                .parameter-checkbox {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    padding: 10px;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                    background: rgba(0,0,0,0.02);
                }

                .parameter-checkbox:hover {
                    background: rgba(0,0,0,0.05);
                    transform: translateY(-1px);
                }

                .parameter-checkbox input {
                    display: none;
                }

                .checkbox-custom {
                    width: 20px;
                    height: 20px;
                    border: 2px solid;
                    border-radius: 4px;
                    margin-right: 12px;
                    position: relative;
                    transition: all 0.3s ease;
                    background: white;
                }

                .checkbox-indicator {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    right: 2px;
                    bottom: 2px;
                    border-radius: 2px;
                    transform: scale(0);
                    transition: transform 0.2s ease;
                }

                .parameter-checkbox input:checked + .checkbox-custom .checkbox-indicator {
                    transform: scale(1);
                }

                .parameter-name {
                    font-weight: 500;
                    font-size: 0.95em;
                }

                .refresh-btn {
                    padding: 12px 24px;
                    background: linear-gradient(45deg, #28a745, #20c997);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1em;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
                }

                .refresh-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
                }

                .refresh-btn:disabled {
                    background: #6c757d;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                .loading-message, .no-data-message, .no-selection-message {
                    text-align: center;
                    padding: 60px 20px;
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                    backdrop-filter: blur(10px);
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #007bff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .loading-message h3, .no-data-message h3, .no-selection-message h3 {
                    color: #333;
                    margin-bottom: 15px;
                    font-size: 1.5em;
                }

                .loading-message p, .no-data-message p, .no-selection-message p {
                    color: #666;
                    margin: 0 0 10px 0;
                }

                .charts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(800px, 1fr));
                    gap: 30px;
                }

                .chart-section {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 16px;
                    padding: 25px;
                    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
                    backdrop-filter: blur(10px);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .chart-section:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
                }

                .chart-wrapper {
                    height: 500px;
                    width: 100%;
                    margin-bottom: 20px;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .chart-details {
                    border-top: 2px solid #f0f0f0;
                    padding-top: 20px;
                }

                .chart-details h4 {
                    margin: 0 0 15px 0;
                    color: #333;
                    font-size: 1.2em;
                    font-weight: 600;
                    text-align: center;
                }

                .parameter-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 10px;
                }

                .parameter-item {
                    display: flex;
                    flex-direction: column;
                    padding: 10px;
                    background: rgba(0,0,0,0.02);
                    border-radius: 6px;
                    border-left: 4px solid #ddd;
                }

                .param-name {
                    font-weight: 600;
                    font-size: 0.9em;
                }

                .param-points {
                    font-size: 0.8em;
                    color: #666;
                    margin-top: 2px;
                }

                .param-error {
                    font-size: 0.8em;
                    color: #dc3545;
                    font-style: italic;
                    margin-top: 2px;
                }

                .error-message {
                    color: #721c24;
                    background: rgba(248, 215, 218, 0.9);
                    border: 1px solid #f5c6cb;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 25px;
                    text-align: center;
                    backdrop-filter: blur(10px);
                }

                @media (max-width: 1200px) {
                    .charts-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .all-charts-container {
                        padding: 10px;
                    }
                    
                    .header {
                        padding: 20px;
                    }
                    
                    .header h1 {
                        font-size: 1.5em;
                    }
                    
                    .header-info {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .status-info {
                        grid-template-columns: 1fr;
                    }
                    
                    .parameter-selection-panel {
                        padding: 20px;
                    }
                    
                    .parameter-checkboxes {
                        grid-template-columns: 1fr;
                    }
                    
                    .selection-controls {
                        justify-content: center;
                    }
                    
                    .chart-section {
                        padding: 20px;
                    }
                    
                    .chart-wrapper {
                        height: 400px;
                    }
                    
                    .parameter-list {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default AllChartsViewer;