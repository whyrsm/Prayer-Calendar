'use client';

import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { format } from 'date-fns';

interface PrayerTimesPreviewProps {
  city?: string;
  latitude?: number;
  longitude?: number;
}

const PRAYER_ICONS: Record<string, string> = {
  Fajr: '🌅',
  Dhuhr: '☀️',
  Asr: '🌤️',
  Maghrib: '🌆',
  Isha: '🌙',
};

const PRAYER_NAMES: Record<string, string> = {
  Fajr: 'Subuh',
  Dhuhr: 'Dzuhur',
  Asr: 'Ashar',
  Maghrib: 'Maghrib',
  Isha: 'Isya',
};

export function PrayerTimesPreview({ city, latitude, longitude }: PrayerTimesPreviewProps) {
  const { data, isLoading, error } = usePrayerTimes({ city, latitude, longitude });

  // Show waiting state if no location yet
  if (!city && latitude === undefined) {
    return (
      <div className="glass-panel rounded-2xl p-8 w-full">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mb-4 animate-pulse">
            📍
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Waiting for Location</h3>
          <p className="text-sm text-muted-foreground">
            Please allow location access to see your local prayer times
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-8 w-full animate-pulse">
        <div className="h-8 bg-muted rounded w-2/3 mb-8"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-6 bg-muted rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="glass-panel p-8 rounded-2xl border-l-4 border-red-500 text-red-600 bg-red-50/50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">❌</span>
          <span className="font-medium">Failed to load prayer times</span>
        </div>
      </div>
    );
  }

  const today = new Date();
  const prayerData = data.data;
  const locationName = data.location?.city || city || 'Your Location';

  return (
    <div className="glass-panel rounded-2xl p-8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Prayer Schedule
          </h2>
          <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            {format(today, 'EEEE, d MMM')}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            {prayerData.date.hijri.day} {prayerData.date.hijri.month.en} {prayerData.date.hijri.year} • {locationName}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => (
          <div
            key={prayer}
            className="group flex justify-between items-center p-4 rounded-xl hover:bg-white/50 transition-all duration-300 border border-transparent hover:border-primary/10 hover:shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                {PRAYER_ICONS[prayer]}
              </div>
              <span className="font-medium text-lg text-foreground">
                {PRAYER_NAMES[prayer] || prayer}
              </span>
            </div>
            <span className="text-2xl font-bold font-mono tracking-tight text-primary">
              {prayerData.timings[prayer]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
