# Hours Parsing Fix

## Problem Found

From AWS logs, I discovered the issue:

1. **Server timezone**: AWS server is in UTC (Friday 18:34 = 6:34 PM UTC)
2. **Hours are in local time**: The Cbord API returns hours in Central Time (Vanderbilt's timezone)
3. **Code bug**: The code was stopping at the FIRST row matching the day name. If that row was `table-danger` (closed), it would immediately return `false`, even if there were other open periods later in the day.

## The Fix

Updated `calculateStatusFromHours()` to:
1. **Collect ALL rows** for the current day (not just the first one)
2. **Check all time periods** - some halls have multiple periods (breakfast, lunch, dinner)
3. **Return true if current time is within ANY open period**
4. **Return false only if ALL periods are closed OR current time is outside all open periods**

## Timezone Issue

The AWS server is in UTC, but the hours are in Central Time. This means:
- If it's 6:34 PM UTC, that's 12:34 PM Central Time
- Many halls might close at 2:00 PM or 3:00 PM Central
- So at 6:34 PM UTC (12:34 PM Central), halls should still be open

But wait - the logs show Friday 18:34, which is 6:34 PM. If that's UTC, then Central Time would be 12:34 PM, which should be during lunch hours.

Actually, looking at the logs more carefully:
- The server time shows "Friday 18:34 (1114 min)" 
- 1114 minutes = 18 hours 34 minutes = 6:34 PM
- If this is UTC, then Central Time is 12:34 PM (should be open)
- If this is Central Time, then it's 6:34 PM (might be closed)

The real issue is that we need to handle timezone conversion, OR ensure the server is in the correct timezone.

## Next Steps

1. **Deploy the fix** - The code now checks all time periods
2. **Check timezone** - Ensure AWS server is in Central Time, or convert times appropriately
3. **Test** - Verify halls show correct status after deployment

