import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { syncDailyPrayerTimes } from '@/lib/sync/daily-sync';
import { addDays } from 'date-fns';
import { delay } from '@/lib/utils/date';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users with auto-sync enabled
    const users = await prisma.user.findMany({
      where: {
        preferences: {
          autoSyncEnabled: true,
        },
      },
      include: {
        preferences: true,
      },
    });

    const tomorrow = addDays(new Date(), 1);
    let successCount = 0;
    let failedCount = 0;

    // Sync for each user
    for (const user of users) {
      if (!user.preferences || !user.accessToken) {
        failedCount++;
        continue;
      }

      // Skip users without coordinates
      if (user.preferences.latitude === null || user.preferences.longitude === null) {
        console.warn(`Skipping user ${user.email}: missing coordinates`);
        failedCount++;
        continue;
      }

      try {
        const config = {
          city: user.preferences.city,
          country: user.preferences.country,
          latitude: user.preferences.latitude,
          longitude: user.preferences.longitude,
          elevation: user.preferences.elevation ?? undefined,
          timezone: user.preferences.timezone,
          calculationMethod: user.preferences.calculationMethod,
          school: user.preferences.school,
          reminderMinutes: user.preferences.reminderMinutes,
        };

        const result = await syncDailyPrayerTimes(user.accessToken, config, tomorrow);

        const status = result.eventsFailed === 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS';

        // Log sync
        await prisma.syncLog.create({
          data: {
            userId: user.id,
            syncType: 'DAILY',
            startDate: tomorrow,
            endDate: tomorrow,
            status,
            eventsCreated: result.eventsCreated,
            eventsUpdated: result.eventsUpdated,
            eventsFailed: result.eventsFailed,
            errorMessage: result.errors.join('; ') || null,
          },
        });

        successCount++;

        // Rate limiting
        await delay(500);
      } catch (error) {
        console.error(`Failed to sync for user ${user.email}:`, error);
        failedCount++;

        // Log failed sync
        await prisma.syncLog.create({
          data: {
            userId: user.id,
            syncType: 'DAILY',
            startDate: tomorrow,
            endDate: tomorrow,
            status: 'FAILED',
            eventsCreated: 0,
            eventsUpdated: 0,
            eventsFailed: 0,
            errorMessage: String(error),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      synced: successCount,
      failed: failedCount,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed', details: String(error) },
      { status: 500 }
    );
  }
}
