# Photo Loading Issue - Explanation & Solution

## What's Happening

1. **Photos are uploaded successfully** ✅
   - Files are saved to local storage on Elastic Beanstalk
   - Upload returns success with `storage_key: "uploads/filename.jpg"`

2. **Photos work immediately after upload** ✅
   - File exists on the server
   - Can be accessed via `/uploads/filename.jpg`

3. **Photos disappear later** ❌
   - Elastic Beanstalk storage is **ephemeral** (temporary)
   - When server restarts or scales, files are **deleted**
   - Result: 404 errors when trying to load photos

## Proof

Testing the URL directly confirms files are gone:
```bash
curl -I "http://doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/uploads/1762856249616-85601031.jpg"
# Returns: HTTP/1.1 404 Not Found
```

## The Solution: Configure S3

**This is the ONLY way to fix this permanently.**

Follow: `backend/QUICK_FIX_S3.md` (takes ~10 minutes)

### Quick Steps:
1. Create S3 bucket
2. Set bucket policy for public reads
3. Create IAM user with S3 access
4. Set environment variables in Elastic Beanstalk:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` = `us-east-2`
   - `S3_BUCKET_NAME` = your bucket name
5. Redeploy backend
6. Test upload - should return S3 URL

## After S3 Configuration

### What Changes:
- **New uploads**: Will go to S3 and persist forever ✅
- **Old photos**: Already lost (can't recover) ❌
- **URLs**: Will be S3 URLs like `https://bucket.s3.region.amazonaws.com/uploads/...`

### Verification:
After configuring S3 and redeploying, check backend logs on startup:
```
✅ S3 is configured - files will be stored in: doresdine-photos
```

When uploading a photo, you should see:
```
📤 Uploading to S3...
✅ File uploaded to S3 successfully
   URL: https://doresdine-photos.s3.us-east-2.amazonaws.com/uploads/...
```

## Why This Happens

Elastic Beanstalk uses EC2 instances with **ephemeral storage**:
- Files stored on the instance are **temporary**
- Instance restarts = files deleted
- Instance scales = new instance = no files
- This is **expected behavior** for EB

**S3 is the standard solution** for persistent file storage on AWS.

## Cost

S3 is very cheap:
- ~$0.12/month for 1,000 photos
- Free uploads
- Pay only for storage and requests

## Next Steps

1. **Follow `QUICK_FIX_S3.md`** to set up S3
2. **Set environment variables** in Elastic Beanstalk
3. **Redeploy backend** (already built: `doresdine-backend-deploy.zip`)
4. **Test upload** - should return S3 URL
5. **Re-upload important photos** (old ones are lost)

## Important Notes

- ❌ **Old photos cannot be recovered** - they're already deleted
- ✅ **New photos will work forever** - once S3 is configured
- ⚠️ **This is not a code bug** - it's how Elastic Beanstalk works
- ✅ **S3 is the standard solution** - used by all production apps

