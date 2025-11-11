# Backend Configuration Summary

## ✅ What's Been Configured

### 1. Backend Environment Variables
Created `backend/.env` with your AWS RDS database credentials:
- `DATABASE_URL`: Connected to your RDS PostgreSQL database
- `NODE_ENV`: Set to `production`
- `PORT`: Set to `3000`

### 2. Database Connection
The backend is configured to connect to:
```
postgresql://doresdblogin:vandydoresdine@doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com:5432/doresdine
```

### 3. Security
- `.env` file is now in `.gitignore` (won't be committed to git)
- Database connection uses SSL (`ssl: { rejectUnauthorized: false }`)

## 🔍 Next Step: Find Your Backend Public URL

Your backend is deployed on AWS, but we need the **public URL** that the frontend will use to make API calls.

### Where to Find It:

1. **AWS Elastic Beanstalk** (most common)
   - Go to: AWS Console → Elastic Beanstalk → Your Environment
   - Look for the environment URL (e.g., `doresdine-backend.us-east-2.elasticbeanstalk.com`)

2. **AWS EC2**
   - Go to: AWS Console → EC2 → Instances
   - Find your backend instance
   - Look for "Public IPv4 address" or "Public IPv4 DNS"
   - URL format: `http://YOUR_IP:3000` or your domain

3. **AWS ECS/Fargate**
   - Check your load balancer DNS name
   - Or check your service's public endpoint

4. **Check Your Deployment Configuration**
   - Look at your deployment scripts
   - Check your CI/CD pipeline
   - Check your AWS deployment logs

### Test Your Backend URL

Once you have the URL, test it:
```bash
# Test health endpoint
curl https://your-backend-url.com/health

# Should return:
# {"status":"ok","database":"connected"}
```

## 🔧 Configure Frontend

Once you have your backend URL, update the frontend:

**Option 1: Environment Variable (Recommended)**
```bash
cd frontend
echo "EXPO_PUBLIC_API_URL=https://your-backend-url.com" > .env
```

**Option 2: Direct Configuration**
Edit `frontend/constants/API.ts`:
```typescript
export const API_URL = "https://your-backend-url.com";
```

## 📝 Notes

- The backend is already configured with your database credentials
- Backend runs on port 3000
- Database connection uses SSL
- All environment variables are set correctly

## 🚀 After Configuration

1. Restart your frontend app
2. Test creating a post
3. Verify posts load from the backend
4. Test photo uploads
5. Verify comments and likes work

## 🐛 Troubleshooting

**Backend not accessible?**
- Verify the URL is correct
- Check AWS security groups allow traffic on port 3000 (or 80/443)
- Verify the backend service is running
- Check AWS CloudWatch logs for errors

**Database connection issues?**
- Verify RDS security group allows connections from your backend
- Check database credentials are correct
- Verify database exists and migrations have been run

**CORS issues?**
- React Native/Expo apps don't have CORS restrictions
- If serving web frontend, you may need to add CORS middleware to backend
- Check if AWS API Gateway or load balancer handles CORS

