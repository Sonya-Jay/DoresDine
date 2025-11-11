# DoresDine

A React Native (Expo) app for sharing dining experiences at Vanderbilt University.

## Project Structure

```
doresdine-test/
├── frontend/          # Expo React Native app
├── backend/           # Express.js backend (AWS deployed)
├── README.md
├── SETUP.md          # Setup instructions
└── BACKEND_CONFIG.md # Backend configuration details
```

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm start
```

### Backend (Already deployed on AWS)

The backend is deployed at:
- **URL**: `http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com`
- **Database**: AWS RDS PostgreSQL
- **Status**: ✅ Connected and operational

## Configuration

### Frontend API URL

The frontend is configured to connect to the AWS backend:
- **Environment Variable**: `EXPO_PUBLIC_API_URL` in `frontend/.env`
- **Current Value**: `http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com`
- **Fallback**: Set in `frontend/constants/API.ts`

### Backend Environment

Backend environment variables are set in `backend/.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: production
- `PORT`: 3000

## API Endpoints

### Posts
- `GET /posts` - Get all posts
- `POST /posts` - Create a new post
- `POST /posts/:id/like` - Like/unlike a post
- `GET /posts/:id/comments` - Get comments for a post
- `POST /posts/:id/comments` - Add a comment to a post

### Upload
- `POST /upload/photo` - Upload a photo

### Dining
- `GET /api/dining/halls` - Get all dining halls
- `GET /api/dining/halls/:id/menu` - Get menu for a dining hall
- `GET /api/dining/menu/:menuId/items` - Get menu items

### Health
- `GET /health` - Health check endpoint

## Testing

### Test Backend Connection

```bash
# Health check
curl http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/health

# Get dining halls
curl http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/api/dining/halls

# Get posts (requires X-User-Id header)
curl -H "X-User-Id: 00000000-0000-0000-0000-000000000001" \
  http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/posts
```

## Development

### Frontend
- Framework: Expo Router (file-based routing)
- Language: TypeScript
- State Management: React Hooks

### Backend
- Framework: Express.js
- Database: PostgreSQL (AWS RDS)
- Deployment: AWS Elastic Beanstalk
- Language: TypeScript

## Authentication

Currently using a hardcoded user ID for testing:
- User ID: `00000000-0000-0000-0000-000000000001`

**TODO**: Implement proper authentication system.

## Features

- ✅ View feed of dining posts
- ✅ Create posts with photos
- ✅ Like and comment on posts
- ✅ Browse dining hall menus
- ✅ Search dining halls
- ✅ View menu items for specific meals

## Next Steps

1. ✅ Backend deployed and connected
2. ✅ Frontend configured to connect to backend
3. ⚠️ Implement user authentication
4. ⚠️ Add user profiles
5. ⚠️ Implement friend system
6. ⚠️ Add search functionality
7. ⚠️ Add photo optimization

## Troubleshooting

See `SETUP.md` for detailed troubleshooting guide.

## License

Private project - Vanderbilt University
