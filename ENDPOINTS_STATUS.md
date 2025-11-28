# Cbord API Endpoints Status & Functionality Check

## ✅ Implemented Endpoints

### Core Functionality (All Working)

1. **`GET /api/dining/halls`**
   - **Status:** ✅ Working
   - **Cbord Endpoints Used:**
     - `GET /` (session initialization)
     - `POST /Home/SetSessionFromLocalData` (optional, non-critical)
     - `POST /Unit/SelectUnitFromUnitsList` (for each hall to check schedule)
   - **Functionality:** Returns all dining halls with `isOpen` status
   - **How it works:** Checks if halls have meals scheduled for today (fallback method)
   - **Performance:** ~2,530ms (needs optimization - makes multiple API calls)

2. **`GET /api/dining/halls/:id/menu`**
   - **Status:** ✅ Working
   - **Cbord Endpoints Used:**
     - `GET /` (session initialization)
     - `POST /Home/SetSessionFromLocalData` (optional)
     - `POST /Unit/SelectUnitFromUnitsList` (select dining hall)
   - **Functionality:** Returns menu schedule (dates and meals) for a specific dining hall
   - **Response:** Array of `DayMenu` objects with dates and meal periods

3. **`GET /api/dining/menu/:menuId/items`**
   - **Status:** ✅ Working
   - **Cbord Endpoints Used:**
     - `GET /` (session initialization)
     - `POST /Home/SetSessionFromLocalData` (optional)
     - `POST /Unit/SelectUnitFromUnitsList` (select dining hall)
     - `POST /Menu/SelectMenu` (get menu items)
   - **Functionality:** Returns detailed menu items for a specific meal
   - **Response:** Array of `MenuItem` objects with:
     - Name, description (serving size)
     - Allergens (parsed from images)
     - `detailOid` (for fetching nutrition)

4. **`GET /api/dining/nutrition/:detailOid`**
   - **Status:** ✅ Working
   - **Cbord Endpoints Used:**
     - `GET /` (session initialization)
     - `POST /NutritionDetail/ShowItemNutritionLabel` (get nutrition data)
   - **Functionality:** Returns detailed nutrition information for a menu item
   - **Response:** `NutritionInfo` object with:
     - Calories, Calories from Fat
     - Total Fat, Saturated Fat, Trans Fat
     - Cholesterol, Sodium, Potassium
     - Total Carbohydrate, Dietary Fiber, Sugars
     - Protein
     - Vitamins: A, C, Calcium, Iron, Vitamin D
     - Ingredients list
     - Allergens

## ❓ Potentially Missing Endpoints

### 1. `/Home/UpdateNavBar`
- **Status:** ❓ Not implemented (likely not needed)
- **What it does:** Updates the navigation bar UI (e.g., "My Meal" count)
- **When called:** On page load
- **Do we need it?** ❌ NO - This is UI-only for the browser interface
- **Decision:** Skip - not needed for backend API

### 2. Real-time Unit Status Endpoint
- **Status:** ❌ Not found yet
- **What we need:** An endpoint that returns real-time open/closed status for all units
- **Current workaround:** We check schedules to determine if halls are open
- **Possible names to look for:**
  - `/Unit/GetUnitsList`
  - `/Unit/GetUnitStatus`
  - `/Unit/GetUnitsStatus`
  - `/api/units/status`
- **Why it matters:** Would be faster and more accurate than checking schedules
- **Current performance impact:** Makes multiple API calls (one per hall) to check schedules

### 3. Dynamic Unit List Endpoint
- **Status:** ❌ Not implemented
- **What it does:** Returns list of all available dining units from Cbord
- **Current implementation:** We use hardcoded `DINING_HALLS` array
- **Do we need it?** ❓ MAYBE - Would make the system more maintainable if dining halls change
- **Priority:** Low (hardcoded list works fine)

## 📊 Main Functionality Status

### ✅ Working Features

1. **List Dining Halls**
   - ✅ Returns all 21 dining halls
   - ✅ Includes open/closed status (via schedule checking)
   - ⚠️ Slow (~2.5 seconds) - needs optimization

2. **Get Menu Schedule**
   - ✅ Returns dates and meal periods for a dining hall
   - ✅ Parses HTML correctly
   - ✅ Handles multiple days and meals

3. **Get Menu Items**
   - ✅ Returns all menu items for a meal
   - ✅ Extracts item names, serving sizes
   - ✅ Parses allergen information from images
   - ✅ Extracts `detailOid` for nutrition lookup

4. **Get Nutrition Information**
   - ✅ Returns detailed nutrition data
   - ✅ Parses all major nutrition fields
   - ✅ Handles vitamins, minerals, ingredients

### ⚠️ Areas for Improvement

1. **Performance**
   - `/api/dining/halls` is slow because it checks schedules for all 21 halls
   - **Solution:** Find and implement real-time status endpoint OR cache results

2. **Error Handling**
   - Currently falls back gracefully if endpoints fail
   - Could add more specific error messages

3. **Caching**
   - No caching implemented
   - Menu schedules and items could be cached (they change daily, not hourly)

## 🔍 How to Find Missing Endpoints

If you want to find the real-time unit status endpoint:

1. Open NetNutrition website: https://netnutrition.cbord.com/nn-prod/vucampusdining
2. Open Chrome DevTools (F12) → Network tab
3. Filter by "XHR" or "Fetch"
4. Look for:
   - Requests that return JSON (not HTML)
   - Requests with names containing "Unit", "Status", "List"
   - POST requests that might return unit information
5. Check the response to see if it contains open/closed status

## 📝 Summary

**All core functionalities are working:**
- ✅ List dining halls with status
- ✅ Get menu schedules
- ✅ Get menu items with allergens
- ✅ Get detailed nutrition information

**Potential improvements:**
- Find real-time unit status endpoint (would improve performance)
- Add caching for menu data
- Optimize `/api/dining/halls` endpoint (currently slow)

**Endpoints we don't need:**
- `/Home/UpdateNavBar` - UI-only
- `/Home/GetSkipAnchor` - UI-only
- `/Menu/ToggleCourseItems` - UI-only
- `/NutritionDetail/ShowMenuDetailNutritionGrid` - We use single-item endpoint instead

