import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { PrayerEvent } from './types';

export class GoogleCalendarClient {
  private calendar: calendar_v3.Calendar;
  private calendarId: string;
  private timezone: string;

  constructor(accessToken: string, timezone: string, calendarId: string = 'primary') {
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    this.calendarId = calendarId;
    this.timezone = timezone;
  }

  async createPrayerEvent(event: PrayerEvent): Promise<string> {
    const endTime = new Date(event.dateTime.getTime() + 15 * 60 * 1000); // 15 min duration

    const calendarEvent: calendar_v3.Schema$Event = {
      summary: `${event.prayerName} Prayer`,
      description: event.description || `Time for ${event.prayerName} prayer`,
      start: {
        dateTime: event.dateTime.toISOString(),
        timeZone: this.timezone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: this.timezone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: event.reminderMinutes },
          { method: 'email', minutes: event.reminderMinutes },
        ],
      },
      colorId: this.getPrayerColor(event.prayerName),
      // Use unique ID to prevent duplicates
      id: this.generateEventId(event.prayerName, event.dateTime),
    };

    try {
      // Try to insert; if exists, update
      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: calendarEvent,
      });

      return response.data.id!;
    } catch (error: any) {
      if (error.code === 409) {
        // Event already exists, update it
        return this.updatePrayerEvent(event);
      }
      throw error;
    }
  }

  async updatePrayerEvent(event: PrayerEvent): Promise<string> {
    const eventId = this.generateEventId(event.prayerName, event.dateTime);
    const endTime = new Date(event.dateTime.getTime() + 15 * 60 * 1000);

    const calendarEvent: calendar_v3.Schema$Event = {
      summary: `${event.prayerName} Prayer`,
      description: event.description,
      start: {
        dateTime: event.dateTime.toISOString(),
        timeZone: this.timezone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: this.timezone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: event.reminderMinutes },
          { method: 'email', minutes: event.reminderMinutes },
        ],
      },
      colorId: this.getPrayerColor(event.prayerName),
    };

    const response = await this.calendar.events.update({
      calendarId: this.calendarId,
      eventId,
      requestBody: calendarEvent,
    });

    return response.data.id!;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.calendar.events.delete({
      calendarId: this.calendarId,
      eventId,
    });
  }

  async listEvents(startDate: Date, endDate: Date): Promise<calendar_v3.Schema$Event[]> {
    const response = await this.calendar.events.list({
      calendarId: this.calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      q: 'Prayer', // Filter by prayer events
    });

    return response.data.items || [];
  }

  private generateEventId(prayerName: string, dateTime: Date): string {
    // Create deterministic ID based on prayer and date
    // Google Calendar event IDs must use base32hex encoding: only a-v and 0-9
    // Letters w, x, y, z are NOT allowed
    const dateStr = dateTime.toISOString().split('T')[0].replace(/-/g, '');
    const rawId = `salah${prayerName.toLowerCase()}${dateStr}`;
    // Convert any invalid characters (w, x, y, z) to valid base32hex characters
    return rawId
      .replace(/[^a-z0-9]/g, '')
      .replace(/w/g, 'a')
      .replace(/x/g, 'b')
      .replace(/y/g, 'c')
      .replace(/z/g, 'd');
  }

  private getPrayerColor(prayerName: string): string {
    // Google Calendar color IDs (1-11)
    const colors: Record<string, string> = {
      Fajr: '7',      // Cyan
      Dhuhr: '5',     // Yellow
      Asr: '6',       // Orange
      Maghrib: '11',  // Red
      Isha: '1',      // Lavender
    };
    return colors[prayerName] || '9';
  }
}
