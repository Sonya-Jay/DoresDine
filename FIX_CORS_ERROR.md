# Fix CORS Error for Teammate

## The Problem
Your teammate is getting a CORS error when trying to access the backend from `localhost:8081`. The backend needs to allow cross-origin requests.

## Solution: Add CORS to Backend

I've already added CORS support to the backend code. Now you need to:

### Option 1: Deploy Updated Backend to AWS (Recommended)

1. **Build and deploy the backend:**
   ```bash
   cd backend
   bash deploy.sh
   ```

2. **Upload the zip file to AWS Elastic Beanstalk:**
   - Go to AWS Console → Elastic Beanstalk
   - Select your environment
   - Click "Upload and deploy"
   - Upload `doresdine-backend-deploy.zip`
   - Wait for deployment (2-3 minutes)

3. **Your teammate should now be able to connect!**

### Option 2: Run Backend Locally (Quick Test)

If you want to test locally first:

1. **Make sure you have the updated code:**
   ```bash
   cd backend
   npm install  # Install cors package
   ```

2. **Start the backend:**
   ```bash
   npm run dev
   ```

3. **Update frontend to use localhost:**
   - In `frontend/.env`, set:
     ```bash
     EXPO_PUBLIC_API_URL=http://localhost:3000
     ```
   - Or your teammate can do this locally

4. **Restart frontend:**
   ```bash
   cd frontend
   npm start
   ```

## What Changed

I added CORS middleware to `backend/src/index.ts` that allows:
- Requests from `localhost:8081` (Expo web)
- Requests from any localhost port
- Requests from local network IPs (for mobile testing)
- All necessary headers (Authorization, x-user-id, etc.)

## For Your Teammate

**If you deploy to AWS:**
- They don't need to do anything - just refresh their browser
- The CORS error should be gone

**If you want them to test locally:**
1. They need to pull the latest code
2. Run `cd backend && npm install`
3. Run `npm run dev` in backend
4. Update their `frontend/.env` to use `http://localhost:3000`
5. Restart their frontend

## Quick Check

After deployment, test the CORS headers:
```bash
curl -H "Origin: http://localhost:8081" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/posts \
     -v
```

You should see `Access-Control-Allow-Origin: http://localhost:8081` in the response headers.

