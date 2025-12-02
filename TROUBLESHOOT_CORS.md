# Troubleshooting "Failed to Fetch" After CORS Fix

## ✅ Good News: CORS Headers Are Working!

I tested the backend and CORS headers are present:
- `Access-Control-Allow-Origin: http://localhost:8081` ✅
- `Access-Control-Allow-Credentials: true` ✅

## But You're Still Getting "Failed to Fetch" - Here's Why:

### Issue 1: Frontend Cache
The frontend might be using cached code. **Your teammate needs to:**

1. **Hard refresh the browser:**
   - **Chrome/Edge**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - **Or**: Open DevTools → Right-click refresh button → "Empty Cache and Hard Reload"

2. **Clear Expo cache:**
   ```bash
   cd frontend
   # Stop the current server (Ctrl+C)
   # Clear cache and restart
   npx expo start --clear
   ```

3. **Restart the frontend completely:**
   - Close the browser tab
   - Stop Expo (`Ctrl+C`)
   - Start fresh: `npm start`

### Issue 2: Frontend Using Wrong Backend URL

Check what URL the frontend is actually using:

1. **Open browser DevTools Console**
2. **Look for this log message:**
   ```
   [API] Using backend: http://...
   ```
3. **If it says `localhost:3000` but backend is on AWS:**
   - The frontend is trying to connect to local backend (which isn't running)
   - Solution: Make sure `frontend/.env` doesn't override the URL, OR set:
     ```bash
     EXPO_PUBLIC_API_URL=http://doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com
     ```

### Issue 3: Network/Firewall Issue

The request might be blocked:

1. **Check if backend is accessible:**
   - Open: http://doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/health
   - Should show: `{"status":"ok","database":"connected"}`

2. **Check browser console for specific error:**
   - Look for the exact error message
   - Is it CORS? Network error? Timeout?

### Issue 4: Mixed HTTP/HTTPS

If the page is `https://` but backend is `http://`, browsers block it:

- **Solution**: Make sure both are HTTP (or both HTTPS)
- Or use `http://localhost:8081` (not `https://`)

## Quick Fix Steps for Your Teammate:

1. **Hard refresh browser** (`Cmd+Shift+R` or `Ctrl+Shift+R`)

2. **Check console for the actual error:**
   - Open DevTools → Console tab
   - Look for the exact error message
   - Take a screenshot of the full error

3. **Check which backend URL is being used:**
   - Look for `[API] Using backend:` in console
   - Should be: `http://doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com`

4. **Clear Expo cache and restart:**
   ```bash
   cd frontend
   npx expo start --clear
   ```

5. **If still not working, check network tab:**
   - DevTools → Network tab
   - Try the request again
   - Click on the failed request
   - Check:
     - Request URL (is it correct?)
     - Status code (what error?)
     - Response headers (are CORS headers there?)

## Test CORS Manually:

Your teammate can test if CORS is working:

```bash
# In browser console (F12), run:
fetch('http://doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/health', {
  headers: { 'Origin': 'http://localhost:8081' }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

If this works, CORS is fine and the issue is elsewhere.

## Most Likely Fix:

**Hard refresh the browser** - This fixes 90% of "still not working" issues after deployment!

