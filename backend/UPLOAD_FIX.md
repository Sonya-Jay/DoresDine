# Photo Upload 413 Error Fix

## Problem
Getting **413 Payload Too Large** error when uploading photos. This is because:
1. AWS Elastic Beanstalk (nginx) has a default 1MB request body limit
2. Photos from iOS devices can be several MB in size
3. The backend wasn't configured to handle larger files

## Solution

### 1. AWS Elastic Beanstalk Configuration (`.ebextensions`)
Created configuration files to increase nginx's `client_max_body_size`:

- **`.ebextensions/01_nginx.config`**: Sets nginx to accept up to 20MB requests
- **`.ebextensions/02_proxy.config`**: Reloads nginx after configuration

### 2. Backend Code Changes

#### Multer Configuration (`src/routes/upload.ts`)
- Added file size limit: 20MB max per file
```typescript
const upload = multer({ 
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB in bytes
  },
});
```

#### Express Middleware (`src/index.ts`)
- Increased JSON body size limit to 20MB (for large posts)
- Kept conditional parsing to avoid interfering with multer

### 3. Files Updated
- ✅ `backend/src/routes/upload.ts` - Added multer file size limit
- ✅ `backend/src/index.ts` - Increased JSON body size limit
- ✅ `backend/.ebextensions/01_nginx.config` - AWS nginx configuration
- ✅ `backend/.ebextensions/02_proxy.config` - Nginx reload command
- ✅ `backend/deploy.sh` - Updated to include .ebextensions

## Deployment

### New ZIP Created
The deployment ZIP now includes:
- `dist/` - Compiled JavaScript with fixes
- `.ebextensions/` - AWS configuration files
- `package.json`, `package-lock.json`, `Procfile`

### Deploy Steps
1. Upload `doresdine-backend-deploy.zip` to AWS Elastic Beanstalk
2. Wait for deployment to complete
3. AWS will automatically apply the `.ebextensions` configuration
4. Test photo upload from the app

## Testing

### After Deployment
```bash
# Test health check
curl http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/health

# Test upload with a larger file (if you have one)
curl -X POST http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/upload/photo \
  -H "X-User-Id: d14e38ed-daed-4328-a9e7-f4beb8a7ba8c" \
  -F "photo=@large-image.jpg"
```

### Expected Behavior
- ✅ Photos up to 20MB should upload successfully
- ✅ Photos larger than 20MB will return "File too large" error
- ✅ No more 413 errors for normal-sized photos

## Troubleshooting

### If uploads still fail:
1. **Check AWS CloudWatch logs** for nginx errors
2. **Verify .ebextensions are applied**:
   - Check deployment logs
   - Verify nginx configuration: `sudo cat /etc/nginx/conf.d/proxy.conf`
3. **Check file size**: Make sure photos are under 20MB
4. **Verify multer configuration**: Check backend logs for multer errors

### Common Issues

**413 error persists:**
- `.ebextensions` might not have been applied
- Check AWS deployment logs
- Verify nginx configuration file exists

**Internal server error:**
- Check backend logs for multer errors
- Verify uploads directory permissions
- Check database connection

**File uploads but post creation fails:**
- Check if storage_key is being returned correctly
- Verify post creation endpoint is working
- Check database for inserted records

## Next Steps

For production, consider:
1. **Image compression** - Compress images before upload to reduce size
2. **S3 storage** - Use AWS S3 instead of local file system (files are ephemeral on EB)
3. **CDN** - Use CloudFront to serve uploaded images
4. **Image optimization** - Resize/compress images on upload

## File Size Limits

- **Nginx (AWS)**: 20MB (configured in .ebextensions)
- **Multer (Backend)**: 20MB (configured in upload.ts)
- **Express JSON**: 20MB (configured in index.ts)

All limits are set to 20MB to allow for high-quality photos while preventing abuse.

