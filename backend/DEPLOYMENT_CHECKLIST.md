# Backend Deployment Checklist

## Files to Include in ZIP for AWS Elastic Beanstalk

### Required Files:
1. **`dist/`** - Compiled JavaScript files (MUST be up to date)
   - `dist/index.js`
   - `dist/db.js`
   - `dist/routes/` (all .js files)
   - `dist/services/` (all .js files)
   - `dist/types/` (all .js files)
   - `dist/types.js`

2. **`package.json`** - Dependencies and scripts

3. **`package-lock.json`** - Locked dependency versions

4. **`Procfile`** - Tells Elastic Beanstalk how to start the app
   - Contains: `web: npm run start`

### Optional but Recommended:
5. **`migrations/`** - Database migrations (if you need to run them on AWS)
   - `migrations/001_initial_schema.sql`
   - Note: Usually run these manually via RDS connection

### DO NOT Include:
- ❌ `node_modules/` - Will be installed by AWS
- ❌ `src/` - Source TypeScript files (not needed, we use dist/)
- ❌ `.env` - Environment variables (set in AWS Console)
- ❌ `tsconfig.json` - TypeScript config (not needed for deployment)
- ❌ `uploads/` - Uploaded files (ephemeral, will be recreated)
- ❌ `.git/` - Git files
- ❌ `README.md` - Documentation
- ❌ `test-api.sh` - Test scripts
- ❌ `*.zip` - Other zip files

## Steps to Create Deployment ZIP

### 1. Rebuild the Backend (IMPORTANT!)
```bash
cd backend
npm run build
```

This ensures `dist/` folder has the latest changes including:
- Updated upload route with error handling
- Updated index.ts with middleware fixes

### 2. Create the ZIP
```bash
cd backend

# Create a temporary deployment directory
mkdir -p deployment

# Copy required files
cp -r dist deployment/
cp package.json deployment/
cp package-lock.json deployment/
cp Procfile deployment/
# Optionally include migrations
cp -r migrations deployment/

# Create ZIP (excluding unnecessary files)
cd deployment
zip -r ../doresdine-backend-deploy.zip . -x "*.DS_Store" "*.log"

# Clean up
cd ..
rm -rf deployment
```

### 3. Verify ZIP Contents
```bash
unzip -l doresdine-backend-deploy.zip
```

You should see:
- dist/ folder with all .js files
- package.json
- package-lock.json
- Procfile
- migrations/ (if included)

## AWS Elastic Beanstalk Deployment

### 1. Upload ZIP
- Go to AWS Elastic Beanstalk Console
- Select your environment
- Click "Upload and deploy"
- Upload `doresdine-backend-deploy.zip`

### 2. Environment Variables
Make sure these are set in AWS Console (Configuration → Software → Environment properties):
- `DATABASE_URL` - Your RDS connection string
- `NODE_ENV` - `production`
- `PORT` - `3000` (usually set automatically)

### 3. Verify Deployment
After deployment, test:
```bash
# Health check
curl http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/health

# Test upload (after fixes are deployed)
curl -X POST http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/upload/photo \
  -H "X-User-Id: d14e38ed-daed-4328-a9e7-f4beb8a7ba8c" \
  -F "photo=@test-image.jpg"
```

## Quick Deployment Script

Save this as `deploy.sh` in the backend directory:

```bash
#!/bin/bash
set -e

echo "Building backend..."
npm run build

echo "Creating deployment package..."
mkdir -p deployment
cp -r dist deployment/
cp package.json deployment/
cp package-lock.json deployment/
cp Procfile deployment/

cd deployment
zip -r ../doresdine-backend-deploy.zip . -x "*.DS_Store" "*.log"
cd ..

echo "Cleaning up..."
rm -rf deployment

echo "✅ Deployment package created: doresdine-backend-deploy.zip"
echo "📦 File size: $(du -h doresdine-backend-deploy.zip | cut -f1)"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

## Notes

1. **Always rebuild before deploying** - `npm run build` ensures dist/ is up to date
2. **Check file sizes** - ZIP should be relatively small (few MB), not hundreds of MB
3. **Environment variables** - Never include .env file, set in AWS Console
4. **Uploads folder** - Will be created automatically on first upload
5. **Database migrations** - Run manually via RDS connection, not included in deployment

## Troubleshooting

### Deployment fails
- Check AWS CloudWatch logs
- Verify package.json has correct scripts
- Ensure Procfile is correct
- Check environment variables are set

### Uploads not working
- Check AWS CloudWatch logs for errors
- Verify uploads directory permissions
- Check file system is writable (Elastic Beanstalk file system is ephemeral)

### Application won't start
- Check Procfile format
- Verify dist/index.js exists
- Check package.json start script
- Review CloudWatch logs for errors

