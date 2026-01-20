'use client';

import { useState, useEffect } from 'react';
import { MapPin, Loader2, RefreshCw } from 'lucide-react';

interface LocationSelectorProps {
  value: string;
  onChange: (location: string) => void;
  onCoordinatesChange?: (coords: { latitude: number; longitude: number; elevation?: number }) => void;
}

type LocationStatus = 'idle' | 'detecting' | 'success' | 'error';

export function LocationSelector({ value, onChange, onCoordinatesChange }: LocationSelectorProps) {
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Geolocation is not supported by your browser');
      return;
    }

    setStatus('detecting');
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Call reverse geocode API to get location name
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
          } else {
            // Fallback: use coordinates directly
            onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            if (onCoordinatesChange) {
              onCoordinatesChange({ latitude, longitude });
            }
            setStatus('success');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          // Fallback: use coordinates directly
          onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          if (onCoordinatesChange) {
            onCoordinatesChange({ latitude, longitude });
          }
          setStatus('success');
        }
      },
      (error) => {
        setStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage('Location access denied. Please enable location permissions in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setErrorMessage('Location request timed out. Please try again.');
            break;
          default:
            setErrorMessage('An unknown error occurred while detecting location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  // Auto-detect location on first mount if no value is set
  useEffect(() => {
    if (!value || value === 'Jakarta') {
      detectLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
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
            ) : status === 'error' ? (
              <span className="text-destructive text-sm">{errorMessage}</span>
            ) : value ? (
              <span className="line-clamp-2">{value}</span>
            ) : (
              <span className="text-muted-foreground">Click detect to find your location</span>
            )}
          </div>
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Detect/Refresh Button */}
      <button
        onClick={detectLocation}
        disabled={status === 'detecting'}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        {status === 'detecting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Detecting...
          </>
        ) : status === 'success' ? (
          <>
            <RefreshCw className="w-4 h-4" />
            Update Location
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            Detect My Location
          </>
        )}
      </button>

      {/* Status Indicator */}
      {status === 'success' && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <span>✓</span> Location detected successfully
        </p>
      )}
    </div>
  );
}
