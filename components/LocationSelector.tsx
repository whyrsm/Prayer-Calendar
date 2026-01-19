'use client';

import { INDONESIAN_CITIES } from '@/lib/constants/cities';

interface LocationSelectorProps {
  value: string;
  onChange: (city: string) => void;
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  return (
    <div className="relative group">
      <label className="absolute -top-2.5 left-4 bg-background px-2 text-xs font-semibold text-primary z-10 transition-colors group-hover:text-primary/70 rounded-full">
        City / Location
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-card/50 backdrop-blur-md px-6 py-4 rounded-xl border border-border text-foreground text-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-all font-medium shadow-sm"
        >
          {INDONESIAN_CITIES.map((city) => (
            <option key={city.name} value={city.name} className="text-foreground bg-background">
              {city.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
}
