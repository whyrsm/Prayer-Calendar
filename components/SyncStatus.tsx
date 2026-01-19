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
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[latestSync.status as keyof typeof statusColors]
            }`}
          >
            {statusIcons[latestSync.status as keyof typeof statusIcons]} {latestSync.status}
          </span>
          <span className="text-sm text-gray-600">
            {format(new Date(latestSync.createdAt), 'MMM d, yyyy HH:mm')}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          Created: {latestSync.eventsCreated} | Failed: {latestSync.eventsFailed}
        </div>
      </div>
    </div>
  );
}
