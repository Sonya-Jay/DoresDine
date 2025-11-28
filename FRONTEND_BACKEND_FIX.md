# Frontend Backend Connection Fix

## Problem
- Frontend takes a few seconds to load dining halls
- All halls show as "Closed" even though backend shows some as open
- AWS backend shows all halls as closed (needs updated code)

## Root Cause
The frontend is likely using the **AWS backend** which doesn't have the updated hours-based status calculation code. The local backend is working correctly.

## Solution Options

### Option 1: Use Local Backend (For Development) ✅ RECOMMENDED

Make sure your frontend is using `localhost:3000` in development:

1. **Check if you're in dev mode:**
   - If running `npm start` or `expo start`, you should be in `__DEV__` mode
   - The frontend should automatically use `localhost:3000`

2. **Verify the backend URL:**
   - Check the console logs when the app starts
   - Should see: `[API] Using backend: http://localhost:3000`
   - Should see: `[DEBUG] Fetching dining halls from: http://localhost:3000/api/dining/halls`

3. **If it's using AWS instead:**
   - Create a `.env` file in `frontend/` directory:
     ```
     EXPO_PUBLIC_API_URL=http://localhost:3000
     ```
   - Restart the Expo dev server

### Option 2: Deploy Updated Backend to AWS (For Production)

If you need to use the AWS backend:

1. **Build and package:**
   ```bash
   cd backend
   ./deploy.sh
   ```

2. **Upload to AWS Elastic Beanstalk:**
   - Go to AWS Elastic Beanstalk console
   - Select your environment
   - Click "Upload and Deploy"
   - Upload `doresdine-backend-deploy.zip`
   - Wait for deployment to complete

3. **Verify deployment:**
   ```bash
   curl "http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/api/dining/halls" | python3 -c "import sys, json; data = json.load(sys.stdin); print('Open:', sum(1 for h in data if h.get('isOpen') == True))"
   ```
   Should show 6 halls as open (not 0)

## Current Status

- ✅ **Local Backend** (`localhost:3000`): Working correctly - 6 halls open, 15 closed
- ❌ **AWS Backend**: Needs deployment - all 21 halls showing as closed

## Debugging

Added debug logging to `fetchDiningHalls()` to show:
- Which backend URL is being used
- How many halls are open/closed/undefined

Check your frontend console logs to see which backend is being used.

