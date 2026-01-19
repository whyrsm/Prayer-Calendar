import { NextRequest, NextResponse } from 'next/server';
import { AladhanClient } from '@/lib/aladhan/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || 'Jakarta';
    const country = searchParams.get('country') || 'Indonesia';
    const method = parseInt(searchParams.get('method') || '20');
    const school = parseInt(searchParams.get('school') || '0');

    const client = new AladhanClient({
      city,
      country,
      method,
      school,
      timezone: 'Asia/Jakarta', // Default timezone
    });

    const today = new Date();
    const prayerTimes = await client.getDailyTimings(today);

    return NextResponse.json({
      success: true,
      data: prayerTimes,
    });
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prayer times' },
      { status: 500 }
    );
  }
}
