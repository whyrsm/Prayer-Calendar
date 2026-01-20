'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SyncButtonProps {
  type: 'today' | 'week';
  label: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export function SyncButton({ type, label, city, latitude, longitude }: SyncButtonProps) {
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);

  const { mutate: sync, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          city,
          latitude,
          longitude,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleSync = () => {
    sync();
  };

  return (
    <button
      onClick={handleSync}
      disabled={isPending || !city}
      className={`
        w-full group relative overflow-hidden px-6 py-4 rounded-xl font-bold transition-all duration-300
        ${isPending
          ? 'bg-muted text-muted-foreground cursor-wait'
          : showSuccess
            ? 'bg-green-100 text-green-700 border-green-200'
            : !city
              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md'
        }
      `}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        {isPending ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Syncing Schedule...</span>
          </>
        ) : showSuccess ? (
          <>
            <span className="text-xl">✓</span>
            <span>Synced Successfully</span>
          </>
        ) : !city ? (
          <span>Select a location first</span>
        ) : (
          <>
            <span>{label}</span>
          </>
        )}
      </div>
    </button>
  );
}
