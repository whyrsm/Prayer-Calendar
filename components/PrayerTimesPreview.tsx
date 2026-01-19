'use client';

import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { format } from 'date-fns';

interface PrayerTimesPreviewProps {
  city: string;
}

const PRAYER_ICONS: Record<string, string> = {
  Fajr: '🌅',
  Dhuhr: '☀️',
  Asr: '🌤️',
  Maghrib: '🌅',
  Isha: '🌙',
};

export function PrayerTimesPreview({ city }: PrayerTimesPreviewProps) {
  const { data, isLoading, error } = usePrayerTimes(city);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="bg-red-50 rounded-lg p-6 text-red-600">
        ❌ Failed to load prayer times
      </div>
    );
  }

  const today = new Date();
  const prayerData = data.data;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">
        Jadwal Sholat - {format(today, 'EEEE, d MMM yyyy')}
      </h3>
      <div className="space-y-3">
        {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
          <div key={prayer} className="flex justify-between items-center py-2 border-b">
            <span className="flex items-center gap-2">
              <span className="text-2xl">{PRAYER_ICONS[prayer]}</span>
              <span className="font-medium">{prayer}</span>
            </span>
            <span className="text-lg font-bold text-blue-600">
              {prayerData.timings[prayer]}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>📅 {prayerData.date.hijri.date} {prayerData.date.hijri.month.en} {prayerData.date.hijri.year} Hijri</p>
      </div>
    </div>
  );
}
