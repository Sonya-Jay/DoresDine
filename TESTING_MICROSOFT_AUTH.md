# Testing Microsoft Azure AD Authentication - Step by Step

## Prerequisites (Do These First!)

### Step 1: Register App in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Sign in with a Microsoft account (preferably a Vanderbilt account if you have one)
3. Navigate to **Azure Active Directory** > **App registrations**
4. Click **New registration**
5. Fill in:
   - **Name**: `DoresDine` (or any name you want)
   - **Supported account types**: Select **"Accounts in this organizational directory only (Vanderbilt only - Single tenant)"**
   - **Redirect URI**: 
     - Platform: **Mobile and desktop applications**
     - URI: `msauth://com.doresdine.app` (for iOS/Android)
     - Also add for Web: `http://localhost:8081/auth/microsoft/callback` (for Expo dev)
6. Click **Register**
7. **IMPORTANT**: Copy these values:
   - **Application (client) ID** - You'll need this
   - **Directory (tenant) ID** - This is Vanderbilt's tenant ID (you'll see it in the Overview page)

### Step 2: Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission** > **Microsoft Graph** > **Delegated permissions**
3. Add these permissions:
   - `User.Read`
   - `email`
   - `profile`
   - `openid`
4. Click **Add permissions**
5. **Important**: Click **Grant admin consent for [Your Organization]** if you have admin rights (or ask an admin)

### Step 3: Set Environment Variables

#### Backend Environment Variables

Create or update `backend/.env`:

```bash
# Existing variables (keep these)
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-database-url
# ... other existing vars ...

# Add these new ones:
AZURE_CLIENT_ID=your-client-id-from-azure
AZURE_TENANT_ID=vanderbilt-tenant-id-from-azure
```

**To get the Tenant ID:**
- In Azure Portal, go to your app registration
- The **Directory (tenant) ID** is shown in the Overview page
- This should be Vanderbilt's tenant ID (something like `12345678-1234-1234-1234-123456789abc`)

#### Frontend Environment Variables

Create or update `frontend/.env`:

```bash
EXPO_PUBLIC_AZURE_CLIENT_ID=your-client-id-from-azure
EXPO_PUBLIC_AZURE_TENANT_ID=vanderbilt-tenant-id-from-azure
```

**Note**: The `EXPO_PUBLIC_` prefix makes these available in the Expo app.

### Step 4: Install Dependencies

The dependencies should already be installed, but if not:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Step 5: Start the Backend

```bash
cd backend
npm run dev
```

The backend should start on `http://localhost:3000`

### Step 6: Start the Frontend

In a new terminal:

```bash
cd frontend
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your phone

## Testing the Authentication

1. **Open the app** - You should see the login screen with "Sign in with Microsoft" button
2. **Click "Sign in with Microsoft"** - It should open Microsoft login page
3. **Sign in with a Vanderbilt account** - Use your `@vanderbilt.edu` email
4. **Grant permissions** - Allow the app to access your profile
5. **You should be redirected back** - And logged into the app

## Troubleshooting

### "Azure AD configuration is missing"
- Make sure you created `frontend/.env` with `EXPO_PUBLIC_AZURE_CLIENT_ID` and `EXPO_PUBLIC_AZURE_TENANT_ID`
- Restart the Expo dev server after adding environment variables

### "Token verification failed"
- Check that `AZURE_CLIENT_ID` and `AZURE_TENANT_ID` are set in `backend/.env`
- Make sure the backend is running
- Verify the tenant ID matches Vanderbilt's tenant

### "Access restricted to Vanderbilt University accounts only"
- The token's tenant ID doesn't match the one in your environment variables
- Double-check that `AZURE_TENANT_ID` in backend `.env` matches Vanderbilt's tenant ID

### Redirect URI mismatch
- Make sure the redirect URI in Azure Portal matches:
  - For mobile: `msauth://com.doresdine.app`
  - For web/dev: `http://localhost:8081/auth/microsoft/callback`

### Can't find Tenant ID
- In Azure Portal, go to your app registration
- Click "Overview" - the Directory (tenant) ID is shown there
- Or go to Azure Active Directory > Properties - the Tenant ID is shown there

## What Happens Behind the Scenes

1. User clicks "Sign in with Microsoft"
2. Frontend opens Microsoft login page (via `expo-auth-session`)
3. User signs in with Vanderbilt account
4. Microsoft returns an ID token
5. Frontend sends ID token to backend `/auth/microsoft` endpoint
6. Backend verifies token using Microsoft's public keys
7. Backend checks tenant ID matches Vanderbilt
8. Backend extracts user info (email, name) from token
9. Backend creates/updates user in database
10. Backend returns our JWT token
11. Frontend stores token and logs user in

## No AWS Deployment Needed!

You can test everything locally:
- Backend runs on `localhost:3000`
- Frontend connects to local backend in development mode
- Microsoft authentication works the same way locally and in production

Only deploy to AWS when you're ready for production!

