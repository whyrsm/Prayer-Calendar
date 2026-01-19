import { NextRequest, NextResponse } from 'next/server';
import { geocodeLocation } from '@/lib/utils/geocoding';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json(
                { success: false, error: 'Query parameter is required' },
                { status: 400 }
            );
        }

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
    } catch (error) {
        console.error('Geocoding error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to geocode location' },
            { status: 500 }
        );
    }
}
