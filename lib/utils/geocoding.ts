import axios from 'axios';

export interface GeocodingResult {
    latitude: number;
    longitude: number;
    displayName: string;
    city?: string;
    country?: string;
    timezone?: string;
}

/**
 * Geocode a location string to coordinates using Nominatim (OpenStreetMap)
 * Free API, no key required
 */
export async function geocodeLocation(locationQuery: string): Promise<GeocodingResult | null> {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: locationQuery,
                format: 'json',
                limit: 1,
                addressdetails: 1,
            },
            headers: {
                'User-Agent': 'PrayerCalendarApp/1.0', // Required by Nominatim
            },
        });

        if (response.data && response.data.length > 0) {
            const result = response.data[0];
            return {
                latitude: parseFloat(result.lat),
                longitude: parseFloat(result.lon),
                displayName: result.display_name,
                city: result.address?.city || result.address?.town || result.address?.village,
                country: result.address?.country,
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

/**
 * Get timezone from coordinates using TimeZoneDB API (free tier available)
 * Alternative: use a simple mapping based on coordinates
 */
export function getTimezoneFromCoordinates(latitude: number, longitude: number): string {
    // Simple timezone mapping for Indonesia
    // More accurate would be to use a timezone API or library

    // Indonesia has 3 main timezones:
    // WIB (UTC+7): Java, Sumatra - longitude < 120
    // WITA (UTC+8): Bali, Kalimantan, Sulawesi - longitude 120-135
    // WIT (UTC+9): Papua, Maluku - longitude > 135

    if (longitude < 120) {
        return 'Asia/Jakarta'; // WIB
    } else if (longitude < 135) {
        return 'Asia/Makassar'; // WITA
    } else {
        return 'Asia/Jayapura'; // WIT
    }
}

/**
 * Reverse geocode coordinates to get location name
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
        const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
                lat: latitude,
                lon: longitude,
                format: 'json',
            },
            headers: {
                'User-Agent': 'PrayerCalendarApp/1.0',
            },
        });

        if (response.data && response.data.display_name) {
            return response.data.display_name;
        }

        return null;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}
