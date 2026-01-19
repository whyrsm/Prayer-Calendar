import { parse, setHours, setMinutes } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

/**
 * Parse prayer time string (HH:mm) and convert to Date object in specific timezone
 * @param timeStr - Time string in format "HH:mm" (e.g., "04:42")
 * @param date - The date for this prayer time
 * @param timezone - IANA timezone (e.g., "Asia/Jakarta")
 */
export function parseTime(timeStr: string, date: Date, timezone: string): Date {
  // Remove any extra characters (some APIs return "04:42 (WIB)")
  const cleanTime = timeStr.split(' ')[0];

  // Parse hours and minutes
  const [hours, minutes] = cleanTime.split(':').map(Number);

  // Create date with time in the specified timezone
  let dateTime = new Date(date);
  dateTime = setHours(dateTime, hours);
  dateTime = setMinutes(dateTime, minutes);

  // Convert to proper timezone
  return fromZonedTime(dateTime, timezone);
}

/**
 * Delay utility for rate limiting
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
