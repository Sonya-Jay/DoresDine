# Finding the Open/Closed Status Endpoint

## Current Situation

The NetNutrition website displays "Open" or "Closed" status for each dining hall on the main page. We need to find the API endpoint that provides this information.

## What to Check

### Option 1: Check Initial Page Load
The status might be embedded in the initial HTML page. To check:

1. **Open Chrome DevTools** (F12)
2. **Go to Network tab**
3. **Reload the page** (Cmd+R or F5)
4. **Look for:**
   - The main page request (`/nn-prod/vucampusdining`)
   - Check the **Response** tab to see if status is in the HTML
   - Look for data attributes like `data-status="open"` or `data-is-open="true"`

### Option 2: Check JavaScript Files
The status might be calculated by JavaScript. To check:

1. **Open Chrome DevTools** (F12)
2. **Go to Sources tab**
3. **Look for JavaScript files** that might contain:
   - `isOpen`
   - `unitStatus`
   - `getStatus`
   - `checkOpen`
4. **Search for these terms** in the JavaScript files

### Option 3: Check for API Calls on Page Load
The status might come from an API call. To check:

1. **Open Chrome DevTools** (F12)
2. **Go to Network tab**
3. **Filter by "XHR" or "Fetch"**
4. **Reload the page**
5. **Look for requests that:**
   - Return JSON
   - Have names like `/Unit/GetUnitsList`, `/Unit/GetStatus`, etc.
   - Are called on page load (not on click)

### Option 4: Check the HTML Structure
The status might be in data attributes. To check:

1. **Right-click on a dining hall** that shows "Open" or "Closed"
2. **Select "Inspect Element"**
3. **Look at the HTML element** - check for:
   - `data-status` attributes
   - `data-is-open` attributes
   - `class` names that indicate status
   - `aria-label` or `title` attributes

### Option 5: Monitor Network When Status Changes
If status updates dynamically:

1. **Open Chrome DevTools** (F12)
2. **Go to Network tab**
3. **Keep the page open for a few minutes**
4. **Watch for periodic API calls** that might update status
5. **Look for polling requests** (requests that repeat every X seconds)

## What to Look For

### Possible Endpoint Names:
- `/Unit/GetUnitsList` - Returns list of units with status
- `/Unit/GetUnitStatus` - Returns status for units
- `/Unit/GetUnitsStatus` - Returns status for all units
- `/Home/GetUnitsStatus` - Status from home page
- `/api/units/status` - RESTful status endpoint

### Possible Response Formats:
```json
{
  "units": [
    { "id": 1, "name": "Rand Dining Center", "isOpen": true },
    { "id": 2, "name": "The Commons", "isOpen": true }
  ]
}
```

Or:
```json
{
  "status": {
    "1": true,
    "2": true,
    "3": false
  }
}
```

## Instructions for You

Since I can't directly inspect the browser's DevTools in real-time, please:

1. **Open the NetNutrition website** in Chrome
2. **Open DevTools** (F12)
3. **Go to Network tab**
4. **Clear the network log** (trash icon)
5. **Reload the page** (Cmd+R)
6. **Filter by "XHR" or "Fetch"**
7. **Look for any requests that:**
   - Are POST or GET requests to `netnutrition.cbord.com`
   - Return JSON (not HTML)
   - Have names containing "Unit", "Status", or "List"
   - Are called automatically on page load

8. **Click on one of these requests** and check:
   - **Request URL** - Copy the full URL
   - **Request Method** - GET or POST
   - **Request Payload** - If POST, what data is sent
   - **Response** - What data is returned (look for status/open/closed)

9. **Share the details** of any requests that look relevant!

## Alternative: Check Page Source

You can also:
1. **Right-click on the page** → "View Page Source"
2. **Search for** "open" or "closed" (case-insensitive)
3. **Look for** JavaScript variables or data attributes that contain status
4. **Share** any relevant code snippets you find

Let me know what you find! 🔍

