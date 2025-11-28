# Finding the Open/Closed Status Endpoint

## What You Found

The HTML shows:
```html
<a class="badge badge-danger align-self-center"
   onclick="NetNutrition.UI.openHoursInModal(3)">
   Closed
</a>
```

The `openHoursInModal(3)` function is called when clicking the status. The number `3` is likely the unit ID.

## Next Steps to Find the API Endpoint

### Step 1: Monitor Network When Clicking Status
1. **Open Chrome DevTools** (F12)
2. **Go to Network tab**
3. **Clear the network log** (trash icon)
4. **Click on a dining hall's "Open" or "Closed" badge**
5. **Look for new API requests** that appear after clicking

### Step 2: Check What `openHoursInModal` Does
1. **Open Chrome DevTools** (F12)
2. **Go to Console tab**
3. **Type:** `NetNutrition.UI.openHoursInModal`
4. **Press Enter** - This will show you the function definition
5. **Or search in Sources tab** for `openHoursInModal` in JavaScript files

### Step 3: Check Initial Page Load
The status might be embedded in the initial HTML. To check:

1. **Open Chrome DevTools** (F12)
2. **Go to Network tab**
3. **Reload the page** (Cmd+R)
4. **Click on the main page request** (`/nn-prod/vucampusdining`)
5. **Go to Response tab**
6. **Search for** "badge-danger" or "badge-success" (these are the CSS classes for Closed/Open)
7. **Look for** data attributes or JavaScript variables that contain status

### Step 4: Look for Hours/Status API
The status is likely calculated from hours. Look for:

1. **API endpoints with names like:**
   - `/Unit/GetHours`
   - `/Unit/GetUnitHours`
   - `/Home/GetUnitHours`
   - `/Unit/GetHoursForUnit`
   - `/Hours/GetUnitHours`

2. **Check the response** - it might contain:
   - Opening hours
   - Closing hours
   - Current status (open/closed)
   - Time ranges for each day

## What to Share

When you find the endpoint, please share:

1. **Request URL** - Full path (e.g., `/Unit/GetHours`)
2. **Request Method** - GET or POST
3. **Request Payload** - If POST, what parameters are sent (e.g., `unitOid=3`)
4. **Response** - What data is returned (first 20-30 lines of JSON/HTML)

## Alternative: Check Page Source

The status might be calculated client-side. To check:

1. **Right-click on page** → "View Page Source"
2. **Search for** "openHoursInModal" or "badge-danger" or "badge-success"
3. **Look for** JavaScript that calculates status based on current time
4. **Share** any relevant code snippets

## Expected Response Format

The hours endpoint might return something like:
```json
{
  "unitId": 3,
  "hours": {
    "monday": { "open": "7:00 AM", "close": "9:00 PM" },
    "tuesday": { "open": "7:00 AM", "close": "9:00 PM" },
    ...
  },
  "isOpen": true,
  "currentStatus": "open"
}
```

Or it might be HTML with hours information that JavaScript parses to determine status.

Let me know what you find! 🔍

