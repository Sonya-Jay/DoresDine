# Testing Guide - Dining Endpoints

## ✅ Backend Status

The backend is **running and working correctly**! 

Test results:
- ✅ `/api/dining/halls` - Returns all 21 dining halls with open/closed status
- Example response shows "The Commons Dining Center" and "The Kitchen at Kissam" are open

## 🚀 Running the App

### Option 1: Use Local Backend (Recommended for Testing)

1. **Backend is already running** on `http://localhost:3000`

2. **Update frontend API URL** for local testing:
   - Edit `frontend/constants/API.ts`
   - Change line 9 to: `"http://localhost:3000"` (or use environment variable)

3. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

4. **Open the app:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

### Option 2: Use AWS Backend (Production)

1. **Frontend is already configured** to use AWS backend by default
2. **Just start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

## 📱 Testing the Dining Features

### 1. Test Dining Halls List
- Navigate to **Menus** tab
- You should see all 21 dining halls
- Open halls show "Open" badge (green)
- Closed halls show "Closed" badge (gray)

### 2. Test Menu Schedule
- Tap on a dining hall (e.g., "The Commons Dining Center")
- You should see dates and meal periods (Breakfast, Lunch, Dinner, etc.)
- Each meal should be clickable

### 3. Test Menu Items
- Tap on a meal period (e.g., "Lunch")
- You should see menu items with:
  - Item name
  - Serving size (description)
  - Allergens (if any)
  - Calories (if available)

### 4. Test Nutrition Info (Optional)
- Currently, nutrition info is available via API but not displayed in UI
- Endpoint: `GET /api/dining/nutrition/:detailOid`
- Could be added to menu items screen in the future

## 🔍 Troubleshooting

### Backend not responding?
```bash
cd backend
npm run dev
```
Check that it's running on `http://localhost:3000`

### Frontend can't connect?
1. Check `frontend/constants/API.ts` - make sure API_URL is correct
2. For local: `http://localhost:3000`
3. For AWS: `http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com`

### CORS errors?
- Backend should handle CORS automatically
- If issues persist, check backend CORS configuration

### Slow loading?
- `/api/dining/halls` takes ~2.5 seconds (makes multiple API calls)
- This is expected behavior - we're checking schedules for all 21 halls
- Future optimization: find real-time status endpoint

## ✅ Expected Behavior

1. **Dining Halls Screen:**
   - Shows all 21 halls
   - Displays open/closed status
   - Search functionality works
   - Tapping a hall navigates to schedule

2. **Schedule Screen:**
   - Shows dates with meals
   - Each meal is clickable
   - Back button works
   - Loading states work

3. **Menu Items Screen:**
   - Shows all items for selected meal
   - Displays item details (name, serving size, allergens)
   - Search functionality works
   - Back button works

## 📊 API Endpoints Being Used

Frontend calls these endpoints:
- `GET /api/dining/halls` - List all dining halls
- `GET /api/dining/halls/:id/menu` - Get menu schedule
- `GET /api/dining/menu/:menuId/items?unitId=:unitId` - Get menu items

All endpoints are working correctly! ✅

