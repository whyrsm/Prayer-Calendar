# Prayer Calendar Updates

## Changes Made

### 1. Removed Monthly and Yearly Sync Options
- **File**: `/app/dashboard/page.tsx`
- **Change**: Removed the monthly and yearly sync buttons from the Calendar Sync section
- **Reason**: To focus on daily and weekly sync options as requested

### 2. Updated SyncButton Type Definition
- **File**: `/components/SyncButton.tsx`
- **Change**: Updated the `type` prop to only accept `'today' | 'week'` instead of `'today' | 'tomorrow' | 'week' | 'month' | 'year'`
- **Reason**: Simplified the component to match the new sync options

### 3. Added Location to Calendar Event Titles
- **Files Modified**:
  - `/lib/google-calendar/types.ts` - Added optional `city` field to `PrayerEvent` interface
  - `/lib/google-calendar/client.ts` - Updated event summary to include city name: `"${prayerName} Prayer - ${city}"`
  - `/lib/sync/daily-sync.ts` - Added `city: config.city` to prayer events
  - `/lib/sync/weekly-sync.ts` - Added `city: config.city` to prayer events

- **Result**: Calendar events will now show titles like:
  - "Fajr Prayer - Jakarta"
  - "Dhuhr Prayer - Bandung"
  - etc.

This helps users immediately identify which city's prayer schedule they're viewing in their calendar.

### 4. Fixed Location Not Being Used When Syncing (IMPORTANT FIX)
Previously, the sync API always read the city from database preferences (which defaulted to Jakarta) instead of using the currently selected location in the UI.

**Files Modified**:
- `/components/SyncButton.tsx` - Now accepts `city`, `latitude`, and `longitude` props and sends them to the API
- `/app/dashboard/page.tsx` - Now passes `selectedCity` and `locationCoords` to SyncButton
- `/app/api/sync/route.ts` - Now uses city/coordinates from the request body if provided, falling back to database preferences only if not given

**Result**: When you select a location and click sync, the calendar events will now correctly use your selected location instead of always defaulting to Jakarta.

## User Interface Changes

### Before:
- Sync options: Today, Week, Month, Year
- Calendar event titles: "Fajr Prayer", "Dhuhr Prayer", etc.
- Location selection didn't affect sync (always used Jakarta from DB)

### After:
- Sync options: Today, Week (simplified)
- Calendar event titles: "Fajr Prayer - [City Name]", "Dhuhr Prayer - [City Name]", etc.
- Location selection now works correctly for sync

## Testing Recommendations

1. **Test Daily Sync**: 
   - Select a location (e.g., "Bandung")
   - Click "Sync Today Only"
   - Verify events are created with title "Fajr Prayer - Bandung" (not Jakarta)

2. **Test Weekly Sync**: 
   - Select a different location
   - Click "Sync This Week"
   - Verify all events include the correct city name

3. **Test Location Change**: 
   - Change the selected city
   - Sync again and verify new events use the new city name

4. **Test No Location Selected**:
   - Buttons should show "Select a location first" and be disabled until a location is selected

## Notes

- The monthly and yearly sync functionality still exists in the backend (`/lib/sync/monthly-sync.ts`) but is no longer accessible from the UI
- If needed in the future, these options can be easily re-enabled by updating the dashboard and SyncButton component
- The sync buttons are now disabled and show helpful message when no location is selected
