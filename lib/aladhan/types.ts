export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface DateInfo {
  readable: string;
  timestamp: string;
  gregorian: {
    date: string;
    format: string;
    day: string;
    weekday: { en: string };
    month: { number: number; en: string };
    year: string;
  };
  hijri: {
    date: string;
    day: string;
    month: { number: number; en: string; ar: string };
    year: string;
  };
}

export interface DayData {
  timings: PrayerTimings;
  date: DateInfo;
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: { id: number; name: string };
  };
}

export interface AladhanResponse<T> {
  code: number;
  status: string;
  data: T;
}

export interface LocationConfig {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation?: number;  // meters above sea level
  method: number;      // Calculation method (1-99)
  school: number;      // 0 = Shafi, 1 = Hanafi
  timezone: string;
  adjustments?: string; // Time adjustments in format: "0,0,0,0,0,0,0,0,0"
}
