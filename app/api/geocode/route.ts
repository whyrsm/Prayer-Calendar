import { NextRequest, NextResponse } from 'next/server';
import { geocodeLocation, reverseGeocode } from '@/lib/utils/geocoding';
import axios from 'axios';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');
        const lat = searchParams.get('lat');
        const lon = searchParams.get('lon');

        // Reverse geocoding: coordinates → location name
        if (lat && lon) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lon);

            if (isNaN(latitude) || isNaN(longitude)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid latitude or longitude' },
                    { status: 400 }
                );
            }

            // Get detailed location info
            const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
                params: {
                    lat: latitude,
                    lon: longitude,
                    format: 'json',
                    addressdetails: 1,
                },
                headers: {
                    'User-Agent': 'PrayerCalendarApp/1.0',
                },
            });

            if (response.data && response.data.address) {
                const address = response.data.address;

                // Build a clean display name: City/Town, State/Province, Country
                const city = address.city || address.town || address.village || address.municipality || address.county;
                const state = address.state || address.province || address.region;
                const country = address.country;

                const parts = [city, state, country].filter(Boolean);
                const displayName = parts.join(', ') || response.data.display_name;

                return NextResponse.json({
                    success: true,
                    location: {
                        displayName,
                        fullAddress: response.data.display_name,
                        city,
                        state,
                        country,
                        latitude,
                        longitude,
                    },
                });
            }

            return NextResponse.json({
                success: false,
                error: 'Location not found',
            });
        }

        // Forward geocoding: query → coordinates
        if (query) {
            const result = await geocodeLocation(query);

            if (!result) {
                return NextResponse.json(
                    { success: false, error: 'Location not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                data: result,
            });
        }

        return NextResponse.json(
            { success: false, error: 'Query parameter (q) or coordinates (lat, lon) required' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Geocoding error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to geocode location' },
            { status: 500 }
        );
    }
}
