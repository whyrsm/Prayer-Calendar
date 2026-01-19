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
  const [selectedCity, setSelectedCity] = useState('Jakarta');

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🕌</span>
            <h1 className="text-xl font-bold">Prayer Calendar</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session?.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Location Selector */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <LocationSelector value={selectedCity} onChange={setSelectedCity} />
          </div>

          {/* Prayer Times Preview */}
          <PrayerTimesPreview city={selectedCity} />

          {/* Sync Controls */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Sync to Google Calendar</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <SyncButton type="today" label="Sync Hari Ini" />
              <SyncButton type="month" label="Sync Bulan Ini" />
              <SyncButton type="year" label="Sync Tahun Ini" />
            </div>
          </div>

          {/* Sync Status */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Sync Status</h2>
            <SyncStatus />
          </div>

          {/* Info */}
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
            <p className="font-medium mb-2">ℹ️ Informasi</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Jadwal sholat akan otomatis sync setiap jam 11 malam WIB</li>
              <li>Reminder akan muncul 10 menit sebelum waktu adzan</li>
              <li>Menggunakan metode perhitungan Kemenag Indonesia</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
