# Setting Up S3 for Photo Storage

## Why S3?
- **Persistent storage** - Photos never get lost
- **Scalable** - Handles any amount of photos
- **Fast** - CDN-backed delivery
- **Cost-effective** - Pay only for what you use

## Step 1: Create S3 Bucket

1. **Go to AWS S3 Console**
   - https://console.aws.amazon.com/s3/
   - Make sure you're in `us-east-2` region

2. **Create Bucket**
   - Click "Create bucket"
   - Bucket name: `doresdine-photos` (or your preferred name)
   - Region: `us-east-2`
   - **Uncheck "Block all public access"** (or configure bucket policy for public read)
   - Click "Create bucket"

3. **Configure Bucket Policy (for public read access)**
   - Go to bucket → Permissions → Bucket policy
   - Add this policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::doresdine-photos/*"
       }
     ]
   }
   ```
   - Replace `doresdine-photos` with your bucket name

## Step 2: Create IAM User for S3 Access

1. **Go to AWS IAM Console**
   - https://console.aws.amazon.com/iam/
   - Click "Users" → "Create user"

2. **Create User**
   - Username: `doresdine-s3-uploader`
   - Click "Next"

3. **Attach Policy**
   - Click "Attach policies directly"
   - Search for "S3" and select: **AmazonS3FullAccess** (or create custom policy with only PutObject, GetObject permissions)
   - Click "Next" → "Create user"

4. **Get Access Keys**
   - Click on the user → "Security credentials" tab
   - Click "Create access key"
   - Choose "Application running outside AWS"
   - Click "Create access key"
   - **SAVE THESE CREDENTIALS** (you won't see them again):
     - Access Key ID
     - Secret Access Key

## Step 3: Set Environment Variables in Elastic Beanstalk

1. **Go to Elastic Beanstalk Console**
   - Select your environment: `Doresdine-backend-env`
   - Click "Configuration" → "Software" → "Edit"

2. **Add Environment Variables**
   - `AWS_ACCESS_KEY_ID` = (your access key ID from step 2)
   - `AWS_SECRET_ACCESS_KEY` = (your secret access key from step 2)
   - `AWS_REGION` = `us-east-2`
   - `S3_BUCKET_NAME` = `doresdine-photos` (or your bucket name)

3. **Click "Apply"**
   - Wait for environment to restart

## Step 4: Redeploy Backend

After setting environment variables, redeploy the backend with the new S3 code:

1. Upload `doresdine-backend-deploy.zip` to Elastic Beanstalk
2. Wait for deployment to complete
3. Test photo upload

## Step 5: Test

After deployment, upload a photo from the app. It should:
- Upload to S3
- Return S3 URL as `storage_key`
- Display correctly on the feed

## Migration of Old Photos

**Note:** Old photos stored locally are already lost (404 errors). Going forward, all new photos will be stored in S3 and persist forever.

If you have old photos you want to keep:
1. Download them from your local machine (if you have backups)
2. Re-upload them through the app (they'll go to S3)

## Cost Estimate

S3 pricing (us-east-2):
- Storage: ~$0.023 per GB/month
- Requests: ~$0.0004 per 1,000 GET requests
- Uploads: Free

For 1,000 photos (~5MB each = 5GB):
- Storage: ~$0.12/month
- Very affordable!

## Security Note

The bucket policy above makes all photos publicly readable. For production, consider:
- Using signed URLs (temporary access)
- Requiring authentication to view photos
- Using CloudFront CDN with access controls

