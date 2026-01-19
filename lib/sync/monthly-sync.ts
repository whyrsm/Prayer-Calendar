import { AladhanClient } from '../aladhan/client';
import { GoogleCalendarClient } from '../google-calendar/client';
import { PrayerEvent } from '../google-calendar/types';
import { parseTime, delay } from '../utils/date';

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export interface MonthlySyncConfig {
  city: string;
  country: string;
  timezone: string;
  calculationMethod: number;
  school: number;
  reminderMinutes: number;
}

export interface MonthlySyncResult {
  eventsCreated: number;
  eventsUpdated: number;
  eventsFailed: number;
  errors: string[];
}

export async function syncMonthlyPrayerTimes(
  accessToken: string,
  config: MonthlySyncConfig,
  year: number,
  month: number
): Promise<MonthlySyncResult> {
  const result: MonthlySyncResult = {
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
      method: config.calculationMethod,
      school: config.school,
      timezone: config.timezone,
    });

    const calendarClient = new GoogleCalendarClient(accessToken);

    // Fetch monthly calendar
    const monthData = await aladhanClient.getMonthlyCalendar(year, month);

    // Create events for each day
    for (const dayData of monthData) {
      const dateStr = dayData.date.gregorian.date; // DD-MM-YYYY
      const [day, mon, yr] = dateStr.split('-').map(Number);
      const date = new Date(yr, mon - 1, day);

      for (const prayerName of PRAYER_NAMES) {
        try {
          const timeStr = dayData.timings[prayerName];
          const prayerDateTime = parseTime(timeStr, date, config.timezone);

          const event: PrayerEvent = {
            prayerName,
            dateTime: prayerDateTime,
            description: `${prayerName} - ${dayData.date.hijri.date} ${dayData.date.hijri.month.en} ${dayData.date.hijri.year} Hijri`,
            reminderMinutes: config.reminderMinutes,
          };

          await calendarClient.createPrayerEvent(event);
          result.eventsCreated++;

          // Small delay to avoid rate limiting
          await delay(100);
        } catch (error) {
          result.eventsFailed++;
          result.errors.push(`Failed to create ${prayerName} for ${dateStr}: ${error}`);
          console.error(`Failed to create ${prayerName} for ${dateStr}:`, error);
        }
      }
    }

    return result;
  } catch (error) {
    result.errors.push(`Monthly sync failed: ${error}`);
    console.error('Monthly sync failed:', error);
    return result;
  }
}

export async function syncYearlyPrayerTimes(
  accessToken: string,
  config: MonthlySyncConfig,
  year: number
): Promise<MonthlySyncResult> {
  const totalResult: MonthlySyncResult = {
    eventsCreated: 0,
    eventsUpdated: 0,
    eventsFailed: 0,
    errors: [],
  };

  for (let month = 1; month <= 12; month++) {
    console.log(`Syncing month ${month}/${year}...`);
    const monthResult = await syncMonthlyPrayerTimes(accessToken, config, year, month);

    totalResult.eventsCreated += monthResult.eventsCreated;
    totalResult.eventsUpdated += monthResult.eventsUpdated;
    totalResult.eventsFailed += monthResult.eventsFailed;
    totalResult.errors.push(...monthResult.errors);

    // Longer delay between months
    await delay(2000);
  }

  return totalResult;
}
