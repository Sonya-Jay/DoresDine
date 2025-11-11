# Troubleshooting Backend Deployment

## Issue: 502 Bad Gateway / Degraded Health

This means nginx is running but can't connect to your Node.js app. The app is likely crashing on startup.

## Required Environment Variables

Make sure these are set in AWS Elastic Beanstalk:

1. **DATABASE_URL** (REQUIRED)
   - Format: `postgresql://username:password@host:port/database`
   - Example: `postgresql://doresdblogin:vandydoresdine@doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com:5432/doresdine`

2. **JWT_SECRET** (Optional, has fallback)
   - Set a secure random string for production
   - Example: `your-super-secret-jwt-key-here`

3. **NODE_ENV** (Optional)
   - Set to `production`

4. **PORT** (Auto-set by Elastic Beanstalk)
   - Usually `3000` or `8080`

## How to Check/Set Environment Variables in AWS

1. Go to AWS Elastic Beanstalk Console
2. Select your environment: `Doresdine-backend-env`
3. Click **Configuration** in left sidebar
4. Scroll down to **Software** section
5. Click **Edit**
6. Scroll to **Environment properties**
7. Add/Update:
   - `DATABASE_URL` = `postgresql://doresdblogin:vandydoresdine@doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com:5432/doresdine`
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = (generate a secure random string)
8. Click **Apply**

## Check Application Logs

1. In Elastic Beanstalk Console
2. Click **Logs** in left sidebar
3. Click **Request Logs** → **Last 100 Lines**
4. Look for errors like:
   - "Error connecting to database"
   - "DATABASE_URL exists: false"
   - Any stack traces

## Common Issues

### 1. Missing DATABASE_URL
**Symptom:** App crashes immediately on startup
**Fix:** Set DATABASE_URL in environment variables

### 2. Database Connection Failed
**Symptom:** Health check returns 503, database: "disconnected"
**Fix:** 
- Check RDS security group allows connections from Elastic Beanstalk
- Verify DATABASE_URL is correct
- Check RDS instance is running

### 3. Port Mismatch
**Symptom:** App starts but nginx can't connect
**Fix:** Elastic Beanstalk usually handles this automatically, but check PORT env var

### 4. Missing Dependencies
**Symptom:** "Cannot find module" errors in logs
**Fix:** Make sure `package.json` and `package-lock.json` are in deployment zip

## Quick Test

After setting environment variables, wait 1-2 minutes, then:

```bash
curl http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/health
```

Should return:
```json
{"status":"ok","database":"connected"}
```

## Next Steps

1. Check environment variables are set
2. Check application logs for errors
3. Wait 2-3 minutes for deployment to complete
4. Test health endpoint again

