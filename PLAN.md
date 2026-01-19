# Prayer Calendar - Implementation Plan

## Overview
Aplikasi Node.js/TypeScript yang menyinkronkan jadwal sholat dari Aladhan API ke Google Calendar dengan fitur reminder otomatis.

## Tech Stack
- **Runtime**: Node.js dengan TypeScript
- **API Source**: Aladhan API (gratis, mendukung metode Kemenag Indonesia)
- **Target**: Google Calendar API dengan OAuth2
- **Scheduler**: node-cron dengan Railway hosting
- **Hosting**: Railway (free tier available)

## User Configuration
- **Lokasi**: Dinamis sesuai input user (kota Indonesia)
- **Reminder**: 10 menit sebelum waktu sholat
- **Metode**: Kemenag Indonesia (method 20)

## Project Structure
```
prayer-calendar/
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Landing/home page
│   ├── dashboard/
│   │   └── page.tsx                # Main dashboard (protected)
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts        # NextAuth Google OAuth
│   │   ├── prayer-times/
│   │   │   └── route.ts            # GET prayer times preview
│   │   ├── sync/
│   │   │   └── route.ts            # POST trigger sync
│   │   └── cron/
│   │       └── route.ts            # Cron endpoint for Railway
│   └── globals.css
├── components/
│   ├── LocationSelector.tsx        # Dropdown pilih kota
│   ├── PrayerTimesPreview.tsx      # Tampilkan jadwal hari ini
│   ├── SyncButton.tsx              # Tombol sync manual
│   ├── SyncStatus.tsx              # Status terakhir sync
│   ├── LoginButton.tsx             # Google OAuth login
│   └── Providers.tsx               # React Query + Session provider
├── hooks/
│   ├── usePrayerTimes.ts           # Query hook untuk jadwal sholat
│   ├── useSync.ts                  # Mutation hook untuk sync
│   └── useSyncStatus.ts            # Query hook untuk sync history
├── lib/
│   ├── aladhan/
│   │   ├── client.ts               # HTTP client untuk Aladhan API
│   │   └── types.ts                # Interface untuk prayer times
│   ├── google-calendar/
│   │   ├── client.ts               # Calendar event management
│   │   └── types.ts                # Calendar types
│   ├── sync/
│   │   ├── daily-sync.ts           # Sync harian
│   │   └── monthly-sync.ts         # Sync bulanan/tahunan
│   ├── constants/
│   │   └── cities.ts               # List 10 kota Indonesia
│   ├── auth.ts                     # NextAuth configuration
│   └── db.ts                       # Prisma client instance
├── .env.example
├── .gitignore
├── package.json
├── next.config.js
└── tailwind.config.js
```

## Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next-auth": "^4.24.0",
    "@prisma/client": "^5.7.0",
    "googleapis": "^131.0.0",
    "axios": "^1.6.0",
    "date-fns": "^3.0.0",
    "date-fns-tz": "^2.0.0",
    "zod": "^3.22.4",
    "lucide-react": "^0.294.0",
    "@tanstack/react-query": "^5.17.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "prisma": "^5.7.0",
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## Implementation Steps

### Phase 1: Project Setup
1. Create Next.js project dengan TypeScript
   ```bash
   npx create-next-app@latest prayer-calendar --typescript --tailwind --app
   ```
2. Install additional dependencies
   ```bash
   npm install next-auth @prisma/client googleapis axios date-fns date-fns-tz zod lucide-react @tanstack/react-query
   npm install -D prisma
   ```
3. Setup Prisma
   ```bash
   npx prisma init
   # Edit prisma/schema.prisma sesuai schema di bawah
   npx prisma db push
   ```
4. Setup folder structure sesuai project structure di atas

### Phase 2: Google OAuth & NextAuth Setup
1. Buat project di Google Cloud Console
2. Enable Google Calendar API
3. Buat OAuth 2.0 credentials (Web application)
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Setup NextAuth dengan Google Provider:
   ```typescript
   // lib/auth.ts
   export const authOptions: NextAuthOptions = {
     providers: [
       GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
         authorization: {
           params: {
             scope: "openid email profile https://www.googleapis.com/auth/calendar",
             access_type: "offline",
             prompt: "consent",
           },
         },
       }),
     ],
     callbacks: {
       async jwt({ token, account }) {
         if (account) {
           token.accessToken = account.access_token;
           token.refreshToken = account.refresh_token;
         }
         return token;
       },
     },
   };
   ```
