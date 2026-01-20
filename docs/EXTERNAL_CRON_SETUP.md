# External Cron Setup Guide

This guide explains how to set up external cron services to automatically sync prayer times to Google Calendar for all users every day.

## Overview

Your Prayer Calendar app has a cron endpoint at `/api/cron` that:
- Runs daily at 11 PM WIB (configurable)
- Syncs tomorrow's prayer times for all users with auto-sync enabled
- Logs all sync operations to the database
- Handles rate limiting to avoid API throttling

## Why External Cron?

Railway (and many other hosting platforms) don't provide built-in scheduled tasks on free tiers. External cron services solve this by making HTTP requests to your app on a schedule.

## Cron Endpoint Details

**URL**: `https://your-app.railway.app/api/cron`  
**Method**: `GET`  
**Authentication**: Bearer token via `Authorization` header  
**Schedule**: Daily at 11 PM WIB (23:00 UTC+7 = 16:00 UTC)

### Required Header
```
Authorization: Bearer YOUR_CRON_SECRET
```

The `CRON_SECRET` must match the environment variable in your Railway app.

---

## Option 1: cron-job.org (Recommended)

**Pros**: Free, reliable, easy to use, good UI  
**Cons**: Limited to 1-minute intervals on free tier

### Setup Steps

1. **Sign up** at [cron-job.org](https://cron-job.org)

2. **Create a new cron job**:
   - Click **"Create cronjob"**
   - **Title**: `Prayer Calendar Auto Sync`
   - **URL**: `https://your-app.railway.app/api/cron`
   - **Schedule**: 
     - Select **"Every day"**
     - Time: `16:00` (UTC) = 11 PM WIB
     - Or use cron expression: `0 16 * * *`

3. **Configure Request**:
   - **Method**: `GET`
   - **Headers**: Click "Add header"
     - Name: `Authorization`
     - Value: `Bearer YOUR_CRON_SECRET`

4. **Advanced Settings** (optional):
   - **Timeout**: 60 seconds (recommended)
   - **Retry on failure**: Enable
   - **Email notifications**: Enable for failures

5. **Save and Enable** the cron job

### Verification
- Check the "History" tab to see execution logs
- First run should show status 200 with JSON response
- Check your Railway logs for sync activity

---

## Option 2: EasyCron

**Pros**: Free tier available, reliable  
**Cons**: Limited to 20 cron jobs on free tier

### Setup Steps

1. **Sign up** at [easycron.com](https://www.easycron.com)

2. **Create Cron Job**:
   - **URL**: `https://your-app.railway.app/api/cron`
   - **Cron Expression**: `0 16 * * *` (4 PM UTC = 11 PM WIB)
   - **HTTP Method**: `GET`
   - **HTTP Headers**: 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```

3. **Email Notifications**:
   - Enable "Email me when cron job fails"

4. **Save** and the cron will start running

---

## Option 3: UptimeRobot

**Pros**: Free, also monitors uptime  
**Cons**: Minimum interval is 5 minutes, not true cron

### Setup Steps

1. **Sign up** at [uptimerobot.com](https://uptimerobot.com)

2. **Create Monitor**:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `Prayer Calendar Cron`
   - **URL**: `https://your-app.railway.app/api/cron`
   - **Monitoring Interval**: 24 hours (1440 minutes)
   - **Monitor Timeout**: 30 seconds

3. **Advanced Settings**:
   - **Custom HTTP Headers**:
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```

4. **Alert Contacts**: Add your email for failure notifications

**Note**: UptimeRobot doesn't support exact time scheduling, so it will run 24 hours after the last check. For precise timing, use cron-job.org or EasyCron.

---

## Option 4: GitHub Actions (Free, Self-Hosted)

**Pros**: Completely free, version controlled  
**Cons**: Requires GitHub repository, slight delay (up to 15 minutes)

### Setup Steps

1. **Create workflow file** in your repo:
   `.github/workflows/daily-sync.yml`

```yaml
name: Daily Prayer Sync

on:
  schedule:
    # Runs at 16:00 UTC (11 PM WIB) every day
    - cron: '0 16 * * *'
  workflow_dispatch: # Allows manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Cron Endpoint
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-app.railway.app/api/cron
```

2. **Add Secret**:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Click **"New repository secret"**
   - Name: `CRON_SECRET`
   - Value: Your cron secret from Railway

3. **Commit and push** the workflow file

4. **Verify**:
   - Go to Actions tab in GitHub
   - You can manually trigger it with "Run workflow"
   - Check logs after scheduled run

---

## Option 5: Render Cron Jobs (If using Render)

If you're hosting on Render instead of Railway:

1. **In Render Dashboard**:
   - Create a new **Cron Job** service
   - **Command**: 
     ```bash
     curl -X GET -H "Authorization: Bearer $CRON_SECRET" https://your-app.onrender.com/api/cron
     ```
   - **Schedule**: `0 16 * * *`

2. **Environment Variables**:
   - Add `CRON_SECRET` to the cron job service

---

## Environment Variables Setup

### In Railway

1. Go to your Railway project
2. Click on your service
3. Go to **Variables** tab
4. Add/verify these variables:

```bash
CRON_SECRET=your-random-secret-key-here
```

**Generate a secure secret**:
```bash
# On Mac/Linux
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### In .env.local (for local testing)

```bash
CRON_SECRET=your-random-secret-key-here
```

---

## Testing Your Cron Setup

### 1. Test Locally

```bash
# Start your dev server
npm run dev

# In another terminal, test the endpoint
curl -X GET \
  -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/cron
```

**Expected Response**:
```json
{
  "success": true,
  "totalUsers": 1,
  "synced": 1,
  "failed": 0
}
```

### 2. Test Production

```bash
curl -X GET \
  -H "Authorization: Bearer your-cron-secret" \
  https://your-app.railway.app/api/cron
```

### 3. Test Without Auth (Should Fail)

```bash
curl -X GET https://your-app.railway.app/api/cron
```

**Expected Response**:
```json
{
  "error": "Unauthorized"
}
```

---

## Monitoring and Troubleshooting

### Check Railway Logs

1. Go to Railway dashboard
2. Click on your service
3. Go to **Deployments** → Click latest deployment
4. View **Logs** tab
5. Look for cron execution logs around 11 PM WIB

### Check Sync Logs in Database

Use Prisma Studio or query directly:

```bash
npx prisma studio
```

Navigate to `SyncLog` table to see:
- Sync history
- Success/failure status
- Error messages
- Events created/updated

### Common Issues

#### 1. "Unauthorized" Error
- **Cause**: `CRON_SECRET` mismatch
- **Fix**: Verify the secret in Railway matches the one in your cron service

#### 2. No Users Synced
- **Cause**: No users have `autoSyncEnabled: true`
- **Fix**: Check `UserPreferences` table, ensure `autoSyncEnabled` is true

#### 3. "Failed to sync for user" Errors
- **Cause**: Expired Google OAuth tokens
- **Fix**: Users need to re-login to refresh tokens
- **Long-term**: Implement token refresh logic

#### 4. Cron Not Running
- **Cause**: Cron service configuration issue
- **Fix**: 
  - Check cron service is enabled
  - Verify schedule expression
  - Check execution history in cron service dashboard

#### 5. Rate Limiting
- **Cause**: Too many requests to Aladhan API
- **Fix**: The endpoint already has 500ms delay between users, should be fine

---

## Cron Expression Reference

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

### Common Schedules

| Schedule | Cron Expression | Description |
|----------|----------------|-------------|
| Daily at 11 PM WIB | `0 16 * * *` | 16:00 UTC = 23:00 WIB |
| Daily at midnight WIB | `0 17 * * *` | 17:00 UTC = 00:00 WIB |
| Every 6 hours | `0 */6 * * *` | At minute 0 past every 6th hour |
| Twice daily (6 AM & 6 PM WIB) | `0 23,11 * * *` | 23:00 & 11:00 UTC |

---

## Advanced: Multiple Sync Times

If you want to sync multiple times per day:

### Option A: Multiple Cron Jobs
Create separate cron jobs with different schedules:
- Morning sync: `0 23 * * *` (6 AM WIB)
- Evening sync: `0 11 * * *` (6 PM WIB)

### Option B: Modify Endpoint
Update `/api/cron/route.ts` to sync both today and tomorrow:

```typescript
// Sync today and tomorrow
const today = new Date();
const tomorrow = addDays(today, 1);

await syncDailyPrayerTimes(user.accessToken, config, today);
await delay(500);
await syncDailyPrayerTimes(user.accessToken, config, tomorrow);
```

---

## Security Best Practices

1. **Keep CRON_SECRET secure**:
   - Never commit to git
   - Use strong random values
   - Rotate periodically

2. **Use HTTPS only**:
   - Railway provides HTTPS by default
   - Never use HTTP for production

3. **Monitor failed attempts**:
   - Check logs for unauthorized access attempts
   - Set up alerts for repeated failures

4. **Rate limiting**:
   - The endpoint already has 500ms delay
   - Consider adding IP-based rate limiting for extra security

---

## Cost Comparison

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| cron-job.org | Unlimited jobs, 1-min interval | €2.99/mo for more features |
| EasyCron | 20 jobs | $2.99/mo for 100 jobs |
| UptimeRobot | 50 monitors | $7/mo for more monitors |
| GitHub Actions | 2,000 min/month | Free for public repos |
| Render Cron | Not available on free tier | $7/mo |

**Recommendation**: Start with **cron-job.org** (free, reliable, easy to use)

---

## Next Steps

1. ✅ Choose a cron service (recommended: cron-job.org)
2. ✅ Generate and set `CRON_SECRET` in Railway
3. ✅ Configure the cron job with your app URL
4. ✅ Test the endpoint manually
5. ✅ Wait for first scheduled run
6. ✅ Check Railway logs and database for sync results
7. ✅ Set up email notifications for failures

---

## Support

If you encounter issues:
1. Check Railway logs
2. Check cron service execution history
3. Verify environment variables
4. Test endpoint manually with curl
5. Check database `SyncLog` table

For Aladhan API issues, see: https://aladhan.com/prayer-times-api
