#!/bin/bash
set -e

echo "🔨 Building backend..."
npm run build

echo "📦 Creating deployment package..."
# Remove old deployment directory and zip if they exist
rm -rf deployment
rm -f doresdine-backend-deploy.zip

mkdir -p deployment

# Copy required files
cp -r dist deployment/
cp package.json deployment/
cp package-lock.json deployment/
cp Procfile deployment/
# Copy .ebextensions for AWS configuration
cp -r .ebextensions deployment/ 2>/dev/null || true

# Create ZIP
cd deployment
zip -r ../doresdine-backend-deploy.zip . -x "*.DS_Store" "*.log" "*.zip"
cd ..

# Clean up
rm -rf deployment

echo "✅ Deployment package created: doresdine-backend-deploy.zip"
echo "📊 File size: $(du -h doresdine-backend-deploy.zip | cut -f1)"
echo ""
echo "📋 Contents:"
unzip -l doresdine-backend-deploy.zip | head -20
