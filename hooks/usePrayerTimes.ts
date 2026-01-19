import { useQuery } from '@tanstack/react-query';

export function usePrayerTimes(city: string) {
  return useQuery({
    queryKey: ['prayer-times', city],
    queryFn: async () => {
      const response = await fetch(`/api/prayer-times?city=${city}`);
      if (!response.ok) throw new Error('Failed to fetch prayer times');
      return response.json();
    },
    enabled: !!city,
  });
}
