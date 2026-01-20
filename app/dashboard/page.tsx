'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LocationSelector } from '@/components/LocationSelector';
import { PrayerTimesPreview } from '@/components/PrayerTimesPreview';
import { SyncButton } from '@/components/SyncButton';
import { SyncStatus } from '@/components/SyncStatus';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('');
  const [locationCoords, setLocationCoords] = useState<{
    latitude: number;
    longitude: number;
    elevation?: number;
  } | null>(null);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full shadow-lg"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      {/* Decorative Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-secondary/5 blur-3xl opacity-50"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🕌</span>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Prayer Calendar
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-muted-foreground hidden md:block">
              {session?.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-full transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">

          <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Prayer Times (Content) */}
            <div className="lg:col-span-7 space-y-8 animate-slide-up">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Today's Schedule</h2>
                <div className="md:hidden">
                  {/* Mobile Location Selector placeholder if needed, but sticking to sidebar for now */}
                </div>
              </div>
              <PrayerTimesPreview
                city={selectedCity}
                latitude={locationCoords?.latitude}
                longitude={locationCoords?.longitude}
              />

              <div className="hidden lg:block">
                <SyncStatus />
              </div>
            </div>

            {/* Right Column: Controls (Sidebar) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 animate-slide-up" style={{ animationDelay: '100ms' }}>

              {/* Location Card */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <h3 className="font-semibold text-lg">Location Settings</h3>
                <LocationSelector
                  value={selectedCity}
                  onChange={setSelectedCity}
                  onCoordinatesChange={setLocationCoords}
                />
                <p className="text-xs text-muted-foreground pt-2">
                  {locationCoords
                    ? `📍 ${locationCoords.latitude.toFixed(4)}°, ${locationCoords.longitude.toFixed(4)}° ${locationCoords.elevation ? `• ${locationCoords.elevation}m` : ''}`
                    : 'Selecting a city will update prayer times immediately.'
                  }
                </p>
              </div>

              {/* Sync Actions Card */}
              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg">Calendar Sync</h3>
                </div>

                <div className="space-y-3">
                  <SyncButton type="today" label="Sync Today Only" />
                  <SyncButton type="week" label="Sync This Week" />
                  <div className="grid grid-cols-2 gap-3">
                    <SyncButton type="month" label="This Month" />
                    <SyncButton type="year" label="Full Year" />
                  </div>
                </div>

                <div className="pt-4 border-t border-border mt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Sync Information</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span>🔄</span> Automatic sync occurs daily at 11 PM
                    </li>
                    <li className="flex gap-2">
                      <span>🔔</span> Reminders set 10 mins before Adzan
                    </li>
                  </ul>
                </div>
              </div>

              {/* Mobile Only Status (visible only on small screens) */}
              <div className="lg:hidden">
                <SyncStatus />
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
