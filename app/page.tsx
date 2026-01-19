'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="text-6xl mb-4">🕌</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Prayer Calendar
            </h1>
            <p className="text-xl text-gray-600">
              Sinkronkan Jadwal Sholat ke Google Calendar Anda
            </p>
          </div>

          {/* Login Button */}
          <div className="mb-12">
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="px-8 py-4 bg-white text-gray-800 rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow flex items-center gap-3 mx-auto"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Login dengan Google
            </button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="font-semibold mb-2">Otomatis Sync Setiap Hari</h3>
              <p className="text-sm text-gray-600">
                Jadwal sholat otomatis ditambahkan ke kalender Anda
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">🔔</div>
              <h3 className="font-semibold mb-2">Reminder 10 Menit Sebelum Adzan</h3>
              <p className="text-sm text-gray-600">
                Notifikasi email dan popup otomatis
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-3">🇮🇩</div>
              <h3 className="font-semibold mb-2">Support Semua Kota di Indonesia</h3>
              <p className="text-sm text-gray-600">
                Menggunakan metode perhitungan Kemenag RI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
