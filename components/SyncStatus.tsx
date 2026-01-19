'use client';

import { useSyncStatus } from '@/hooks/useSyncStatus';
import { format } from 'date-fns';

export function SyncStatus() {
  const { data, isLoading } = useSyncStatus();

  if (isLoading || !data?.success || !data.latestSync) {
    return null;
  }

  const { latestSync } = data;
  const statusColors = {
    SUCCESS: 'bg-green-100 text-green-800',
    PARTIAL_SUCCESS: 'bg-yellow-100 text-yellow-800',
    FAILED: 'bg-red-100 text-red-800',
    PENDING: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
  };

  const statusIcons = {
    SUCCESS: '✓',
    PARTIAL_SUCCESS: '⚠️',
    FAILED: '❌',
    PENDING: '⏳',
    IN_PROGRESS: '⏳',
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
      <div className="flex items-center gap-4">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-xl
          ${statusColors[latestSync.status as keyof typeof statusColors]}
        `}>
          {statusIcons[latestSync.status as keyof typeof statusIcons]}
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider">Last Sync Status</h4>
          <p className="text-sm text-muted-foreground">
            {format(new Date(latestSync.createdAt), 'MMMM d, yyyy • HH:mm')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm font-medium">
        <div className="px-4 py-2 rounded-xl bg-green-50 text-green-700 border border-green-100">
          <span className="font-bold">{latestSync.eventsCreated}</span> Added
        </div>
        <div className="px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-100">
          <span className="font-bold">{latestSync.eventsFailed}</span> Failed
        </div>
      </div>
    </div>
  );
}
