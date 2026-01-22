import { useState } from 'react';

interface TimeRangeSelectorProps {
    onSelectTimeRange: (startDate: string, endDate: string) => void;
}

export default function TimeRangeSelector({ onSelectTimeRange }: TimeRangeSelectorProps) {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(event.target.value);
        onSelectTimeRange(event.target.value, endDate);
    };

    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEndDate(event.target.value);
        onSelectTimeRange(startDate, event.target.value);
    };

    return (
        <div>
            <label htmlFor="start-date">Start Date:</label>
            <input type="date" id="start-date" value={startDate} onChange={handleStartDateChange} />
            <label htmlFor="end-date">End Date:</label>
            <input type="date" id="end-date" value={endDate} onChange={handleEndDateChange} />
        </div>
    );
}
