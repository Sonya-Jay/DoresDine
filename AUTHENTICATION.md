# Authentication Setup

## ✅ What's Been Done

### 1. User Creation
- Created a test user in the database via API:
  - **User ID**: `d14e38ed-daed-4328-a9e7-f4beb8a7ba8c`
  - **Username**: `testuser`
  - **Email**: `testuser@example.com`

### 2. Frontend User Management
- Added `getOrCreateUser()` function in `frontend/services/api.ts`
- User ID is stored in memory (will be replaced with AsyncStorage/auth context later)
- Fallback to created user ID if user creation fails
- User is automatically created/retrieved on app startup

### 3. API Integration
- All API calls now use the correct user ID
- User ID is sent in `X-User-Id` header for all requests
- Backend validates user exists before creating posts

## 🧪 Testing

The user ID is working correctly:
```bash
# Test with the created user
curl -H "X-User-Id: d14e38ed-daed-4328-a9e7-f4beb8a7ba8c" \
  http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/posts
```

## 📝 Current Implementation

### User ID Storage
- **Current**: Stored in memory (`currentUserId` variable)
- **Fallback**: Uses created user ID `d14e38ed-daed-4328-a9e7-f4beb8a7ba8c`
- **Location**: `frontend/services/api.ts`

### User Creation Flow
1. App starts → `getOrCreateUser()` is called
2. Tries to create user with username `testuser`
3. If user exists (409 error), fetches user by username
4. Stores user ID in memory for all API calls

## 🚀 Next Steps for Production

### Option 1: Simple User Management (Recommended for MVP)
1. Install `@react-native-async-storage/async-storage`
2. Store user ID in AsyncStorage on first app launch
3. Retrieve user ID from AsyncStorage on subsequent launches
4. Add user profile screen to display current user

### Option 2: Full Authentication (For Production)
1. **Sign Up/Login Flow**
   - Create sign up screen
   - Create login screen
   - Store JWT tokens or session IDs
   - Implement password authentication

2. **User Context**
   - Create AuthContext using React Context API
   - Store user data (ID, username, email) in context
   - Provide auth methods (login, logout, signup)

3. **Protected Routes**
   - Add authentication guards to routes
   - Redirect to login if not authenticated
   - Store auth tokens securely

4. **Backend Changes**
   - Add JWT token generation
   - Add password hashing (bcrypt)
   - Add login/signup endpoints
   - Add token validation middleware

## 🔧 Quick Fix for Multiple Users

If you need to test with multiple users, you can:

1. **Create additional users via API:**
```bash
curl -X POST http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/users \
  -H "Content-Type: application/json" \
  -d '{"username":"user2","email":"user2@example.com"}'
```

2. **Update frontend to use different user:**
   - Change `getOrCreateUser()` call in `index.tsx`
   - Or modify the default username/email parameters

## 📋 Database Schema

The users table structure:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 🐛 Troubleshooting

**"User not found" error:**
- Check if user exists in database
- Verify user ID is correct in `frontend/services/api.ts`
- Check backend logs for user validation errors

**Multiple users created:**
- The `getOrCreateUser()` function handles existing users
- If user exists, it fetches the user by username
- No duplicate users should be created

## ✅ Current Status

- ✅ User created in database
- ✅ Frontend uses correct user ID
- ✅ Posts can be created with user ID
- ✅ All API calls include user ID header
- ⚠️ User ID stored in memory (not persistent)
- ⚠️ No login/signup flow yet
- ⚠️ No user profile management

## 🎯 Recommendation

**For now (testing/deployment):**
- Current implementation is sufficient for testing
- User ID is working correctly
- You can create posts, like posts, add comments

**Before production:**
- Implement proper authentication
- Add user sign up/login screens
- Store user data securely
- Add user profile management

