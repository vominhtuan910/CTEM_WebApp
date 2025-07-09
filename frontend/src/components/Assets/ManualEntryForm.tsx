import React, { useState } from 'react';

interface ManualEntryFormProps {
    onAssetAdded: () => void;
    onSubmit: (data: {
        name: string;
        ip: string;
        os: string;
        services: string[];
        description: string;
        value: number;
    }) => void;
}

const osOptions = ['Windows', 'Linux', 'macOS', 'Unix', 'Other'];
const serviceOptions = ['HTTP', 'HTTPS', 'SSH', 'FTP', 'SMTP', 'DNS', 'Other'];

const labelClass = "block text-xs font-medium mb-1";
const inputClass = "mt-1 w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm";
const sectionClass = "mb-2 flex-1 min-w-[140px]";

const ManualEntryForm: React.FC<ManualEntryFormProps> = ({ onSubmit }) => {
    const [name, setName] = useState('');
    const [ip, setIp] = useState('');
    const [os, setOs] = useState('');
    const [services, setServices] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [value, setValue] = useState<number | ''>('');

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setServices(Array.from(e.target.selectedOptions, o => o.value));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && ip && os && value !== '') {
            onSubmit({ name, ip, os, services, description, value: Number(value) });
            setName(''); setIp(''); setOs(''); setServices([]); setDescription(''); setValue('');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto p-2 bg-white"
        >
            <h2 className="text-lg font-semibold text-center mb-3">Add Asset</h2>
            <div className="flex flex-wrap gap-4 mb-2">
                <div className={sectionClass}>
                    <label className={labelClass}>
                        Host/Device Name:
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            className={inputClass}
                        />
                    </label>
                </div>
                <div className={sectionClass}>
                    <label className={labelClass}>
                        IP Address:
                        <input
                            type="text"
                            value={ip}
                            onChange={e => setIp(e.target.value)}
                            required
                            className={inputClass}
                            placeholder="e.g. 192.168.1.1"
                        />
                    </label>
                </div>
                <div className={sectionClass}>
                    <label className={labelClass}>
                        OS:
                        <select
                            value={os}
                            onChange={e => setOs(e.target.value)}
                            required
                            className={inputClass}
                        >
                            <option value="">Select OS</option>
                            {osOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className={sectionClass}>
                    <label className={labelClass}>
                        Value:
                        <input
                            type="number"
                            value={value}
                            onChange={e => setValue(e.target.value === '' ? '' : Number(e.target.value))}
                            required
                            min="0"
                            step="any"
                            className={inputClass}
                        />
                    </label>
                </div>
            </div>
            <div className="flex flex-wrap gap-4 mb-2">
                <div className={sectionClass}>
                    <label className={labelClass}>
                        Services:
                        <select
                            multiple
                            value={services}
                            onChange={handleServiceChange}
                            className={inputClass + " h-16"}
                        >
                            {serviceOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className={sectionClass + " flex-[2] min-w-[200px]"}>
                    <label className={labelClass}>
                        Notes:
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className={inputClass + " min-h-[36px]"}
                            placeholder="Additional info"
                        />
                    </label>
                </div>
            </div>
            <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition"
            >
                Save
            </button>
        </form>
    );
};

export default ManualEntryForm;
