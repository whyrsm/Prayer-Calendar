import { NextRequest, NextResponse } from 'next/server';
import { AladhanClient } from '@/lib/aladhan/client';
import { INDONESIAN_CITIES } from '@/lib/constants/cities';
import { geocodeLocation, getTimezoneFromCoordinates } from '@/lib/utils/geocoding';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const elevation = searchParams.get('elevation');
    const method = parseInt(searchParams.get('method') || '20');
    const school = parseInt(searchParams.get('school') || '0');

    let lat: number;
    let lon: number;
    let elev: number | undefined;
    let timezone: string;
    let locationCity: string;
    let country: string;

    // Priority 1: Use provided coordinates
    if (latitude && longitude) {
      lat = parseFloat(latitude);
      lon = parseFloat(longitude);
      elev = elevation ? parseFloat(elevation) : undefined;
      timezone = getTimezoneFromCoordinates(lat, lon);
      locationCity = city || 'Custom Location';
      country = 'Indonesia';
    }
    // Priority 2: Use preset city from constants
    else if (city) {
      const presetCity = INDONESIAN_CITIES.find(c => c.name === city);

      if (presetCity) {
        lat = presetCity.latitude;
        lon = presetCity.longitude;
        elev = presetCity.elevation;
        timezone = presetCity.timezone;
        locationCity = presetCity.name;
        country = 'Indonesia';
      } else {
        // Priority 3: Geocode the city name
        const geocoded = await geocodeLocation(city);
        if (!geocoded) {
          return NextResponse.json(
            { success: false, error: 'Location not found' },
            { status: 404 }
          );
        }
        lat = geocoded.latitude;
        lon = geocoded.longitude;
        elev = undefined;
        timezone = getTimezoneFromCoordinates(lat, lon);
        locationCity = geocoded.city || city;
        country = geocoded.country || 'Indonesia';
      }
    } else {
      // Default to Jakarta
      const jakarta = INDONESIAN_CITIES[0];
      lat = jakarta.latitude;
      lon = jakarta.longitude;
      elev = jakarta.elevation;
      timezone = jakarta.timezone;
      locationCity = jakarta.name;
      country = 'Indonesia';
    }

    const client = new AladhanClient({
      city: locationCity,
      country,
      latitude: lat,
      longitude: lon,
      elevation: elev,
      method,
      school,
      timezone,
    });

    const today = new Date();
    const prayerTimes = await client.getDailyTimings(today);

    return NextResponse.json({
      success: true,
      data: prayerTimes,
      location: {
        city: locationCity,
        country,
        latitude: lat,
        longitude: lon,
        elevation: elev,
        timezone,
      },
    });
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prayer times' },
      { status: 500 }
    );
  }
}
