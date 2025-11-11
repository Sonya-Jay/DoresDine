# Backend Deployment Files

## ✅ Files Included in `doresdine-backend-deploy.zip`

### Required Files:
1. **`dist/`** - Compiled JavaScript files
   - `dist/index.js` - Main server file (with 20MB JSON limit)
   - `dist/db.js` - Database connection
   - `dist/routes/upload.js` - Upload route (with 20MB multer limit)
   - `dist/routes/posts.js` - Posts routes
   - `dist/routes/users.js` - Users routes
   - `dist/routes/dining.js` - Dining routes
   - `dist/services/cbordService.js` - CBord service
   - `dist/types/` - Type definitions

2. **`package.json`** - Dependencies and scripts

3. **`package-lock.json`** - Locked dependency versions

4. **`Procfile`** - Tells Elastic Beanstalk how to start the app
   ```
   web: npm run start
   ```

5. **`.ebextensions/`** - AWS Elastic Beanstalk configuration
   - `.ebextensions/01_nginx.config` - Increases nginx `client_max_body_size` to 20MB
   - `.ebextensions/02_proxy.config` - Reloads nginx after configuration

### Total Size: ~52KB

## 🔧 Configuration Details

### Nginx Configuration (`.ebextensions/01_nginx.config`)
- Sets `client_max_body_size 20M` to allow larger file uploads
- This fixes the 413 "Payload Too Large" error

### Backend Configuration
- **Multer**: 20MB file size limit per file
- **Express JSON**: 20MB body size limit
- **Error handling**: Comprehensive error handling for uploads

## 📦 Deployment Steps

1. **Upload ZIP to AWS Elastic Beanstalk**
   - Go to AWS Console → Elastic Beanstalk
   - Select your environment: `Doresdine-backend-env`
   - Click "Upload and deploy"
   - Upload: `backend/doresdine-backend-deploy.zip`

2. **Wait for Deployment**
   - AWS will automatically apply `.ebextensions` configuration
   - Nginx will be configured to accept 20MB requests
   - Backend will start with updated limits

3. **Verify Deployment**
   - Check health endpoint
   - Test photo upload from app
   - Check AWS CloudWatch logs for any errors

## 🚨 Important Notes

### Environment Variables (Set in AWS Console)
- `DATABASE_URL` - Your RDS connection string
- `NODE_ENV` - `production`
- `PORT` - `3000` (usually auto-set)

### File Storage
- Files are stored in `/uploads` directory on the server
- **WARNING**: Files are ephemeral on Elastic Beanstalk
- Files will be lost when server restarts/scales
- **Recommendation**: Use S3 for production

## ✅ What This Fixes

1. **413 Payload Too Large Error**
   - Nginx now accepts up to 20MB requests
   - Multer accepts up to 20MB files
   - Express accepts up to 20MB JSON bodies

2. **Upload Errors**
   - Better error handling
   - Detailed error messages
   - Proper logging

3. **Post Creation**
   - Posts with photos should now work
   - Internal server errors should be resolved

## 🧪 Testing After Deployment

```bash
# Health check
curl http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/health

# Test upload (create a test image first)
# Create a small test image or use an existing one
curl -X POST http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/upload/photo \
  -H "X-User-Id: d14e38ed-daed-4328-a9e7-f4beb8a7ba8c" \
  -F "photo=@test-image.jpg"
```

## 📝 Next Deployment

To create a new deployment package:
```bash
cd backend
./deploy.sh
```

This will:
1. Build TypeScript to JavaScript
2. Create deployment directory
3. Copy required files
4. Create ZIP file
5. Clean up temporary files

