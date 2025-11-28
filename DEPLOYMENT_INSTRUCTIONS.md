# Deployment Instructions - Backend to AWS Elastic Beanstalk

## ✅ Deployment Package Created!

**File:** `backend/doresdine-backend-deploy.zip`  
**Size:** ~112KB  
**Location:** `/Users/sonya/Documents/doresdine-test/backend/doresdine-backend-deploy.zip`

## 📦 What's Included

The deployment package includes:
- ✅ **dist/** - All compiled JavaScript files (including new nutrition endpoint)
- ✅ **package.json** - Dependencies
- ✅ **package-lock.json** - Locked versions
- ✅ **Procfile** - Startup command
- ✅ **.ebextensions/** - AWS configuration (nginx settings)

## 🚀 Deployment Steps

### 1. Go to AWS Elastic Beanstalk Console
- Navigate to: https://console.aws.amazon.com/elasticbeanstalk/
- Select your environment: **Doresdine-backend-env**

### 2. Upload and Deploy
1. Click **"Upload and deploy"** button
2. Click **"Choose file"**
3. Select: `backend/doresdine-backend-deploy.zip`
4. Add a **Version label** (e.g., "nutrition-endpoint-v1")
5. Click **"Deploy"**

### 3. Wait for Deployment
- AWS will:
  - Upload the ZIP file
  - Install dependencies (`npm install`)
  - Start the application
  - Apply `.ebextensions` configuration
- This usually takes **2-5 minutes**

### 4. Verify Deployment

After deployment completes, test the endpoints:

```bash
# Health check
curl http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/health

# Test dining halls (should include open/closed status)
curl http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/api/dining/halls

# Test nutrition endpoint (use a real detailOid from menu items)
curl http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/api/dining/nutrition/264361007
```

## 🔄 What Changed in This Deployment

### New Features:
1. **Nutrition Endpoint** - `GET /api/dining/nutrition/:detailOid`
   - Returns detailed nutrition information for menu items
   - Includes calories, fats, carbs, protein, vitamins, ingredients

2. **Enhanced Menu Items**
   - Menu items now include `detailOid` field
   - This ID is used to fetch nutrition information

3. **Updated Cbord Service**
   - Added `getItemNutrition()` method
   - Enhanced `parseMenuItems()` to extract `detailOid`
   - Improved nutrition label parsing

## ⚠️ Important Notes

### Environment Variables
Make sure these are set in AWS Console (Configuration → Software → Environment properties):
- `DATABASE_URL` - Your RDS connection string
- `NODE_ENV` - `production`
- `PORT` - `3000` (usually auto-set)

### No Database Changes Required
- No new migrations needed
- All changes are in code only

### Frontend Compatibility
- Frontend will work with both old and new backend
- Nutrition endpoint is optional (frontend doesn't use it yet)
- All existing endpoints remain unchanged

## 🐛 Troubleshooting

### Deployment Fails?
1. Check **CloudWatch Logs** in AWS Console
2. Look for errors in `/var/log/eb-engine.log`
3. Verify environment variables are set correctly

### Endpoints Not Working?
1. Check health endpoint first: `/health`
2. Verify the environment is "Healthy" (green status)
3. Check CloudWatch logs for errors

### Slow Response Times?
- `/api/dining/halls` takes ~2.5 seconds (expected - checks schedules for all halls)
- This is normal behavior

## 📝 Next Steps

After deployment:
1. ✅ Test the endpoints (see commands above)
2. ✅ Verify frontend still works (it should)
3. ✅ Optional: Add nutrition display to frontend UI later

## 🔗 Quick Links

- **AWS Console:** https://console.aws.amazon.com/elasticbeanstalk/
- **Backend URL:** http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com
- **Health Check:** http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/health

---

**Ready to deploy!** 🚀

