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
      className={`
        w-full group relative overflow-hidden px-6 py-4 rounded-xl font-bold transition-all duration-300
        ${isPending
          ? 'bg-muted text-muted-foreground cursor-wait'
          : showSuccess
            ? 'bg-green-100 text-green-700 border-green-200'
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
        ) : (
          <>
            <span>{label}</span>
          </>
        )}
      </div>
    </button>
  );
}
