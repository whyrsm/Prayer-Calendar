'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, RefreshCw, Search, X } from 'lucide-react';

interface LocationSelectorProps {
  value: string;
  onChange: (location: string) => void;
  onCoordinatesChange?: (coords: { latitude: number; longitude: number; elevation?: number }) => void;
}

interface LocationSuggestion {
  displayName: string;
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

type LocationStatus = 'idle' | 'detecting' | 'success' | 'error' | 'searching';

export function LocationSelector({ value, onChange, onCoordinatesChange }: LocationSelectorProps) {
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search for suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'PrayerCalendarApp/1.0',
          },
        }
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        const formattedSuggestions: LocationSuggestion[] = data.map((item: any) => {
          const address = item.address || {};
          const city = address.city || address.town || address.village || address.municipality || address.county;
          const state = address.state || address.province || address.region;
          const country = address.country;

          const parts = [city, state, country].filter(Boolean);
          const displayName = parts.join(', ') || item.display_name;

          return {
            displayName,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            city,
            country,
          };
        });
        setSuggestions(formattedSuggestions);
        setShowSuggestions(formattedSuggestions.length > 0);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the API call
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  };

  // Select a suggestion
  const selectSuggestion = (suggestion: LocationSuggestion) => {
    onChange(suggestion.displayName);
    if (onCoordinatesChange) {
      onCoordinatesChange({
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
      });
    }
    setStatus('success');
    setShowSearch(false);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Geolocation is not supported by your browser');
      setShowSearch(true);
      return;
    }

    setStatus('detecting');
    setErrorMessage('');
    setShowSuggestions(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `/api/geocode?lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data.success && data.location) {
            onChange(data.location.displayName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            if (onCoordinatesChange) {
              onCoordinatesChange({
                latitude,
                longitude,
              });
            }
            setStatus('success');
            setShowSearch(false);
          } else {
            onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            if (onCoordinatesChange) {
              onCoordinatesChange({ latitude, longitude });
            }
            setStatus('success');
            setShowSearch(false);
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          if (onCoordinatesChange) {
            onCoordinatesChange({ latitude, longitude });
          }
          setStatus('success');
          setShowSearch(false);
        }
      },
      (error) => {
        setStatus('error');
        setShowSearch(true);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage('Location access denied. Search manually below.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('Location unavailable. Search manually below.');
            break;
          case error.TIMEOUT:
            setErrorMessage('Location timeout. Search manually below.');
            break;
          default:
            setErrorMessage('Location error. Search manually below.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // If there are suggestions, select the first one
    if (suggestions.length > 0) {
      selectSuggestion(suggestions[0]);
      return;
    }

    setStatus('searching');
    setShowSuggestions(false);

    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.success && data.data) {
        onChange(data.data.displayName || searchQuery);
        if (onCoordinatesChange) {
          onCoordinatesChange({
            latitude: data.data.latitude,
            longitude: data.data.longitude,
          });
        }
        setStatus('success');
        setShowSearch(false);
        setSearchQuery('');
      } else {
        setStatus('error');
        setErrorMessage('Location not found. Try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setStatus('error');
      setErrorMessage('Search failed. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSearch(false);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-detect location on first mount if no value is set
  useEffect(() => {
    if (!value) {
      detectLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus input when search mode is activated
  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showSearch]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Location Display */}
      <div className="relative group">
        <label className="absolute -top-2.5 left-4 bg-background px-2 text-xs font-semibold text-primary z-10 rounded-full">
          Your Location
        </label>
        <div className="relative">
          <div className="w-full bg-card/50 backdrop-blur-md pl-12 pr-4 py-4 rounded-xl border border-border text-foreground font-medium shadow-sm min-h-[56px] flex items-center">
            {status === 'detecting' ? (
              <span className="text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Detecting your location...
              </span>
            ) : status === 'searching' ? (
              <span className="text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </span>
            ) : status === 'error' && !value ? (
              <span className="text-amber-600 text-sm">{errorMessage}</span>
            ) : value ? (
              <span className="line-clamp-2">{value}</span>
            ) : (
              <span className="text-muted-foreground">Click detect or search for your location</span>
            )}
          </div>
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Search Input with Suggestions */}
      {showSearch && (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search city or location (e.g., Jakarta, Bandung...)"
            className="w-full bg-card/50 backdrop-blur-md pl-12 pr-12 py-3 rounded-xl border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 transition-all font-medium shadow-sm"
            disabled={status === 'searching'}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

          {/* Loading or Clear button */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isLoadingSuggestions ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            ) : null}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.latitude}-${suggestion.longitude}-${index}`}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex items-center gap-3 border-b border-border/50 last:border-b-0"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{suggestion.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.latitude.toFixed(4)}°, {suggestion.longitude.toFixed(4)}°
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* Detect Button */}
        <button
          onClick={detectLocation}
          disabled={status === 'detecting' || status === 'searching'}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {status === 'detecting' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Detecting...
            </>
          ) : status === 'success' && value ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Detect
            </>
          )}
        </button>

        {/* Search Button */}
        {showSearch ? (
          <button
            onClick={handleSearch}
            disabled={status === 'searching' || !searchQuery.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {status === 'searching' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            disabled={status === 'detecting'}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border border-border hover:bg-card transition-all shadow-sm"
          >
            <Search className="w-4 h-4" />
            Manual Search
          </button>
        )}
      </div>

      {/* Status Indicator */}
      {status === 'success' && value && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <span>✓</span> Location set successfully
        </p>
      )}
    </div>
  );
}
