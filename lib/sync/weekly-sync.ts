import { AladhanClient } from '../aladhan/client';
import { GoogleCalendarClient } from '../google-calendar/client';
import { PrayerEvent } from '../google-calendar/types';
import { parseTime, delay } from '../utils/date';
import { addDays, startOfWeek, endOfWeek } from 'date-fns';

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export interface WeeklySyncConfig {
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

export interface WeeklySyncResult {
    eventsCreated: number;
    eventsUpdated: number;
    eventsFailed: number;
    errors: string[];
}

export async function syncWeeklyPrayerTimes(
    accessToken: string,
    config: WeeklySyncConfig,
    weekStartDate?: Date
): Promise<WeeklySyncResult> {
    const result: WeeklySyncResult = {
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

        // Determine the week range (Sunday to Saturday)
        const referenceDate = weekStartDate || new Date();
        const weekStart = startOfWeek(referenceDate, { weekStartsOn: 0 }); // Sunday
        const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 0 }); // Saturday

        console.log(`Syncing week from ${weekStart.toDateString()} to ${weekEnd.toDateString()}`);

        // Iterate through each day of the week
        for (let i = 0; i < 7; i++) {
            const currentDate = addDays(weekStart, i);

            try {
                // Fetch prayer times for the current date
                const dayData = await aladhanClient.getDailyTimings(currentDate);

                // Create events for each prayer
                for (const prayerName of PRAYER_NAMES) {
                    try {
                        const timeStr = dayData.timings[prayerName];
                        const prayerDateTime = parseTime(timeStr, currentDate, config.timezone);

                        const event: PrayerEvent = {
                            prayerName,
                            dateTime: prayerDateTime,
                            description: `${prayerName} prayer time - ${dayData.date.hijri.date} ${dayData.date.hijri.month.en} ${dayData.date.hijri.year} Hijri`,
                            reminderMinutes: config.reminderMinutes,
                            city: config.city,
                        };

                        await calendarClient.createPrayerEvent(event);
                        result.eventsCreated++;

                        // Small delay to avoid rate limiting
                        await delay(100);
                    } catch (error) {
                        result.eventsFailed++;
                        result.errors.push(
                            `Failed to create ${prayerName} for ${currentDate.toDateString()}: ${error}`
                        );
                        console.error(`Failed to create ${prayerName} for ${currentDate.toDateString()}:`, error);
                    }
                }
            } catch (error) {
                result.errors.push(`Failed to fetch prayer times for ${currentDate.toDateString()}: ${error}`);
                console.error(`Failed to fetch prayer times for ${currentDate.toDateString()}:`, error);
            }

            // Delay between days
            await delay(200);
        }

        return result;
    } catch (error) {
        result.errors.push(`Weekly sync failed: ${error}`);
        console.error('Weekly sync failed:', error);
        return result;
    }
}
