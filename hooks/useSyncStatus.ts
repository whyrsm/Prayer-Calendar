import { useQuery } from '@tanstack/react-query';

export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync-status'],
    queryFn: async () => {
      const response = await fetch('/api/sync-status');
      if (!response.ok) throw new Error('Failed to fetch sync status');
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });
}
