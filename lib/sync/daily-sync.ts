import { AladhanClient } from '../aladhan/client';
import { GoogleCalendarClient } from '../google-calendar/client';
import { PrayerEvent } from '../google-calendar/types';
import { parseTime } from '../utils/date';

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export interface DailySyncConfig {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone: string;
  calculationMethod: number;
  school: number;
  reminderMinutes: number;
}

export interface DailySyncResult {
  eventsCreated: number;
  eventsUpdated: number;
  eventsFailed: number;
  errors: string[];
}

export async function syncDailyPrayerTimes(
  accessToken: string,
  config: DailySyncConfig,
  date: Date
): Promise<DailySyncResult> {
  const result: DailySyncResult = {
    eventsCreated: 0,
    eventsUpdated: 0,
    eventsFailed: 0,
    errors: [],
  };

  try {
    // Initialize clients
    const aladhanClient = new AladhanClient({
      city: config.city,
      country: config.country,
      latitude: config.latitude,
      longitude: config.longitude,
      elevation: config.elevation,
      method: config.calculationMethod,
      school: config.school,
      timezone: config.timezone,
    });

    const calendarClient = new GoogleCalendarClient(accessToken, config.timezone);

    // Fetch prayer times for the date
    const dayData = await aladhanClient.getDailyTimings(date);

    // Create events for each prayer
    for (const prayerName of PRAYER_NAMES) {
      try {
        const timeStr = dayData.timings[prayerName];
        const prayerDateTime = parseTime(timeStr, date, config.timezone);

        const event: PrayerEvent = {
          prayerName,
          dateTime: prayerDateTime,
          description: `${prayerName} prayer time - ${dayData.date.hijri.date} ${dayData.date.hijri.month.en} ${dayData.date.hijri.year} Hijri`,
          reminderMinutes: config.reminderMinutes,
          city: config.city,
        };

        await calendarClient.createPrayerEvent(event);
        result.eventsCreated++;
      } catch (error) {
        result.eventsFailed++;
        result.errors.push(`Failed to create ${prayerName}: ${error}`);
        console.error(`Failed to create event for ${prayerName}:`, error);
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Sync failed: ${error}`);
    console.error('Daily sync failed:', error);
    return result;
  }
}
