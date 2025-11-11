# Quick Fix: Enable S3 Photo Storage

## Problem
Photos are being uploaded to local storage (Elastic Beanstalk), which gets wiped when the server restarts. That's why:
- New photos work immediately after upload
- Old photos disappear (404 errors)

## Solution: Configure S3 (Takes 10 minutes)

### Step 1: Create S3 Bucket (5 min)

1. Go to AWS S3 Console: https://console.aws.amazon.com/s3/
2. Click **"Create bucket"**
3. Settings:
   - **Bucket name**: `doresdine-photos` (or any unique name)
   - **Region**: `us-east-2` (same as your Elastic Beanstalk)
   - **Uncheck "Block all public access"** ⚠️ IMPORTANT
   - Click **"Create bucket"**

### Step 2: Set Bucket Policy (2 min)

1. Click on your bucket
2. Go to **"Permissions"** tab
3. Scroll to **"Bucket policy"**
4. Click **"Edit"** and paste this (replace `doresdine-photos` with your bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::doresdine-photos/*"
    }
  ]
}
```

5. Click **"Save changes"**

### Step 3: Create IAM User for Uploads (3 min)

1. Go to AWS IAM Console: https://console.aws.amazon.com/iam/
2. Click **"Users"** → **"Create user"**
3. Username: `doresdine-s3-uploader`
4. Click **"Next"**
5. Select **"Attach policies directly"**
6. Search for and select: **"AmazonS3FullAccess"**
7. Click **"Next"** → **"Create user"**
8. Click on the user → **"Security credentials"** tab
9. Click **"Create access key"**
10. Choose **"Application running outside AWS"**
11. Click **"Create access key"**
12. **COPY AND SAVE THESE:**
    - Access Key ID
    - Secret Access Key (you won't see it again!)

### Step 4: Set Environment Variables in Elastic Beanstalk (2 min)

1. Go to Elastic Beanstalk Console
2. Select your environment: `Doresdine-backend-env`
3. Click **"Configuration"** → **"Software"** → **"Edit"**
4. Scroll to **"Environment properties"**
5. Add these 4 variables:
   - `AWS_ACCESS_KEY_ID` = (from Step 3)
   - `AWS_SECRET_ACCESS_KEY` = (from Step 3)
   - `AWS_REGION` = `us-east-2`
   - `S3_BUCKET_NAME` = `doresdine-photos` (your bucket name)
6. Click **"Apply"**
7. Wait 2-3 minutes for environment to restart

### Step 5: Test (1 min)

1. Upload a new photo from the app
2. Check backend logs - you should see:
   ```
   ✅ S3 is configured - files will be stored in: doresdine-photos
   📤 Uploading to S3...
   ✅ File uploaded to S3 successfully
   ```
3. The photo should now have an S3 URL like:
   `https://doresdine-photos.s3.us-east-2.amazonaws.com/uploads/...`

## Verification

After setting environment variables, check backend logs:
- ✅ You should see: `✅ S3 is configured - files will be stored in: doresdine-photos`
- ❌ If you see: `⚠️  S3 is NOT configured`, the environment variables aren't set correctly

## Important Notes

- **Old photos are already lost** - they were stored locally and wiped
- **New photos will work forever** - they'll be in S3
- **Cost**: ~$0.12/month for 1,000 photos (very cheap!)

## Troubleshooting

### Photos still not loading after setup?

1. **Check backend logs** for S3 configuration message
2. **Verify bucket policy** allows public reads
3. **Test S3 URL directly** in browser - should show the image
4. **Check environment variables** are set correctly in Elastic Beanstalk
5. **Wait 2-3 minutes** after setting environment variables for restart

### Still using local storage?

Check backend logs when server starts. You should see:
```
✅ S3 is configured - files will be stored in: doresdine-photos
```

If you see warnings instead, the environment variables aren't being read. Make sure:
- Variables are set in Elastic Beanstalk Configuration → Software → Environment properties
- You clicked "Apply" and waited for restart
- Variable names are exact: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`

