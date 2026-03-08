import * as XLSX from "xlsx";

/**
 * Frontend-only API service using real mechanisms:
 * 1. Proxying for external IOC data (Vite/Vercel handles /proxy).
 * 2. Local Excel parsing for historical/dashboard data.
 */

export interface StationSummary {
    station_id: string;
    name: string;
    latest_ts: string | null;
    [key: string]: any;
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
     * Parses local Excel files to provide dashboard summary data.
     */
    // async getDashboardData(): Promise<StationSummary[]> {
    //     try {
    //         // For now, we'll parse Hambanthota.xlsx as a primary source
    //         // In a more complex app, we might iterate over multiple assets
    //         const response = await fetch("/src/assets/Hambanthota.xlsx");
    //         const arrayBuffer = await response.arrayBuffer();
    //         const workbook = XLSX.read(arrayBuffer);
    //         const firstSheetName = workbook.SheetNames[0];
    //         const worksheet = workbook.Sheets[firstSheetName];
    //         const data = XLSX.utils.sheet_to_json(worksheet) as any[];

    //         // Extract latest record for the summary
    //         const latestRecord = data[data.length - 1] || {};

    //         return [
    //             {
    //                 station_id: "Hambanthota",
    //                 name: "Hambantota",
    //                 latest_ts: latestRecord.DateTime || latestRecord.timestamp || null,
    //                 WL: latestRecord.WaterLevel || latestRecord.value || null,
    //                 AT: latestRecord.AirTemp || null,
    //                 // Add other mappings as discovered in the Excel structure
    //             },
    //             // We can add fallback or placeholder entries for other stations 
    //             // until their specific Excel files are fully integrated.
    //             {
    //                 station_id: "0002",
    //                 name: "Point Pedro",
    //                 latest_ts: null,
    //             }
    //         ];
    //     } catch (error) {
    //         console.error("Error parsing dashboard Excel data:", error);
    //         return [];
    //     }
    // },

    /**
     * Fetches historical series from a local Excel file.
     */
    async getHistoricalSeries(assetPath: string) {
        const response = await fetch(assetPath);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        return XLSX.utils.sheet_to_json(worksheet);
    }
};
