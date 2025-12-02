# DoresDine

**A community-driven dining experience app for Vanderbilt University**

DoresDine is a mobile application designed to enhance the Vanderbilt dining experience. DoresDine provides students with real-time photos, ratings, and reviews of dining hall meals, helping them make more informed choices, discover trending dishes, and connect with peers in a community-driven way.

## Authors

- **Julia Laforet**
- **Sonya Jayathilake**
- **Isabelle Pham**
- **Aiden Min**

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Running the Application](#running-the-application)
  - [Development Mode](#development-mode)
  - [Production Build](#production-build)
- [Deployment](#deployment)
  - [Backend Deployment (AWS)](#backend-deployment-aws)
  - [Database Setup (AWS RDS)](#database-setup-aws-rds)
  - [Frontend Deployment](#frontend-deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- 📸 **Photo Sharing**: Upload and view real-time photos of dining hall meals
- ⭐ **Ratings & Reviews**: Rate individual dishes and dining halls
- 🔥 **Trending Meals**: Discover popular dishes with multiple reviews
- 🍽️ **Menu Integration**: Browse real-time dining hall menus from Vanderbilt Dining
- 👥 **Social Features**: Like, comment, and connect with fellow Vanderbilt students
- 📅 **Historical Posts**: Create posts for past dates to share yesterday's meals
- 🔍 **Search & Filter**: Find specific dishes and dining halls
- 📊 **Dining Hall Profiles**: View aggregate ratings and review counts

---

## Technology Stack

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript
- **State Management**: React Hooks
- **UI Components**: React Native Core Components
- **Image Handling**: expo-image-picker, expo-image-manipulator
- **Date Picker**: @react-native-community/datetimepicker

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (AWS RDS)
- **File Storage**: Local uploads directory (served via Express)
- **Deployment**: AWS Elastic Beanstalk
- **API Integration**: Vanderbilt Dining API (Campus Dish)

### Infrastructure
- **Backend Hosting**: AWS Elastic Beanstalk
- **Database**: AWS RDS PostgreSQL
- **Region**: us-east-2 (Ohio)

---

## Project Structure

```
DoresDine-expo/
├── frontend/                    # React Native mobile app
│   ├── app/                    # Expo Router pages
│   │   └── (tabs)/            # Tab navigation screens
│   ├── components/            # Reusable UI components
│   ├── services/              # API client and services
│   ├── constants/             # Constants and configurations
│   ├── types/                 # TypeScript type definitions
│   ├── data/                  # Static data (dining halls, etc.)
│   ├── assets/                # Images and fonts
│   └── package.json
│
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Express middleware
│   │   ├── types/            # TypeScript types
│   │   ├── db.ts             # Database connection
│   │   └── index.ts          # Server entry point
│   ├── migrations/           # SQL migration files
│   ├── scripts/              # Database utility scripts
│   ├── uploads/              # Photo storage directory
│   ├── __tests__/            # Backend tests
│   └── package.json
│
└── README.md                  # This file
```

---

## Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18 or higher ([Download](https://nodejs.org/))
- **npm**: v8 or higher (comes with Node.js)
- **Git**: For cloning the repository
- **Expo CLI**: Install globally with `npm install -g expo-cli`
- **Expo Go App**: Download on your iOS/Android device for testing
- **PostgreSQL**: v14 or higher (for local backend development)

### Frontend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sonya-Jay/DoresDine-expo.git
   cd DoresDine-expo
   ```

2. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Configure environment variables**:
   
   Create a `.env` file in the `frontend` directory:
   ```bash
   EXPO_PUBLIC_API_URL=http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com
   ```

   For local backend development, use:
   ```bash
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   
   Create a `.env` file in the `backend` directory:
   ```bash
   DATABASE_URL=postgresql://username:password@localhost:5432/doresdine
   NODE_ENV=development
   PORT=3000
   ```

   For production (AWS), use the RDS connection string:
   ```bash
   DATABASE_URL=postgresql://username:password@doresdine-db.xxxx.us-east-2.rds.amazonaws.com:5432/doresdine
   NODE_ENV=production
   PORT=3000
   ```

4. **Set up the database**:
   
   Create the PostgreSQL database:
   ```bash
   createdb doresdine
   ```

5. **Run migrations**:
   ```bash
   npm run migrate
   ```

   Or run migrations individually:
   ```bash
   psql -d doresdine -f migrations/001_initial_schema.sql
   psql -d doresdine -f migrations/002_insert_test_user.sql
   # ... continue for all migrations
   ```

---

## Running the Application

### Development Mode

#### Start the Backend

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3000`

#### Start the Frontend

```bash
cd frontend
npm start
```

This will open the Expo Developer Tools in your browser. You can then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan the QR code with Expo Go app on your physical device

#### Test User Credentials

For testing purposes, use the following credentials to log in:

- **Email**: `julia.e.laforet@vanderbilt.edu`
- **Password**: `test123`

### Production Build

#### Backend

```bash
cd backend
npm run build
npm start
```

#### Frontend

For iOS:
```bash
cd frontend
eas build --platform ios
```

For Android:
```bash
cd frontend
eas build --platform android
```

---

## Deployment

### Backend Deployment (AWS)

The backend is deployed on AWS Elastic Beanstalk.

**Current Production URL**: `http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com`

#### Deploy Backend to AWS Elastic Beanstalk

1. **Install the EB CLI**:
   ```bash
   pip install awsebcli
   ```

2. **Initialize Elastic Beanstalk** (if not already done):
   ```bash
   cd backend
   eb init -p node.js -r us-east-2 doresdine-backend
   ```

3. **Create environment** (first time only):
   ```bash
   eb create doresdine-backend-env
   ```

4. **Deploy updates**:
   ```bash
   cd backend
   ./deploy.sh
   ```

   Or manually:
   ```bash
   npm run build
   eb deploy
   ```

5. **Configure environment variables in AWS**:
   - Go to AWS Elastic Beanstalk Console
   - Select your environment
   - Configuration → Software → Environment properties
   - Add: `DATABASE_URL`, `NODE_ENV`, `PORT`

### Database Setup (AWS RDS)

1. **Create RDS PostgreSQL instance**:
   - Engine: PostgreSQL 14
   - Instance class: db.t3.micro (Free Tier)
   - Region: us-east-2 (Ohio)
   - Enable public access (or configure VPC)

2. **Configure security group**:
   - Allow inbound PostgreSQL traffic (port 5432) from:
     - Your IP (for migrations)
     - Elastic Beanstalk security group

3. **Run migrations on RDS**:
   ```bash
   psql -h doresdine-db.xxxx.us-east-2.rds.amazonaws.com \
        -U postgres -d doresdine \
        -f migrations/001_initial_schema.sql
   ```

4. **Update backend environment variables** with RDS connection string

### Frontend Deployment

#### Using Expo Application Services (EAS)

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure EAS**:
   ```bash
   cd frontend
   eas build:configure
   ```

4. **Build for iOS**:
   ```bash
   eas build --platform ios
   ```

5. **Build for Android**:
   ```bash
   eas build --platform android
   ```

6. **Submit to App Stores**:
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

---

## API Documentation

### Base URL

**Production**: `http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com`  
**Development**: `http://localhost:3000`

### Authentication

All requests require the `X-User-Id` header:
```
X-User-Id: <user-uuid>
```

### Endpoints

#### Health Check
```
GET /health
```

#### Posts
```
GET    /posts                    # Get all posts
GET    /posts/me                 # Get current user's posts
GET    /posts/friends            # Get posts from followed users
GET    /posts/trending           # Get trending dining halls
GET    /posts/:hallName          # Get posts by dining hall
POST   /posts                    # Create a new post
PATCH  /posts/:id                # Update a post
DELETE /posts/:id                # Delete a post
POST   /posts/:id/like           # Like/unlike a post
POST   /posts/:id/flag           # Flag a post
```

#### Comments
```
GET    /posts/:id/comments       # Get comments for a post
POST   /posts/:id/comments       # Add a comment
```

#### Users
```
GET    /users/me                 # Get current user
PATCH  /users/me                 # Update current user profile
GET    /users/:id                # Get user by ID
GET    /users/:id/posts          # Get user's posts
POST   /users/:id/follow         # Follow/unfollow user
GET    /users/:id/followers      # Get user's followers
GET    /users/:id/following      # Get users being followed
```

#### Authentication
```
POST   /auth/register            # Register new user
POST   /auth/login               # Login
POST   /auth/verify              # Verify email code
POST   /auth/resend              # Resend verification code
POST   /auth/microsoft           # Microsoft OAuth login
```

#### Uploads
```
POST   /upload/photo             # Upload a photo (multipart/form-data)
GET    /uploads/:filename        # Retrieve uploaded photo
```

#### Dining Halls
```
GET    /api/dining/halls         # Get all dining halls
GET    /api/dining/menu-schedules # Get menu schedules
GET    /api/dining/menu-items    # Get menu items for a schedule
```

#### Search
```
GET    /search/dishes            # Search for dishes
GET    /search/dining-halls      # Search dining halls
GET    /search/trending-dishes   # Get trending dishes
```

---

## Testing

### Backend Tests

```bash
cd backend
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Manual API Testing

Test the health endpoint:
```bash
curl http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/health
```

Test getting posts:
```bash
curl -H "X-User-Id: 00000000-0000-0000-0000-000000000001" \
  http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/posts
```

---

## Troubleshooting

### Common Issues

#### "Cannot connect to backend"
- Verify the backend is running: `curl http://localhost:3000/health`
- Check `EXPO_PUBLIC_API_URL` in `frontend/.env`
- Ensure your device/emulator can reach the backend URL

#### "Database connection error"
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `backend/.env`
- Ensure database exists: `psql -l`
- Run migrations: `npm run migrate`

#### "Photos not displaying"
- Check `uploads/` directory exists in backend
- Verify photos were uploaded successfully
- Check photo URLs in API responses
- Ensure backend can serve static files from `/uploads`

#### "Expo app won't start"
- Clear cache: `expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Update Expo: `npm install expo@latest`

#### "Build fails on EAS"
- Check `eas.json` configuration
- Verify all dependencies are in `package.json`
- Review build logs in Expo dashboard

### Database Reset

To reset the database:
```bash
cd backend
dropdb doresdine
createdb doresdine
npm run migrate
```

---

## Contributing

This is a private project for Vanderbilt University. For questions or contributions, please contact the authors.

---

## License

Private project - Vanderbilt University  
© 2025 Julia Laforet, Sonya Jayathilake, Isabelle Pham, Aiden Min

All rights reserved.
