'use client';

import { INDONESIAN_CITIES } from '@/lib/constants/cities';

interface LocationSelectorProps {
  value: string;
  onChange: (city: string) => void;
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">📍 Lokasi:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {INDONESIAN_CITIES.map((city) => (
          <option key={city.name} value={city.name}>
            {city.name}
          </option>
        ))}
      </select>
    </div>
  );
}
