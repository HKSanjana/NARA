import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Station {
    station_id: string;
    name: string;
}

interface StationSelectorProps {
    onSelectStation: (stationId: string) => void;
}

export default function StationSelector({ onSelectStation }: StationSelectorProps) {
    const [stations, setStations] = useState<Station[]>([]);
    const [selectedStation, setSelectedStation] = useState<string>('');

    useEffect(() => {
        const fetchStations = async () => {
            const data = await api.getStations();
            setStations(data);
            if (data.length > 0) {
                setSelectedStation(data[0].station_id);
                onSelectStation(data[0].station_id);
            }
        };
        fetchStations();
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const stationId = event.target.value;
        setSelectedStation(stationId);
        onSelectStation(stationId);
    };

    return (
        <div>
            <label htmlFor="station-select">Select Station:</label>
            <select id="station-select" value={selectedStation} onChange={handleChange}>
                {stations.map((station) => (
                    <option key={station.station_id} value={station.station_id}>
                        {station.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
