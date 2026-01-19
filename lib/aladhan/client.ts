import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';
import { AladhanResponse, DayData, LocationConfig } from './types';

const BASE_URL = 'https://api.aladhan.com/v1';

// Zod schema for runtime validation
const TimingsSchema = z.object({
  Fajr: z.string(),
  Sunrise: z.string(),
  Dhuhr: z.string(),
  Asr: z.string(),
  Sunset: z.string(),
  Maghrib: z.string(),
  Isha: z.string(),
});

export class AladhanClient {
  private http: AxiosInstance;
  private location: LocationConfig;

  constructor(location: LocationConfig) {
    this.location = location;
    this.http = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    });
  }

  async getDailyTimings(date: Date): Promise<DayData> {
    const dateStr = this.formatDate(date);
    const response = await this.http.get<AladhanResponse<DayData>>(
      `/timingsByCity/${dateStr}`,
      {
        params: {
          city: this.location.city,
          country: this.location.country,
          method: this.location.method,
          school: this.location.school,
        },
      }
    );

    // Validate response
    TimingsSchema.parse(response.data.data.timings);
    return response.data.data;
  }

  async getMonthlyCalendar(year: number, month: number): Promise<DayData[]> {
    const response = await this.http.get<AladhanResponse<DayData[]>>(
      `/calendarByCity/${year}/${month}`,
      {
        params: {
          city: this.location.city,
          country: this.location.country,
          method: this.location.method,
          school: this.location.school,
        },
      }
    );

    return response.data.data;
  }

  async getYearlyCalendar(year: number): Promise<DayData[]> {
    const allDays: DayData[] = [];

    for (let month = 1; month <= 12; month++) {
      console.log(`Fetching month ${month}/${year}`);
      const monthData = await this.getMonthlyCalendar(year, month);
      allDays.push(...monthData);

      // Rate limiting - 500ms delay between requests
      await this.delay(500);
    }

    return allDays;
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
