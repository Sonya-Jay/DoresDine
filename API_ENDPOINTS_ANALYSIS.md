# NetNutrition API Endpoints Analysis

## Current Status

### ✅ Already Implemented
1. **GET /api/dining/halls** - Returns all dining halls with `isOpen` status
   - Status: Already includes open/closed information
   - Performance: ~2,530ms (needs optimization)

2. **GET /api/dining/halls/:id/menu** - Get menu schedule for a dining hall
   - Status: Working

3. **GET /api/dining/menu/:menuId/items** - Get detailed menu items
   - Status: Working

### 🔍 Endpoints to Check on NetNutrition Website

When you inspect the network tab on the NetNutrition website, look for these types of API calls:

#### 1. Unit Status Endpoint (for real-time open/closed)
- **Possible names:**
  - `/Unit/GetUnitsList`
  - `/Unit/GetUnitStatus`
  - `/Unit/GetUnitsStatus`
  - `/api/units/status`
- **What it does:** Returns real-time open/closed status for all units
- **Do we need it?** ✅ YES - This would give us accurate real-time status instead of checking schedules
- **Current implementation:** TODO in `getUnitStatusFromAPI()` method

#### 2. Unit List Endpoint
- **Possible names:**
  - `/Unit/GetUnitsList`
  - `/Unit/GetUnits`
  - `/api/units`
- **What it does:** Returns list of all available dining units
- **Do we need it?** ❓ MAYBE - We have hardcoded list, but this could be dynamic
- **Current implementation:** We use hardcoded `DINING_HALLS` array

#### 3. Menu Schedule Endpoint
- **Current:** We parse HTML from the main page
- **Possible API:** `/Menu/GetSchedule` or similar
- **Do we need it?** ❓ MAYBE - If there's a cleaner API endpoint
- **Current implementation:** ✅ Working via HTML parsing

#### 4. Menu Items Endpoint
- **Current:** `POST /Menu/SelectMenu`
- **Status:** ✅ Already implemented
- **Do we need it?** ✅ Already have it

#### 5. Nutrition Information
- **Possible names:**
  - `/Item/GetNutrition`
  - `/Nutrition/GetInfo`
- **What it does:** Returns detailed nutrition info for menu items
- **Do we need it?** ❓ MAYBE - Could be useful for filtering (calories, allergens, etc.)
- **Current implementation:** ❌ Not implemented

#### 6. Allergen Information
- **Current:** Parsed from HTML in menu items
- **Possible API:** `/Item/GetAllergens` or similar
- **Do we need it?** ❓ MAYBE - If we want more detailed allergen info
- **Current implementation:** ✅ Parsed from HTML

## How to Find New Endpoints

1. Open NetNutrition website in Chrome
2. Open DevTools (F12) → Network tab
3. Filter by "XHR" or "Fetch" to see API calls
4. Look for:
   - Requests that return JSON (not HTML)
   - Requests with meaningful names (Unit, Menu, Item, etc.)
   - POST requests with form data
   - Requests that happen when you:
     - Load the page
     - Select a dining hall
     - Click on a meal
     - View menu items

## Next Steps

1. **Find the Unit Status endpoint** - This is the most important one to implement
2. **Test each endpoint** - See what data it returns
3. **Add to backend** - Implement in `cbordService.ts`
4. **Add to performance test** - Measure load times
5. **Optimize** - Cache responses, reduce calls, etc.

## Notes

- The URL you shared (`https://netnutrition.cbord.com/nn-prod/vucampusdining`) is the base URL, not an API endpoint
- Most Cbord endpoints require:
  - Session cookies (handled by cookie jar)
  - Specific headers (User-Agent, X-Requested-With, etc.)
  - Form-encoded POST data

## Analysis of User-Provided Endpoints

### ✅ `/Home/SetSessionFromLocalData`
- **Status:** ✅ Already implemented
- **Payload:** `localStorageData={"showMobileDisc":[false]}`
- **Purpose:** Initializes session with user preferences
- **Location:** Called in both `getMenuSchedule()` and `getMenuItems()` methods
- **Implementation:** Lines 172-192 and 314-335 in `cbordService.ts`
- **Note:** Wrapped in try-catch as it's non-critical

### ❌ `/Home/GetSkipAnchor`
- **Status:** ❌ Not needed
- **Response:** `"#menuPanel"` (CSS selector string)
- **Purpose:** UI-only endpoint that returns an anchor for scrolling to a specific panel
- **Why not needed:** We parse HTML directly and don't need browser scrolling behavior
- **Decision:** Skip this endpoint

