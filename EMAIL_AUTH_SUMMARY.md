# Email-Based Authentication Summary

## What Changed

### Authentication Flow
1. **Login**: User enters email → receives verification code → enters code → logged in
2. **Registration**: User enters name + email → receives verification code → enters code → account created and logged in
3. **No passwords needed!** - All authentication is via email verification codes

### Backend Changes

1. **New Email Service** (`backend/src/services/emailService.ts`):
   - Uses AWS SES (Simple Email Service) to send emails
   - Falls back to SMTP if AWS not configured
   - Falls back to console logging if neither configured (dev mode)

2. **Updated Login Endpoint** (`POST /auth/login`):
   - Now only requires `email` (no password)
   - Sends verification code to email
   - Creates user automatically if they don't exist (first-time login)
   - Returns verification code in dev mode if email service not configured

3. **Updated Verify Endpoint** (`POST /auth/verify`):
   - Works for both registration and login
   - Verifies code and returns JWT token
   - Marks email as verified

### Frontend Changes

1. **Updated Login Screen** (`frontend/app/login.tsx`):
   - Removed password field
   - Only asks for email
   - Sends verification code
   - Navigates to verify screen

2. **Updated API Service** (`frontend/services/api.ts`):
   - `authLogin()` now only takes email parameter
   - Returns response with message (may include code in dev mode)

## Setup Required

### 1. AWS SES Setup (Recommended)
See `AWS_SES_SETUP.md` for detailed instructions.

**Quick steps**:
1. Create AWS account
2. Set up SES and verify email address
3. Create IAM user with SES permissions
4. Add to `backend/.env`:
   ```bash
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   SES_FROM_EMAIL=noreply@yourdomain.com
   ```

### 2. Alternative: SMTP (If you prefer)
Add to `backend/.env`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

### 3. Development Mode (No Email Setup)
If neither AWS SES nor SMTP is configured:
- Verification codes are logged to console
- Codes are returned in API responses (for testing)
- You can test the full flow without email setup

## Testing

1. **Start backend**: `cd backend && npm run dev`
2. **Start frontend**: `cd frontend && npm start`
3. **Test login**:
   - Enter your `@vanderbilt.edu` email
   - Click "Send Verification Code"
   - Check console/email for code
   - Enter code on verify screen
   - Should be logged in!

## Benefits

✅ **No password management** - Users don't need to remember passwords
✅ **Secure** - Email verification ensures user owns the email
✅ **Simple** - One less thing for users to manage
✅ **Vanderbilt-only** - Still restricted to `@vanderbilt.edu` emails
✅ **Auto-registration** - First-time users are automatically created on login

## Migration Notes

- Old password-based login still exists in code but is not used
- Existing users with passwords can still use the new email-based login
- Passwords are no longer required for new users

