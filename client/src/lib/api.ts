/**
 * Frontend-only API service using direct Neon PostgreSQL access.
 */

const NEON_URL = import.meta.env.VITE_DATABASE_URL;

export interface StationSummary {
    station_id: string;
    name: string;
    latest_ts: string | null;
    latitude?: number;
    longitude?: number;
    [key: string]: any;
}

async function queryNeon(sql: string) {
    if (!NEON_URL) {
        throw new Error("VITE_DATABASE_URL is not defined in .env");
    }

    // Use the configured proxy (/neon-proxy) to bypass CORS
    const httpUrl = `/neon-proxy/sql`;

    const response = await fetch(httpUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Neon-Connection-String': NEON_URL,
        },
        body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Neon Query Error: ${error}`);
    }

    return await response.json();
}

export const api = {
    /**
     * Fetches real tide data from IOC via the configured /proxy endpoint.
     */
    async getIOCData(stationCode: string, periodCode: string): Promise<string> {
        const targetUrl = `/proxy/bgraph.php?code=${stationCode}&output=tab&period=${periodCode}`;
        const response = await fetch(targetUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch IOC data: ${response.statusText}`);
        }
        return await response.text();
    },

    /**
     * Fetches dashboard data directly from NeonDB using raw SQL.
     */
    async getDashboardData(): Promise<StationSummary[]> {
        console.log("[DB API] Fetching dashboard data from Neon...");
        try {
            // Step 1: Get all stations
            const stationsResult = await queryNeon("SELECT station_id, name, latitude, longitude FROM stations ORDER BY name");
            const allStations = stationsResult.rows || [];

            // Step 2: Get latest measurements using DISTINCT ON
            const measurementsResult = await queryNeon(`
        SELECT DISTINCT ON (station_id, measurement_type_id)
          station_id, measurement_type_id, value, measurement_ts
        FROM measurements
        ORDER BY station_id, measurement_type_id, measurement_ts DESC
      `);
            const latestMeasurements = measurementsResult.rows || [];

            // Step 3: Get measurement types mapping
            const typesResult = await queryNeon("SELECT measurement_type_id, code FROM measurement_types");
            const mTypes = typesResult.rows || [];

            const measurementsByStation: Record<string, any[]> = {};
            latestMeasurements.forEach((m: any) => {
                if (!measurementsByStation[m.station_id]) {
                    measurementsByStation[m.station_id] = [];
                }
                measurementsByStation[m.station_id].push(m);
            });

            return allStations.map((station: any) => {
                const stationMeasurements = measurementsByStation[station.station_id] || [];
                const summary: any = {
                    station_id: station.station_id,
                    name: station.name,
                    latitude: station.latitude ? parseFloat(station.latitude) : null,
                    longitude: station.longitude ? parseFloat(station.longitude) : null,
                    latest_ts: stationMeasurements.length > 0 ?
                        new Date(Math.max(...stationMeasurements.map((m: any) => new Date(m.measurement_ts).getTime()))).toISOString() : null,
                };

                // Map parameter codes to values
                mTypes.forEach((mt: any) => {
                    const match = stationMeasurements.find((m: any) => m.measurement_type_id === mt.measurement_type_id);
                    if (match) {
                        summary[mt.code] = match.value;
                    }
                });

                return summary;
            });
        } catch (error) {
            console.error("Error fetching dashboard data from NeonDB:", error);
            return [];
        }
    },

    /**
     * Fetches historical series for a station and measurement type.
     */
    async getHistoricalSeries(stationId: string, measurementTypeCode: string, limit = 500) {
        console.log(`[DB API] Fetching series for ${stationId} - ${measurementTypeCode}...`);
        try {
            const sql = `
        SELECT m.measurement_ts, m.value, m.quality_flag
        FROM measurements m
        JOIN measurement_types mt ON m.measurement_type_id = mt.measurement_type_id
        WHERE m.station_id = '${stationId}' AND mt.code = '${measurementTypeCode}'
        ORDER BY m.measurement_ts DESC
        LIMIT ${limit}
      `;
            const result = await queryNeon(sql);
            return result.rows || [];
        } catch (error) {
            console.error("Error fetching historical series from NeonDB:", error);
            return [];
        }
    },

    /**
     * Fetches all measurements for a specific station, including type codes.
     */
    async getMeasurements(stationId: string): Promise<any[]> {
        console.log(`[DB API] Fetching all measurements for station ${stationId}...`);
        try {
            const sql = `
        SELECT m.measurement_ts, m.value, mt.code, mt.unit
        FROM measurements m
        JOIN measurement_types mt ON m.measurement_type_id = mt.measurement_type_id
        WHERE m.station_id = '${stationId}'
        ORDER BY m.measurement_ts DESC
        LIMIT 1000
      `;
            const result = await queryNeon(sql);
            return result.rows || [];
        } catch (error) {
            console.error(`Error fetching measurements for ${stationId}:`, error);
            return [];
        }
    },

    /**
     * Fetches all registered stations.
     */
    async getStations(): Promise<any[]> {
        try {
            const result = await queryNeon("SELECT station_id, name FROM stations ORDER BY name");
            return result.rows || [];
        } catch (error) {
            console.error("Error fetching stations:", error);
            return [];
        }
    },

    /**
     * Fetches all measurement types.
     */
    async getMeasurementTypes(): Promise<any[]> {
        try {
            const result = await queryNeon("SELECT measurement_type_id, code, description, unit FROM measurement_types");
            return result.rows || [];
        } catch (error) {
            console.error("Error fetching measurement types:", error);
            return [];
        }
    },

    async getDivisions(): Promise<any[]> {
        try {
            const result = await queryNeon("SELECT * FROM divisions ORDER BY name");
            return result.rows || [];
        } catch (error) {
            console.error("Error fetching divisions:", error);
            return [];
        }
    },

    async getRTIRequests(): Promise<any[]> {
        try {
            const result = await queryNeon("SELECT * FROM rti_requests ORDER BY request_date DESC");
            return result.rows || [];
        } catch (error) {
            console.error("Error fetching RTI requests:", error);
            return [];
        }
    },

    async getDocuments(): Promise<any[]> {
        try {
            const result = await queryNeon("SELECT * FROM documents ORDER BY upload_date DESC");
            return result.rows || [];
        } catch (error) {
            console.error("Error fetching documents:", error);
            return [];
        }
    },

    async getUsers(): Promise<any[]> {
        try {
            const result = await queryNeon("SELECT id, username, role FROM users");
            return result.rows || [];
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    },

    async getMessages(): Promise<any[]> {
        try {
            const result = await queryNeon("SELECT * FROM contact_messages ORDER BY created_at DESC");
            return result.rows || [];
        } catch (error) {
            console.error("Error fetching messages:", error);
            return [];
        }
    },

    async getEvents(): Promise<any[]> {
        try {
            const result = await queryNeon("SELECT * FROM calendar_events ORDER BY start_time ASC");
            return result.rows || [];
        } catch (error) {
            console.error("Error fetching events:", error);
            return [];
        }
    }
};
