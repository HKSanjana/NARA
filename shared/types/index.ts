export interface StationSummary {
    station_id: string;
    name: string;
    latest_ts: string;
    AT?: number; // Air Temperature
    BP?: number; // Barometric Pressure
    HU?: number; // Humidity
    RN?: number; // Rainfall
    WI?: number; // Wind Speed
    WL?: number; // Water Level
    WT?: number; // Water Temperature
    latitude?: number;
    longitude?: number;
}

export interface Measurement {
    measurement_ts: string;
    value: number;
    code: string;
    unit?: string;
    quality_flag?: string | null;
}

export interface MeasurementType {
    measurement_type_id: number;
    code: string;
    description: string;
    unit: string;
}

export interface Station {
    station_id: string;
    name: string;
    latitude?: number;
    longitude?: number;
    location_description?: string;
}
