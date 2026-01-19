'use client';

import { INDONESIAN_CITIES } from '@/lib/constants/cities';
import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, X } from 'lucide-react';

interface LocationSelectorProps {
  value: string;
  onChange: (location: string) => void;
  onCoordinatesChange?: (coords: { latitude: number; longitude: number; elevation?: number }) => void;
}

export function LocationSelector({ value, onChange, onCoordinatesChange }: LocationSelectorProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter preset cities based on input
  const filteredCities = INDONESIAN_CITIES.filter(city =>
    city.name.toLowerCase().includes(customLocation.toLowerCase())
  );

  const handlePresetSelect = (cityName: string) => {
    const city = INDONESIAN_CITIES.find(c => c.name === cityName);
    if (city && onCoordinatesChange) {
      onCoordinatesChange({
        latitude: city.latitude,
        longitude: city.longitude,
        elevation: city.elevation,
      });
    }
    onChange(cityName);
    setIsCustomMode(false);
    setShowSuggestions(false);
  };

  const handleCustomLocationSearch = async () => {
    if (!customLocation.trim()) return;

    setIsSearching(true);
    try {
      // First check if it matches a preset city
      const presetCity = INDONESIAN_CITIES.find(
        c => c.name.toLowerCase() === customLocation.toLowerCase()
      );

      if (presetCity) {
        handlePresetSelect(presetCity.name);
        return;
      }

      // Otherwise, geocode it
      const response = await fetch(
        `/api/prayer-times?city=${encodeURIComponent(customLocation)}`
      );
      const data = await response.json();

      if (data.success && data.location) {
        onChange(customLocation);
        if (onCoordinatesChange) {
          onCoordinatesChange({
            latitude: data.location.latitude,
            longitude: data.location.longitude,
            elevation: data.location.elevation,
          });
        }
        setIsCustomMode(false);
      } else {
        alert('Location not found. Please try a different location.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Failed to search location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomLocation(e.target.value);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCustomLocationSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isCustomMode) {
    return (
      <div className="space-y-3">
        <div className="relative group" ref={inputRef}>
          <label className="absolute -top-2.5 left-4 bg-background px-2 text-xs font-semibold text-primary z-10 rounded-full">
            Search Location
          </label>
          <div className="relative">
            <input
              type="text"
              value={customLocation}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Type city name (e.g., Bogor, Depok, Tangerang...)"
              className="w-full bg-card/50 backdrop-blur-md pl-12 pr-12 py-4 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-all font-medium shadow-sm"
              disabled={isSearching}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            {customLocation && (
              <button
                onClick={() => {
                  setCustomLocation('');
                  setShowSuggestions(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && filteredCities.length > 0 && customLocation && (
            <div className="absolute z-20 w-full mt-2 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredCities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    setCustomLocation(city.name);
                    handlePresetSelect(city.name);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex items-center gap-2 border-b border-border last:border-b-0"
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium">{city.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {city.timezone}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCustomLocationSearch}
            disabled={isSearching || !customLocation.trim()}
            className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={() => {
              setIsCustomMode(false);
              setCustomLocation('');
              setShowSuggestions(false);
            }}
            className="px-4 py-2.5 rounded-lg font-medium border border-border hover:bg-card transition-all"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          💡 Tip: You can type any city in Indonesia or worldwide
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative group">
        <label className="absolute -top-2.5 left-4 bg-background px-2 text-xs font-semibold text-primary z-10 transition-colors group-hover:text-primary/70 rounded-full">
          City / Location
        </label>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => handlePresetSelect(e.target.value)}
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

      <button
        onClick={() => setIsCustomMode(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all"
      >
        <Search className="w-4 h-4" />
        Search Custom Location
      </button>
    </div>
  );
}
