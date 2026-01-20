export interface PrayerEvent {
  prayerName: string;
  dateTime: Date;
  description?: string;
  reminderMinutes: number;
  city?: string;
}

export interface SyncResult {
  created: number;
  updated: number;
  failed: number;
  errors: string[];
}
