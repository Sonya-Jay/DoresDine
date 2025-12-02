# Microsoft Azure AD Authentication Setup

This document explains how to set up Microsoft Azure AD authentication for DoresDine, restricted to Vanderbilt University's tenant.

## Prerequisites

1. Access to Azure Portal (you'll need to register the app)
2. Vanderbilt's Azure AD Tenant ID (required to restrict access)

## Step 1: Register App in Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Microsoft Entra ID** (or "Azure Active Directory") > **App registrations**
3. Click **New registration**
4. Fill in:
   - **Name**: DoresDine
   - **Supported account types**: **"Accounts in this organizational directory only (Vanderbilt only - Single tenant)"**
     - ⚠️ **Important**: Use **Microsoft Entra ID** (regular Azure AD), **NOT Azure AD B2C**
     - B2C is for external customers, not for organizational single-tenant scenarios
   - **Redirect URI**: 
     - For mobile: `msauth://com.doresdine.app/[YOUR_BUNDLE_ID]` (iOS) or `msauth://[YOUR_PACKAGE_NAME]/[BASE64_SIGNATURE]` (Android)
     - For web: `https://your-backend-url.com/auth/microsoft/callback`
5. Click **Register**
6. Note down:
   - **Application (client) ID**
   - **Directory (tenant) ID** (this should be Vanderbilt's tenant ID)

## Step 2: Configure API Permissions

1. In your app registration, go to **API permissions**
2. Click **Add a permission** > **Microsoft Graph**
3. Add these permissions:
   - `User.Read` (Delegated) - to read user profile
   - `email` (Delegated) - to get user email
   - `profile` (Delegated) - to get user profile info
4. Click **Grant admin consent** (if you have admin rights)

## Step 3: Create Client Secret (Optional - for backend verification)

If you want the backend to verify tokens independently:

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Add description and expiration
4. **Copy the secret value immediately** (you won't see it again)
5. Add to backend environment variables as `AZURE_CLIENT_SECRET`

## Step 4: Get Vanderbilt Tenant ID

Vanderbilt's Azure AD Tenant ID is typically: `[TO_BE_DETERMINED]`

You can find it by:
- Asking Vanderbilt IT
- Or checking the tenant ID when a Vanderbilt user logs in

## Step 5: Environment Variables

### Backend (.env)
```
AZURE_CLIENT_ID=your-client-id
AZURE_TENANT_ID=vanderbilt-tenant-id
AZURE_CLIENT_SECRET=your-client-secret (optional)
```

### Frontend (.env or app.json)
```
EXPO_PUBLIC_AZURE_CLIENT_ID=your-client-id
EXPO_PUBLIC_AZURE_TENANT_ID=vanderbilt-tenant-id
```

## Step 6: Mobile App Configuration

### iOS (Info.plist)
Add to your `Info.plist`:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>msauth.$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    </array>
  </dict>
</array>
```

### Android (AndroidManifest.xml)
Add intent filter:
```xml
<activity
    android:name="com.microsoft.identity.client.BrowserTabActivity">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="msauth"
              android:host="YOUR_PACKAGE_NAME"
              android:path="/BASE64_SIGNATURE" />
    </intent-filter>
</activity>
```

## Testing

1. Try logging in with a Vanderbilt account - should work
2. Try logging in with a non-Vanderbilt account - should be rejected
3. Check backend logs to verify tenant ID validation

## Troubleshooting

- **"Invalid tenant" error**: Verify `AZURE_TENANT_ID` matches Vanderbilt's tenant
- **Redirect URI mismatch**: Ensure redirect URI in Azure matches your app configuration
- **Token verification fails**: Check that backend has correct `AZURE_CLIENT_ID` and `AZURE_TENANT_ID`

