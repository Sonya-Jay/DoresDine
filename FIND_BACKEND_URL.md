# Finding Your AWS Backend URL

Your backend is deployed on AWS and needs a public URL for the frontend to connect to it.

## Where to Find Your Backend URL

### Option 1: AWS Elastic Beanstalk
If your backend is deployed on Elastic Beanstalk:
1. Go to AWS Console → Elastic Beanstalk
2. Select your environment
3. Look for the "URL" or "Endpoint" - it will be something like:
   - `doresdine-backend.us-east-2.elasticbeanstalk.com`
   - `doresdine-env.elasticbeanstalk.com`

### Option 2: AWS EC2
If your backend is on EC2:
1. Go to AWS Console → EC2 → Instances
2. Find your instance
3. Look at the "Public IPv4 address" or "Public IPv4 DNS"
4. The URL would be: `http://YOUR_EC2_IP:3000` or your domain

### Option 3: AWS ECS/Fargate
If using ECS:
1. Go to AWS Console → ECS → Clusters
2. Check your service's load balancer
3. Find the load balancer DNS name

### Option 4: API Gateway
If using API Gateway:
1. Go to AWS Console → API Gateway
2. Select your API
3. Look for the "Invoke URL"

### Option 5: Check Your Deployment Configuration
- Check your AWS deployment logs
- Check your deployment script/configuration
- Check your CI/CD pipeline (GitHub Actions, etc.)

## Once You Have the URL

1. Update `frontend/constants/API.ts`:
   ```typescript
   export const API_URL = "https://your-backend-url.com";
   ```

2. Or create `frontend/.env`:
   ```
   EXPO_PUBLIC_API_URL=https://your-backend-url.com
   ```

3. Test the connection:
   ```bash
   curl https://your-backend-url.com/health
   ```

## Quick Test

You can test if your backend is accessible by visiting:
- `https://your-backend-url.com/health` - Should return `{"status":"ok","database":"connected"}`

## Common Backend URL Formats

- **Elastic Beanstalk**: `https://doresdine-backend.us-east-2.elasticbeanstalk.com`
- **EC2 with Domain**: `https://api.doresdine.com`
- **ECS Load Balancer**: `https://doresdine-alb-123456.us-east-2.elb.amazonaws.com`
- **API Gateway**: `https://abc123.execute-api.us-east-2.amazonaws.com/prod`

