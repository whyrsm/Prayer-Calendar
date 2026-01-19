import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { syncDailyPrayerTimes } from '@/lib/sync/daily-sync';
import { syncMonthlyPrayerTimes, syncYearlyPrayerTimes } from '@/lib/sync/monthly-sync';
import { syncWeeklyPrayerTimes } from '@/lib/sync/weekly-sync';
import { addDays, startOfWeek, endOfWeek } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user preferences
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { preferences: true },
    });

    if (!user || !user.preferences) {
      return NextResponse.json({ error: 'User preferences not found' }, { status: 404 });
    }

    const { type, date: dateStr } = await request.json();

    // Get coordinates from preferences or fallback to preset city
    let latitude = user.preferences.latitude;
    let longitude = user.preferences.longitude;
    let elevation = user.preferences.elevation;

    // If no coordinates in preferences, try to get from preset cities
    if (!latitude || !longitude) {
      const { INDONESIAN_CITIES } = await import('@/lib/constants/cities');
      const presetCity = INDONESIAN_CITIES.find(c => c.name === user.preferences.city);
      if (presetCity) {
        latitude = presetCity.latitude;
        longitude = presetCity.longitude;
        elevation = presetCity.elevation;
      } else {
        // Default to Jakarta if nothing found
        latitude = INDONESIAN_CITIES[0].latitude;
        longitude = INDONESIAN_CITIES[0].longitude;
        elevation = INDONESIAN_CITIES[0].elevation;
      }
    }

    // Prepare sync config
    const config = {
      city: user.preferences.city,
      country: user.preferences.country,
      latitude,
      longitude,
      elevation,
      timezone: user.preferences.timezone,
      calculationMethod: user.preferences.calculationMethod,
      school: user.preferences.school,
      reminderMinutes: user.preferences.reminderMinutes,
    };

    let result;
    let startDate: Date;
    let endDate: Date;
    let syncType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

    // Perform sync based on type
    if (type === 'today') {
      syncType = 'DAILY';
      startDate = new Date();
      endDate = new Date();
      result = await syncDailyPrayerTimes(session.accessToken, config, startDate);
    } else if (type === 'tomorrow') {
      syncType = 'DAILY';
      startDate = addDays(new Date(), 1);
      endDate = addDays(new Date(), 1);
      result = await syncDailyPrayerTimes(session.accessToken, config, startDate);
    } else if (type === 'week') {
      syncType = 'WEEKLY';
      const now = new Date();
      startDate = startOfWeek(now, { weekStartsOn: 0 }); // Sunday
      endDate = endOfWeek(now, { weekStartsOn: 0 }); // Saturday
      result = await syncWeeklyPrayerTimes(session.accessToken, config, now);
    } else if (type === 'month') {
      syncType = 'MONTHLY';
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      result = await syncMonthlyPrayerTimes(
        session.accessToken,
        config,
        now.getFullYear(),
        now.getMonth() + 1
      );
    } else if (type === 'year') {
      syncType = 'YEARLY';
      const now = new Date();
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
      result = await syncYearlyPrayerTimes(session.accessToken, config, now.getFullYear());
    } else {
      return NextResponse.json({ error: 'Invalid sync type' }, { status: 400 });
    }

    // Log sync result
    const status =
      result.eventsFailed === 0
        ? 'SUCCESS'
        : result.eventsCreated > 0
          ? 'PARTIAL_SUCCESS'
          : 'FAILED';

    await prisma.syncLog.create({
      data: {
        userId: user.id,
        syncType,
        startDate,
        endDate,
        status,
        eventsCreated: result.eventsCreated,
        eventsUpdated: result.eventsUpdated,
        eventsFailed: result.eventsFailed,
        errorMessage: result.errors.join('; ') || null,
      },
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: String(error) },
      { status: 500 }
    );
  }
}
