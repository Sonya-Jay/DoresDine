# Immediate Fix for "Failed to Fetch"

## ✅ CORS is Working on Backend!

I tested it - the backend HAS CORS headers. The issue is likely:

## Most Common Fix: Browser Cache

**Your teammate needs to:**

1. **Hard refresh the browser:**
   - **Mac**: `Cmd + Shift + R`
   - **Windows/Linux**: `Ctrl + Shift + R`
   - **Or**: Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

2. **Clear Expo cache:**
   ```bash
   cd frontend
   # Stop current server (Ctrl+C)
   npx expo start --clear
   ```

3. **Close and reopen the browser tab completely**

## Check What's Actually Happening

Have your teammate check the browser console:

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Try the request again**
4. **Click on the failed request** (should be red)
5. **Check:**
   - **Request URL**: Should be `http://doresdine-backend-env.../posts`
   - **Status**: What's the status code? (200, 404, 500, CORS error?)
   - **Response Headers**: Look for `Access-Control-Allow-Origin`

## If Still Not Working: Check Frontend URL

The frontend might be using the wrong backend URL. Check console for:

```
[API] Using backend: http://...
```

**If it says `localhost:3000`:**
- The frontend is trying to connect to local backend (which isn't running)
- **Fix**: In `frontend/.env`, add:
  ```bash
  EXPO_PUBLIC_API_URL=http://doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com
  ```
- Then restart: `npx expo start --clear`

## Quick Test

Your teammate can test in browser console (F12):

```javascript
fetch('http://doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

If this works → CORS is fine, issue is in frontend code
If this fails → There's a network/CORS issue

## Deploy Updated Backend (If Not Done Yet)

I've created an improved CORS configuration. Deploy it:

1. **Upload to AWS:**
   - Go to: https://console.aws.amazon.com/elasticbeanstalk
   - Select `Doresdine-backend-env`
   - Click "Upload and deploy"
   - Upload: `backend/doresdine-backend-deploy.zip`
   - Wait 2-3 minutes

2. **After deployment, have teammate hard refresh browser**

## Most Likely Solution:

**Hard refresh the browser** (`Cmd+Shift+R` or `Ctrl+Shift+R`) - This fixes it 90% of the time!

