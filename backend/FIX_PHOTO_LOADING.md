# Fix Photo Loading Issues

## Problem
Photos aren't loading because the S3 bucket doesn't have public read access configured.

## Solution

### Step 1: Configure S3 Bucket Policy

1. Go to AWS S3 Console
2. Select your bucket (the one specified in `S3_BUCKET_NAME` environment variable)
3. Go to **Permissions** tab
4. Scroll down to **Bucket policy**
5. Click **Edit** and add the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/uploads/*"
    }
  ]
}
```

**Important:** Replace `YOUR_BUCKET_NAME` with your actual bucket name.

### Step 2: Disable Block Public Access (if needed)

1. In the same **Permissions** tab
2. Scroll to **Block public access (bucket settings)**
3. Click **Edit**
4. **Uncheck** "Block all public access" (or at least uncheck "Block public access to buckets and objects granted through new access control lists (ACLs)")
5. Click **Save changes**
6. Confirm by typing "confirm"

### Step 3: Verify CORS Configuration (Optional but Recommended)

1. Go to **Permissions** tab
2. Scroll to **Cross-origin resource sharing (CORS)**
3. Click **Edit** and add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### Step 4: Test

1. Upload a new photo through the app
2. Check the backend logs for the S3 URL
3. Try accessing the URL directly in a browser
4. If you see the image, the bucket is configured correctly

## Troubleshooting

### Old Posts Have Missing Photos

If old posts have photos that were stored locally (before S3 was set up), those photos are lost because Elastic Beanstalk storage is ephemeral. You have two options:

1. **Delete old posts** (if they're test data)
2. **Re-upload photos** for important posts
3. **Migrate existing photos to S3** (if you have backups)

### Photos Still Not Loading After Configuration

1. Check that the bucket policy resource path matches your upload path:
   - If you upload to `uploads/`, the resource should be `arn:aws:s3:::BUCKET_NAME/uploads/*`
   - Make sure the path in the policy matches exactly

2. Verify the S3 URL format:
   - Check backend logs when uploading
   - The URL should be: `https://BUCKET_NAME.s3.REGION.amazonaws.com/uploads/FILENAME.jpg`
   - Try accessing this URL directly in a browser

3. Check environment variables:
   - `AWS_ACCESS_KEY_ID` - Must be set
   - `AWS_SECRET_ACCESS_KEY` - Must be set
   - `AWS_REGION` - Must match your bucket region
   - `S3_BUCKET_NAME` - Must be the exact bucket name

4. Check CloudWatch logs for errors:
   - Look for S3 upload errors
   - Check for permission denied errors

## Testing Photo URLs

After uploading a photo, check the backend logs. You should see:
```
✅ File uploaded to S3 successfully
   URL: https://your-bucket.s3.us-east-2.amazonaws.com/uploads/1234567890-123456789.jpg
   Key: uploads/1234567890-123456789.jpg
   Bucket: your-bucket
   Region: us-east-2
   ContentType: image/jpeg
```

Try accessing that URL directly in a browser. If it works, the bucket is configured correctly.

## Next Steps

After fixing the bucket permissions:
1. Rebuild and redeploy the backend
2. Test uploading a new photo
3. Verify the photo loads in the app
4. Check that old posts (if any) work correctly