### ✅ `/Unit/SelectUnitFromUnitsList`
- **Status:** ✅ Already implemented
- **Payload:** `unitOid=2` (form-urlencoded)
- **Purpose:** Selects a dining unit and returns menu schedule HTML
- **Location:** Called in both `getMenuSchedule()` and `getMenuItems()` methods
- **Implementation:** Lines 198-215 and 341-347 in `cbordService.ts`
- **Note:** Parameter name is `unitOid` (lowercase 'i'), not `UnitOId`

### ✅ `/Menu/SelectMenu`
- **Status:** ✅ Already implemented
- **Payload:** `menuOid=8729008` (form-urlencoded)
- **Purpose:** Selects a specific menu/meal and returns menu items HTML
- **Location:** Called in `getMenuItems()` method
- **Implementation:** Lines 350-362 in `cbordService.ts`

### ❌ `/Menu/ToggleCourseItems`
- **Status:** ❌ Not needed
- **Payload:** `courseOid=80` (form-urlencoded)
- **Response:** Empty (content-length: 0)
- **Purpose:** UI-only endpoint that toggles the expanded/collapsed state of course sections (e.g., "Pizza", "Fresh Mex Main")
- **Why not needed:** 
  - Our HTML parser already extracts ALL menu items using `querySelectorAll("tr.cbo_nn_itemPrimaryRow, tr.cbo_nn_itemAlternateRow")`
  - This selector finds all items regardless of whether their parent course is expanded or collapsed
  - Items in collapsed sections have `style='display:none'` but are still in the DOM and are found by our parser
  - We don't need to toggle anything - we just parse all available items from the HTML
- **When it's called:** When a user clicks on a course header (like "Pizza") to expand/collapse it in the browser UI
- **Decision:** Skip this endpoint - it's purely for UI interaction, not data retrieval

### ✅ `/NutritionDetail/ShowItemNutritionLabel`
- **Status:** ✅ Implemented
- **Payload:** `detailOid=264361007` (form-urlencoded)
- **Response:** HTML nutrition label with detailed nutrition data
- **Purpose:** Returns detailed nutrition information for a single menu item
- **Implementation:**
  - Added `getItemNutrition(detailOid)` method to `cbordService.ts`
  - Extracts `detailOid` from menu items HTML (from `data-detailoid`, onclick handlers, or id attributes)
  - Parses HTML response to extract nutrition data
  - Added API endpoint: `GET /api/dining/nutrition/:detailOid`
- **What it returns:**
  - Calories, Calories from Fat
  - Total Fat, Saturated Fat, Trans Fat
  - Cholesterol, Sodium, Potassium
  - Total Carbohydrate, Dietary Fiber, Sugars
  - Protein
  - Vitamins: A, C, Calcium, Iron, Vitamin D
  - Ingredients list
- **Usage:**
  - Menu items now include `detailOid` field
  - Frontend can optionally call `/api/dining/nutrition/:detailOid` to get detailed nutrition
  - Nutrition data is fetched on-demand (not automatically) to avoid too many API calls

### ❓ `/NutritionDetail/ShowMenuDetailNutritionGrid`
- **Status:** ❌ Not needed (we have single-item endpoint)
- **Payload:** Empty (content-length: 0) - uses session state
- **Response:** HTML table with nutrition comparison grid for multiple selected items
- **Purpose:** Returns a nutrition comparison grid for selected menu items
- **Why not needed:**
  - We implemented `/NutritionDetail/ShowItemNutritionLabel` instead, which is simpler
  - The grid endpoint requires selecting multiple items first (complex)
  - Single-item endpoint is sufficient for our use case
  - If we need comparison, we can call the single-item endpoint multiple times
- **Decision:** Skip this endpoint - we have a better alternative

## Summary

All **necessary** endpoints from the user's network tab analysis are already implemented:
- ✅ `/Home/SetSessionFromLocalData` - Session initialization
- ✅ `/Unit/SelectUnitFromUnitsList` - Unit selection
- ✅ `/Menu/SelectMenu` - Menu item retrieval
- ✅ `/NutritionDetail/ShowItemNutritionLabel` - Nutrition information for individual items

Endpoints that were not needed (UI-only or superseded):
- ❌ `/Home/GetSkipAnchor` - UI-only scrolling anchor (not needed for backend)
- ❌ `/Menu/ToggleCourseItems` - UI-only course section expand/collapse (not needed - we parse all items regardless)
- ❌ `/NutritionDetail/ShowMenuDetailNutritionGrid` - Nutrition grid for multiple items (not needed - we use single-item endpoint instead)

