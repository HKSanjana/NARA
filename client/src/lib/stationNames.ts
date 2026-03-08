// Station ID to Name mapping
const STATION_NAMES: Record<string, string> = {
    '0002': 'Point Pedro',
    'SL01': 'Mirissa',
    'Hambanthota': 'Hambantota',
};

export function getStationDisplayName(name: string | undefined | null, stationId: string | undefined | null): string {
    // If name exists, use it
    if (name && name.trim()) {
        return name;
    }
    
    // Otherwise, map station ID to name
    if (stationId && STATION_NAMES[stationId]) {
        return STATION_NAMES[stationId];
    }
    
    // Fallback
    return 'Unknown Station';
}
