# Photo Display Issue - Files Not Found (404)

## Problem
Photos uploaded to the feed are returning 404 errors because:
- Files are stored in `/uploads` directory on the server
- Elastic Beanstalk instances are **ephemeral** - files are lost when server restarts/scales
- The `uploads` directory doesn't persist between deployments

## Solution: Use AWS S3 for File Storage

### Quick Fix (For Now)
The photos that were uploaded before are lost. New uploads will work until the server restarts.

### Permanent Solution: Migrate to S3

1. **Create S3 Bucket**
   - Go to AWS S3 Console
   - Create bucket: `doresdine-uploads` (or similar)
   - Region: `us-east-2`
   - Block public access: **OFF** (or configure bucket policy)

2. **Update Backend Upload Route**
   - Install `aws-sdk` or `@aws-sdk/client-s3`
   - Upload files to S3 instead of local disk
   - Return S3 URL as `storage_key`

3. **Update Photo URL Construction**
   - If `storage_key` is S3 URL, use it directly
   - If `storage_key` is S3 key, construct S3 URL

## Temporary Workaround

For now, photos will work for:
- New uploads (until server restarts)
- Files uploaded after last deployment

Old photos are lost and need to be re-uploaded.

## Testing

After fixing, test by:
1. Creating a new post with photos
2. Checking if photos display on feed
3. Verifying photo URLs are accessible

