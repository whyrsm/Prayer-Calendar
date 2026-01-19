import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { type: 'today' | 'tomorrow' | 'week' | 'month' | 'year' }) => {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync failed');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate sync status to refetch latest
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
    },
  });
}
