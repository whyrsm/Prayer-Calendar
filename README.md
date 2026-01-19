# 🕌 Prayer Calendar

Automatically sync Islamic prayer times to your Google Calendar with reminders.

## Features

- ✅ **Google OAuth Login** - Login with your Google account for seamless Calendar API access
- ✅ **10 Indonesian Cities** - Choose from major cities across Indonesia
- ✅ **Prayer Times Preview** - View today's prayer schedule before syncing
- ✅ **5 Daily Prayers** - Subuh, Dzuhur, Ashar, Maghrib, Isya
- ✅ **10-Minute Reminders** - Get popup and email notifications before prayer time
- ✅ **Flexible Sync** - Sync today, this month, or the entire year
- ✅ **Auto Sync** - Automatic daily sync at 11 PM WIB via cron job
- ✅ **Duplicate Prevention** - Deterministic event IDs prevent duplicates
- ✅ **Color Coding** - Each prayer has a distinct color in Google Calendar
- ✅ **Hijri Date** - Event descriptions include Hijri calendar dates

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: NextAuth.js (Google OAuth)
- **State Management**: TanStack React Query
- **APIs**: Aladhan API, Google Calendar API
- **Hosting**: Railway (recommended)

## Prerequisites

- Node.js 18+ installed
- Google Cloud account (for OAuth credentials)
- Railway account (for deployment)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Prayer-Calendar
npm install
```

### 2. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google Calendar API**
4. Create **OAuth 2.0 credentials** (Web application):
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Download credentials and note your `Client ID` and `Client Secret`

### 3. Environment Variables

Create `.env.local` file in the root directory:

```bash
# NextAuth
NEXTAUTH_SECRET=your-secret-key-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Database (for local development, use Prisma's built-in dev database)
DATABASE_URL=postgresql://user:password@localhost:5432/prayer_calendar

# Cron Secret
CRON_SECRET=your-random-secret-key

# Defaults
DEFAULT_CALCULATION_METHOD=20
DEFAULT_SCHOOL=0
DEFAULT_REMINDER_MINUTES=10
```

### 4. Database Setup

For local development:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Railway

### 1. Create Railway Account

Sign up at [railway.app](https://railway.app)

### 2. Create PostgreSQL Database

1. In Railway dashboard, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Copy the `DATABASE_URL` from the PostgreSQL service

### 3. Deploy Application

1. Connect your GitHub repository to Railway
2. Click **"+ New"** → **"GitHub Repo"** → Select your repository
3. Railway will auto-detect Next.js and deploy

### 4. Set Environment Variables

In Railway project settings, add all environment variables from `.env.local`:

```
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=https://your-app.railway.app
DATABASE_URL=<auto-filled-by-railway>
CRON_SECRET=your-random-secret-key
DEFAULT_CALCULATION_METHOD=20
DEFAULT_SCHOOL=0
DEFAULT_REMINDER_MINUTES=10
```

### 5. Update Google OAuth Redirect URIs

Go back to Google Cloud Console and add production URLs:
- Authorized JavaScript origins: `https://your-app.railway.app`
- Authorized redirect URIs: `https://your-app.railway.app/api/auth/callback/google`

### 6. Setup External Cron Job

1. Sign up at [cron-job.org](https://cron-job.org) (free)
2. Create a new cron job:
   - **Title**: Prayer Calendar Auto Sync
   - **URL**: `https://your-app.railway.app/api/cron`
   - **Schedule**: `0 23 * * *` (11 PM WIB every day)
   - **Method**: GET
   - **Headers**: Add `Authorization: Bearer your-cron-secret`
3. Save and enable the cron job

## API Endpoints

### `GET /api/prayer-times`
Fetch prayer times for a specific city.

**Query Parameters:**
- `city` (string): City name (default: "Jakarta")
- `country` (string): Country (default: "Indonesia")
- `method` (number): Calculation method (default: 20 - Kemenag)
- `school` (number): School (0 = Shafi, 1 = Hanafi)

### `POST /api/sync`
Trigger manual sync to Google Calendar.

**Body:**
```json
{
  "type": "today" | "tomorrow" | "month" | "year"
}
```

### `GET /api/sync-status`
Get sync history for authenticated user.

### `GET /api/cron`
Auto-sync endpoint called by external cron service.

**Headers:**
- `Authorization: Bearer <CRON_SECRET>`

## Project Structure

```
prayer-calendar/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   ├── dashboard/            # Dashboard page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/               # React components
├── hooks/                    # Custom React hooks
├── lib/
│   ├── aladhan/              # Aladhan API client
│   ├── google-calendar/      # Google Calendar client
│   ├── sync/                 # Sync services
│   ├── constants/            # App constants
│   ├── utils/                # Utility functions
│   ├── auth.ts               # NextAuth config
│   └── db.ts                 # Prisma client
├── prisma/
│   └── schema.prisma         # Database schema
└── types/                    # TypeScript type definitions
```

## Database Schema

### User
- Stores user info and OAuth tokens
- Links to preferences and sync logs

### UserPreferences
- City, country, timezone
- Calculation method and school
- Reminder settings
- Auto-sync settings

### SyncLog
- Tracks all sync operations
- Status, event counts, error messages

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

## Troubleshooting

### "Failed to fetch prayer times"
- Check internet connection
- Verify city name is correct
- Aladhan API might be down (rare)

### "Unauthorized" when syncing
- Re-login to refresh Google OAuth tokens
- Check Google Calendar API is enabled
- Verify OAuth credentials are correct

### Cron job not working
- Verify cron-job.org is properly configured
- Check `CRON_SECRET` matches in both places
- View Railway logs for errors

### Database errors
- Run `npx prisma db push` to sync schema
- Check `DATABASE_URL` is correct
- Ensure PostgreSQL is running

## License

MIT

## Credits

- Prayer times from [Aladhan API](https://aladhan.com/prayer-times-api)
- Calculation method: Kementerian Agama Republik Indonesia
