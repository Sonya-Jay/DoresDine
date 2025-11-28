# Nutrition Endpoint Fix

## Issues Fixed

### 1. ✅ Nutrition Endpoint Not Working
**Problem:** The nutrition endpoint was returning "Nutrition information not found" errors.

**Root Causes:**
- Missing session setup (unit and menu not selected)
- Response format detection was too strict
- Parsing validation required calories to be present

**Solutions:**
1. **Added optional unitId and menuId parameters** to the nutrition endpoint
   - Route: `GET /api/dining/nutrition/:detailOid?unitId=X&menuId=Y`
   - These help set up the proper Cbord session context

2. **Improved session setup** in `getItemNutrition()`
   - Now selects unit and menu if provided
   - Ensures proper context for fetching nutrition data

3. **Enhanced response format detection**
   - Handles both direct HTML and JSON responses with HTML panels
   - More robust parsing

4. **Improved parsing**
   - Multiple methods to extract calories
   - Returns nutrition even if calories parsing fails (important for allergens)
   - Added allergen extraction from nutrition labels

5. **Updated type definitions**
   - Added `itemName` and `allergens` to nutrition type
   - Made `calories` optional (not required for dietary restrictions)

## Usage

### Basic Call (may work without context):
```bash
GET /api/dining/nutrition/264361007
```

### Recommended Call (with context for better reliability):
```bash
GET /api/dining/nutrition/264361007?unitId=2&menuId=8729008
```

## Response Format

```json
{
  "itemName": "Cheese Pizza",
  "calories": 640,
  "caloriesFromFat": 252,
  "totalFat": 28,
  "saturatedFat": 14,
  "transFat": 0,
  "cholesterol": 60,
  "sodium": 1450,
  "potassium": 140,
  "totalCarbohydrate": 71,
  "dietaryFiber": 4,
  "sugars": 7,
  "protein": 32,
  "vitaminA": 0,
  "vitaminC": 0,
  "calcium": 50,
  "iron": 30,
  "vitaminD": 0,
  "ingredients": "Dough Pizza Crust White...",
  "allergens": ["Dairy", "Gluten"]
}
```

## For Dietary Restrictions Filtering

The nutrition data now includes:
- ✅ **Allergens** - Critical for filtering (Dairy, Gluten, Soy, etc.)
- ✅ **Calories** - For calorie-based filtering
- ✅ **Macronutrients** - Fat, carbs, protein for macro-based diets
- ✅ **Ingredients** - For ingredient-based restrictions
- ✅ **Vitamins/Minerals** - For nutritional requirements

## Next Steps

1. **Frontend Integration:**
   - Fetch nutrition when displaying menu items (optional, on-demand)
   - Use allergens for dietary restriction filtering
   - Display nutrition info in UI

2. **Caching:**
   - Cache nutrition data (changes infrequently)
   - Reduce API calls to Cbord

3. **Bulk Fetching:**
   - Consider fetching nutrition for all items in a meal at once
   - More efficient than individual calls

## Testing

Test the endpoint:
```bash
# With context (recommended)
curl "http://localhost:3000/api/dining/nutrition/264361007?unitId=2&menuId=8729008"

# Without context (may work)
curl "http://localhost:3000/api/dining/nutrition/264361007"
```

The endpoint should now return complete nutrition information including allergens for dietary restriction filtering! ✅

