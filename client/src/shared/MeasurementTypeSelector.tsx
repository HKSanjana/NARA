import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface MeasurementType {
    measurement_type_id: number;
    code: string;
    description: string;
    unit: string;
}

interface MeasurementTypeSelectorProps {
    onSelectMeasurementType: (measurementTypeCode: string) => void;
}

export default function MeasurementTypeSelector({ onSelectMeasurementType }: MeasurementTypeSelectorProps) {
    const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([]);
    const [selectedMeasurementType, setSelectedMeasurementType] = useState<string>('');

    useEffect(() => {
        const fetchMeasurementTypes = async () => {
            const data = await api.getMeasurementTypes();
            setMeasurementTypes(data);
            if (data.length > 0) {
                setSelectedMeasurementType(data[0].code);
                onSelectMeasurementType(data[0].code);
            }
        };
        fetchMeasurementTypes();
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const measurementTypeCode = event.target.value;
        setSelectedMeasurementType(measurementTypeCode);
        onSelectMeasurementType(measurementTypeCode);
    };

    return (
        <div>
            <label htmlFor="measurement-type-select">Select Measurement Type:</label>
            <select id="measurement-type-select" value={selectedMeasurementType} onChange={handleChange}>
                {measurementTypes.map((type) => (
                    <option key={type.measurement_type_id} value={type.code}>
                        {type.description} ({type.unit})
                    </option>
                ))}
            </select>
        </div>
    );
}
