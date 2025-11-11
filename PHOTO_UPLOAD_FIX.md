# Photo Upload Error Fix

## Issues Found

1. **Backend Error Handling**: The upload route lacked proper error handling for multer errors
2. **Middleware Order**: `express.json()` might interfere with multipart/form-data uploads
3. **Error Messages**: Frontend wasn't getting detailed error messages from backend
4. **AWS File Storage**: On AWS Elastic Beanstalk, the file system is ephemeral - uploads may not persist

## Changes Made

### Backend (`backend/src/routes/upload.ts`)
- ✅ Added comprehensive error handling for multer errors
- ✅ Added logging for upload success/failure
- ✅ Improved error messages
- ✅ Fixed path handling for cross-platform compatibility

### Backend (`backend/src/index.ts`)
- ✅ Modified middleware to skip JSON parsing for upload routes
- ✅ This prevents `express.json()` from interfering with multipart/form-data

### Frontend (`frontend/services/api.ts`)
- ✅ Improved error handling and logging
- ✅ Better file type detection
- ✅ More detailed error messages

### Frontend (`frontend/components/PhotoSelector.tsx`)
- ✅ Fixed ImagePicker deprecation warning (temporary)

## Next Steps

### 1. Rebuild and Redeploy Backend

The backend code has been updated but needs to be rebuilt and redeployed:

```bash
cd backend
npm run build
# Then deploy to AWS Elastic Beanstalk
```

### 2. Check AWS Logs

After redeploying, check AWS CloudWatch logs for:
- Upload errors
- File system permissions
- Path resolution issues

### 3. AWS File Storage Consideration

**Important**: On AWS Elastic Beanstalk, the file system is ephemeral. Files uploaded to the server will be lost when:
- The server restarts
- The environment scales
- The instance is replaced

**Solution**: Use AWS S3 for file storage:
1. Create an S3 bucket
2. Configure AWS SDK in backend
3. Upload files directly to S3
4. Store S3 URLs in database
5. Serve files from S3 or CloudFront

### 4. Test Upload

After redeploying, test the upload:
1. Try uploading a photo from the app
2. Check backend logs for errors
3. Verify file is saved (if using local storage)
4. Check if photo URL is returned correctly

## Testing

### Local Testing
```bash
# Test upload endpoint directly
curl -X POST http://localhost:3000/upload/photo \
  -H "X-User-Id: d14e38ed-daed-4328-a9e7-f4beb8a7ba8c" \
  -F "photo=@/path/to/test-image.jpg"
```

### AWS Testing
```bash
# Test upload endpoint on AWS
curl -X POST http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/upload/photo \
  -H "X-User-Id: d14e38ed-daed-4328-a9e7-f4beb8a7ba8c" \
  -F "photo=@/path/to/test-image.jpg"
```

## Expected Behavior

### Success Response
```json
{
  "storage_key": "uploads/1234567890-123456789.jpg"
}
```

### Error Response
```json
{
  "error": "No file uploaded"
}
```

## Troubleshooting

### "No file uploaded" error
- Check if FormData is being sent correctly
- Verify multer is receiving the file
- Check backend logs for multer errors

### "Internal server error" during upload
- Check file system permissions on AWS
- Verify uploads directory exists
- Check AWS CloudWatch logs for details

### Files not persisting
- This is expected on AWS Elastic Beanstalk
- Files are stored on ephemeral file system
- Implement S3 storage for production

## Production Recommendation

**Use AWS S3 for file storage:**
1. More reliable than local file system
2. Files persist across deployments
3. Better scalability
4. Can use CloudFront for CDN
5. Cost-effective for file storage

### S3 Implementation Steps
1. Create S3 bucket
2. Install AWS SDK: `npm install @aws-sdk/client-s3`
3. Configure S3 client with credentials
4. Upload files to S3 instead of local storage
5. Store S3 URLs in database
6. Update photo URL construction in frontend