5. Implement `/api/auth/[...nextauth]/route.ts`

### Phase 3: Aladhan API Integration
1. Implement `lib/aladhan/types.ts` - prayer time interfaces
2. Implement `lib/aladhan/client.ts`:
   - `getDailyTimings(city, date)` - waktu sholat hari tertentu
   - `getMonthlyCalendar(city, year, month)` - kalender bulanan
3. Buat API route `/api/prayer-times` untuk fetch & return jadwal

### Phase 4: Google Calendar Sync Services
1. Implement `lib/google-calendar/client.ts`:
   - `createPrayerEvent()` - buat event dengan reminder
   - `listPrayerEvents()` - list existing events
   - `deletePrayerEvents()` - hapus events (untuk re-sync)
2. Implement `lib/sync/daily-sync.ts` & `monthly-sync.ts`
3. Buat API routes:
   - `POST /api/sync` - trigger manual sync
   - `GET /api/cron` - endpoint untuk scheduled sync

### Phase 5: Frontend Dashboard
1. **Landing Page** (`app/page.tsx`):
   - Hero section dengan deskripsi app
   - Login with Google button
   - Redirect ke dashboard jika sudah login

2. **Dashboard** (`app/dashboard/page.tsx`):
   - **Location Selector**: Dropdown pilih kota Indonesia
   - **Prayer Times Preview**: Tampilkan jadwal hari ini (Subuh, Dzuhur, Ashar, Maghrib, Isya)
   - **Sync Controls**:
     - Tombol "Sync Hari Ini"
     - Tombol "Sync Minggu Ini" (Weekly)
     - Tombol "Sync Bulan Ini"
     - Tombol "Sync Tahun Ini"
   - **Sync Status**: Tampilkan last sync time & status
   - **Logout button**

3. **Components**:
   ```
   LocationSelector.tsx  - Dropdown dengan list kota Indonesia
   PrayerTimesPreview.tsx - Card menampilkan 5 waktu sholat
   SyncButton.tsx        - Button dengan loading state
   SyncStatus.tsx        - Badge sukses/error + timestamp
   ```

4. **Styling**: Tailwind CSS dengan design clean & minimal

5. **React Query Setup**:
   ```typescript
   // app/providers.tsx
   'use client'
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

   const queryClient = new QueryClient({
     defaultOptions: {
       queries: {
         staleTime: 5 * 60 * 1000, // 5 minutes cache
         refetchOnWindowFocus: false,
       },
     },
   })

   export function Providers({ children }) {
     return (
       <QueryClientProvider client={queryClient}>
         {children}
       </QueryClientProvider>
     )
   }
   ```

6. **Custom Hooks**:
   ```typescript
   // hooks/usePrayerTimes.ts
   export function usePrayerTimes(city: string) {
     return useQuery({
       queryKey: ['prayer-times', city],
       queryFn: () => fetch(`/api/prayer-times?city=${city}`).then(r => r.json()),
     })
   }

   // hooks/useSync.ts
   export function useSync() {
     const queryClient = useQueryClient()
     return useMutation({
       mutationFn: (data: { type: 'daily' | 'monthly' | 'yearly' }) =>
         fetch('/api/sync', { method: 'POST', body: JSON.stringify(data) }),
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['sync-status'] })
       },
     })
   }
   ```

### Phase 6: Railway Deployment
1. Buat account Railway (railway.app)
2. Connect GitHub repository
3. Set environment variables:
   ```
   GOOGLE_CLIENT_ID=xxx
   GOOGLE_CLIENT_SECRET=xxx
   NEXTAUTH_SECRET=xxx
   NEXTAUTH_URL=https://your-app.railway.app
   DATABASE_URL=xxx (auto-provided by Railway PostgreSQL)
   ```
