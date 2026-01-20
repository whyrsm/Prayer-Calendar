import { useQuery } from '@tanstack/react-query';

interface UsePrayerTimesOptions {
  city?: string;
  latitude?: number;
  longitude?: number;
}

export function usePrayerTimes(options: UsePrayerTimesOptions) {
  const { city, latitude, longitude } = options;

  // Enable query only if we have coordinates OR a city name
  const hasLocation = (latitude !== undefined && longitude !== undefined) || !!city;

  return useQuery({
    queryKey: ['prayer-times', city, latitude, longitude],
    queryFn: async () => {
      const params = new URLSearchParams();

      // Prefer coordinates if available
      if (latitude !== undefined && longitude !== undefined) {
        params.set('latitude', latitude.toString());
        params.set('longitude', longitude.toString());
        if (city) {
          params.set('city', city);
        }
      } else if (city) {
        params.set('city', city);
      }

      const response = await fetch(`/api/prayer-times?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch prayer times');
      return response.json();
    },
    enabled: hasLocation,
  });
}
