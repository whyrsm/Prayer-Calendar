'use client';

import { useSync } from '@/hooks/useSync';
import { useState } from 'react';

interface SyncButtonProps {
  type: 'today' | 'tomorrow' | 'month' | 'year';
  label: string;
}

export function SyncButton({ type, label }: SyncButtonProps) {
  const { mutate: sync, isPending } = useSync();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSync = () => {
    sync(
      { type },
      {
        onSuccess: () => {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        },
      }
    );
  };

  return (
    <button
      onClick={handleSync}
      disabled={isPending}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors relative"
    >
      {isPending ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Syncing...
        </span>
      ) : showSuccess ? (
        <span className="flex items-center gap-2">
          ✓ Synced!
        </span>
      ) : (
        label
      )}
    </button>
  );
}
