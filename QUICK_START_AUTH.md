# Quick Start - Microsoft Authentication Testing

## ⚡ Fast Setup (5 minutes)

### 1. Azure Portal Setup (2 min)
- Go to https://portal.azure.com
- **Microsoft Entra ID** (or "Azure Active Directory") > **App registrations** > **New registration**
- Name: `DoresDine`
- **Account types**: **"Accounts in this organizational directory only (Vanderbilt only - Single tenant)"**
  - ⚠️ **NOT B2C** - Use regular Azure AD / Microsoft Entra ID
- Redirect URI: `msauth://com.doresdine.app` (Mobile)
- Redirect URI: `http://localhost:8081/auth/microsoft/callback` (Web)
- **Copy**: Client ID and Tenant ID

### 2. Add Permissions (1 min)
- In your app: API permissions > Add permission
- Microsoft Graph > Delegated permissions
- Add: `User.Read`, `email`, `profile`, `openid`
- Click "Grant admin consent"

### 3. Environment Variables (1 min)

**Create `backend/.env`** (add these lines):
```bash
AZURE_CLIENT_ID=paste-your-client-id-here
AZURE_TENANT_ID=paste-vanderbilt-tenant-id-here
```

**Create `frontend/.env`** (add these lines):
```bash
EXPO_PUBLIC_AZURE_CLIENT_ID=paste-your-client-id-here
EXPO_PUBLIC_AZURE_TENANT_ID=paste-vanderbilt-tenant-id-here
```

### 4. Start Backend (30 sec)
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:3000

### 5. Start Frontend (30 sec)
```bash
cd frontend
npm start
```
Then press `i` (iOS), `a` (Android), or `w` (web)

## 🧪 Test It!

1. Click "Sign in with Microsoft" button
2. Sign in with your `@vanderbilt.edu` account
3. You should be logged in! 🎉

## ❌ Common Issues

**"Azure AD configuration is missing"**
→ Check that `frontend/.env` exists and has the variables
→ Restart Expo after creating `.env`

**"Token verification failed"**
→ Check that `backend/.env` has `AZURE_CLIENT_ID` and `AZURE_TENANT_ID`
→ Make sure backend is running

**"Access restricted to Vanderbilt"**
→ The tenant ID doesn't match - double-check `AZURE_TENANT_ID` in backend `.env`

## 📝 Notes

- **No AWS needed** - Everything works locally!
- Backend uses `localhost:3000` in development
- Frontend automatically uses local backend when running `npm start`
- You only need to deploy to AWS for production

## 🔍 Finding Your Tenant ID

In Azure Portal:
- Go to your app registration
- Click "Overview"
- The **Directory (tenant) ID** is shown there
- This is Vanderbilt's tenant ID (looks like: `12345678-1234-1234-1234-123456789abc`)

