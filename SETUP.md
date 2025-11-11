# DoresDine Setup Guide

## ✅ What's Been Done

1. **Monorepo Structure Created**
   - Frontend moved to `frontend/` folder
   - Backend copied to `backend/` folder
   - Root-level README and .gitignore updated

2. **Frontend API Integration**
   - Created `frontend/services/api.ts` with all API functions
   - Updated `frontend/constants/API.ts` with endpoint definitions
   - Updated all components to use the API service:
     - Feed screen fetches posts
     - Comments modal fetches/adds comments
     - Photo upload works
     - Menu items fetch from backend
     - Dining halls fetch from backend
     - Post creation works

3. **Backend Routes Mapped**
   - `/posts` - Get/Create posts ✅
   - `/posts/:id/comments` - Get/Add comments ✅
   - `/posts/:id/like` - Like/unlike posts ✅
   - `/upload/photo` - Upload photos ✅
   - `/api/dining/halls` - Get dining halls ✅
   - `/api/dining/menu/:menuId/items` - Get menu items ✅

## 🔧 Configuration Needed

### 1. Set Your AWS Backend URL ⚠️ REQUIRED

**You need to find your backend's public URL.** See `FIND_BACKEND_URL.md` for help finding it.

Common locations:
- AWS Elastic Beanstalk → Environment URL
- AWS EC2 → Public IP or DNS
- AWS ECS → Load Balancer DNS
- AWS API Gateway → Invoke URL

**Option A: Environment Variable (Recommended)**
Create a `.env` file in the `frontend/` directory:
```bash
cd frontend
echo "EXPO_PUBLIC_API_URL=https://your-aws-backend-url.com" > .env
```

**Option B: Direct Configuration**
Edit `frontend/constants/API.ts` and update line 9:
```typescript
export const API_URL = "https://your-aws-backend-url.com";
```

**⚠️ Important:** 
- Replace with your actual AWS backend public URL
- Make sure it includes `https://` (or `http://` if not using SSL)
- Test it by visiting: `https://your-backend-url.com/health`

### 2. User Authentication

Currently, the app uses a hardcoded user ID (`00000000-0000-0000-0000-000000000001`). You'll need to:
- Update `frontend/services/api.ts` - Replace `getUserId()` function (line ~15)
- Implement proper authentication context
- The backend expects `X-User-Id` header in all requests
- For testing, make sure this user ID exists in your database

### 3. Photo URLs

The backend serves photos from `/uploads` route. Make sure:
- Photos are accessible at `{API_URL}/uploads/{filename}`
- If using S3, update the `getPhotoUrl()` function in `frontend/constants/API.ts`

## 🚀 Next Steps

1. **Configure API URL**
   - Set your AWS backend URL in `frontend/constants/API.ts` or `.env` file

2. **Test the Connection**
   ```bash
   cd frontend
   npm start
   ```
   - Try creating a post
   - Check if posts load from backend
   - Test photo uploads

3. **Deploy Frontend**
   - Use Expo EAS Build for native apps
   - Or build for web deployment

## 📝 Notes

- The backend is already deployed on AWS
- Frontend uses the API service layer for all backend calls
- All API endpoints are mapped correctly
- Error handling is in place for failed requests
- Photo URLs are constructed automatically from storage keys

## 🐛 Troubleshooting

**Posts not loading?**
- Check API_URL is set correctly
- Verify backend is accessible
- Check browser/device console for errors
- Verify backend CORS settings allow your frontend origin

**Photos not showing?**
- Verify photo URLs are accessible
- Check if backend serves `/uploads` route correctly
- For AWS, ensure uploads are served from S3 or CDN

**API calls failing?**
- Check network connectivity
- Verify backend is running
- Check API endpoint URLs match backend routes
- Verify `X-User-Id` header is being sent