4. Deploy - Railway auto-detect Next.js
5. Setup External Cron:
   - Daftar di [cron-job.org](https://cron-job.org) (gratis)
   - Buat cron job baru:
     - URL: `https://your-app.railway.app/api/cron`
     - Schedule: `0 23 * * *` (11 PM WIB every day)
     - Method: GET
   - Endpoint `/api/cron` akan sync tomorrow's prayer times untuk semua users

## Indonesian Cities List

Hardcoded di `lib/constants/cities.ts`:

```typescript
export const INDONESIAN_CITIES = [
  { name: 'Jakarta', timezone: 'Asia/Jakarta' },
  { name: 'Bandung', timezone: 'Asia/Jakarta' },
  { name: 'Surabaya', timezone: 'Asia/Jakarta' },
  { name: 'Yogyakarta', timezone: 'Asia/Jakarta' },
  { name: 'Semarang', timezone: 'Asia/Jakarta' },
  { name: 'Medan', timezone: 'Asia/Jakarta' },
  { name: 'Makassar', timezone: 'Asia/Makassar' },
  { name: 'Palembang', timezone: 'Asia/Jakarta' },
  { name: 'Bali', timezone: 'Asia/Makassar' },
  { name: 'Malang', timezone: 'Asia/Jakarta' },
] as const;

export type CityName = typeof INDONESIAN_CITIES[number]['name'];
```

## Auto-Sync Strategy

**Global Auto-Sync: 11 PM WIB setiap hari**

1. External cron (cron-job.org) hit `/api/cron` setiap jam 11 malam
2. Endpoint `/api/cron` akan:
   - Query semua users dengan `autoSyncEnabled = true`
   - Untuk setiap user:
     - Fetch tomorrow's prayer times dari Aladhan API berdasarkan city preference
     - Sync ke Google Calendar user tersebut
     - Log hasil sync ke `SyncLog` table
3. Rate limiting: 500ms delay antar user untuk avoid API throttling

```typescript
// app/api/cron/route.ts
export async function GET(req: Request) {
  // Verify cron request (optional: add secret header)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: { preferences: { autoSyncEnabled: true } },
    include: { preferences: true },
  });

  const tomorrow = addDays(new Date(), 1);

  for (const user of users) {
    try {
      await syncDailyForUser(user, tomorrow);
      await delay(500); // Rate limiting
    } catch (error) {
      logger.error(`Sync failed for ${user.email}:`, error);
    }
  }

  return Response.json({ synced: users.length });
}
```

## Configuration (.env)
```bash
# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Prayer Settings (defaults, can override per user)
DEFAULT_CALCULATION_METHOD=20  # Kemenag Indonesia
DEFAULT_SCHOOL=0               # 0=Shafi, 1=Hanafi
DEFAULT_REMINDER_MINUTES=10    # 10 menit sebelum adzan

# Cron Secret (untuk protect cron endpoint)
CRON_SECRET=your-random-secret-key

# Database (auto-provided by Railway)
DATABASE_URL=postgresql://...
```

## UI Wireframe

### Landing Page
```
┌─────────────────────────────────────────────┐
│  🕌 Prayer Calendar                         │
├─────────────────────────────────────────────┤
│                                             │
│     Sinkronkan Jadwal Sholat ke             │
│        Google Calendar Anda                 │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │   🔵 Login dengan Google            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ✓ Otomatis sync setiap hari               │
│  ✓ Reminder 10 menit sebelum adzan         │
│  ✓ Support semua kota di Indonesia         │
│                                             │
└─────────────────────────────────────────────┘
```

### Dashboard
```
┌─────────────────────────────────────────────┐
│  🕌 Prayer Calendar      [user@email] [↪]  │
├─────────────────────────────────────────────┤
│                                             │
│  📍 Lokasi: [Jakarta          ▼]           │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Jadwal Sholat - Minggu, 19 Jan 2026│   │
│  ├─────────────────────────────────────┤   │
│  │  🌅 Subuh      04:42                │   │
│  │  ☀️ Dzuhur     11:58                │   │
│  │  🌤️ Ashar      15:21                │   │
│  │  🌅 Maghrib    18:12                │   │
│  │  🌙 Isya       19:26                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │Sync Hari │ │Sync Bulan│ │Sync Tahun│   │
│  │   Ini    │ │   Ini    │ │   Ini    │   │
│  └──────────┘ └──────────┘ └──────────┘   │
│                                             │
│  ✓ Last sync: 19 Jan 2026, 08:30          │
│                                             │
└─────────────────────────────────────────────┘
```

## Key Features
1. **Google OAuth Login**: Login dengan akun Google, langsung akses Calendar API
2. **Pilih Lokasi**: Dropdown kota-kota Indonesia
3. **Preview Jadwal**: Lihat jadwal sholat hari ini sebelum sync
4. **5 Waktu Sholat**: Subuh, Dzuhur, Ashar, Maghrib, Isya
5. **Reminder 10 menit**: Notifikasi popup & email sebelum adzan
6. **Flexible Sync**: Sync hari ini, minggu ini, bulan ini, atau setahun penuh
7. **Auto Sync**: Cron job untuk sync otomatis setiap hari
8. **Duplikat Prevention**: Event ID deterministik, tidak ada duplicate
9. **Color Coding**: Setiap waktu sholat punya warna berbeda di calendar
10. **Hijri Date**: Deskripsi event include tanggal Hijriah

## Verification Plan
1. `npm run dev` - jalankan app di localhost:3000
2. Test Google OAuth login - pastikan redirect & token tersimpan
3. Test pilih lokasi - pastikan dropdown berfungsi & fetch jadwal berhasil
4. Test "Sync Hari Ini" - cek event muncul di Google Calendar
5. Verifikasi reminder muncul 10 menit sebelum waktu sholat
6. Test "Sync Bulan Ini" - cek semua event bulan tersinkron
7. Deploy ke Railway & test production URL
8. Setup cron & verifikasi auto-sync berjalan

## Database Schema (Prisma + PostgreSQL)

Railway menyediakan free PostgreSQL. Gunakan Prisma sebagai ORM.

### Setup
```bash
npm install prisma @prisma/client
npx prisma init
```

### Schema (`prisma/schema.prisma`)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User dari NextAuth
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?

  // Google OAuth tokens
  accessToken   String?
  refreshToken  String?
  tokenExpiry   DateTime?

  // Preferences
  preferences   UserPreferences?

  // Sync history
  syncLogs      SyncLog[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// User preferences untuk lokasi & reminder
model UserPreferences {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  city            String   @default("Jakarta")
  country         String   @default("Indonesia")
  timezone        String   @default("Asia/Jakarta")
  calculationMethod Int    @default(20)  // Kemenag Indonesia
  school          Int      @default(0)   // 0=Shafi, 1=Hanafi
  reminderMinutes Int      @default(10)

  // Auto sync settings
  autoSyncEnabled Boolean  @default(true)
  autoSyncTime    String   @default("23:00")  // Jam untuk auto sync

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Log setiap sync yang dilakukan
model SyncLog {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  syncType    SyncType  // DAILY, MONTHLY, YEARLY
  startDate   DateTime  // Tanggal mulai sync
  endDate     DateTime  // Tanggal akhir sync

  status      SyncStatus
  eventsCreated Int     @default(0)
  eventsUpdated Int     @default(0)
  eventsFailed  Int     @default(0)

  errorMessage String?

  createdAt   DateTime  @default(now())
}

enum SyncType {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
}

enum SyncStatus {
  PENDING
  IN_PROGRESS
  SUCCESS
  PARTIAL_SUCCESS
  FAILED
}
```

### Updated Project Structure
```
prayer-calendar/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration files
├── lib/
│   └── db.ts                   # Prisma client instance
...
```

### Prisma Client (`lib/db.ts`)
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Updated Dependencies
```json
{
  "dependencies": {
    "prisma": "^5.7.0",
    "@prisma/client": "^5.7.0"
  }
}
```

### Railway PostgreSQL Setup
1. Di Railway dashboard, klik "+ New" → "Database" → "PostgreSQL"
2. Copy `DATABASE_URL` dari PostgreSQL service
3. Add ke environment variables app
4. Run `npx prisma db push` untuk create tables

## Security Notes
- `.env.local` TIDAK boleh di-commit ke git
- NEXTAUTH_SECRET harus random & strong
- Google OAuth tokens di-manage oleh NextAuth (encrypted di session)
- Gunakan Railway environment variables untuk production secrets
- Rate limiting: Aladhan API tidak ada limit, tapi tetap delay antar request