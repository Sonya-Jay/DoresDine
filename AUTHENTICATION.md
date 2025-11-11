# DoresDine Authentication System

## ✅ What's Been Done

### Email-Based Authentication with JWT
- ✅ User registration with first name, last name, email, password
- ✅ Email verification with 6-digit code (15-min expiry)
- ✅ Password hashing with bcrypt
- ✅ JWT token generation (7-day expiry)
- ✅ User profile endpoint (GET /users/me)
- ✅ Logout with token clearing
- ✅ Frontend login/register/verify screens
- ✅ AsyncStorage JWT persistence
- ✅ Auto-redirect to /login if unauthenticated
- ✅ Database migration applied

## 🔐 User Flows

### Registration
1. User enters: first name, last name, email, password (≥6 characters)
2. Password is hashed with bcrypt (10 rounds)
3. Verification code (6 digits) generated and sent to email
4. User enters code on verify screen
5. Code validated (15-minute expiry)
6. JWT token issued and stored in AsyncStorage
7. Redirected to home feed

### Login
1. User enters email and password
2. Password verified against hash
3. If email not verified, login rejected
4. JWT token issued
5. Token stored in AsyncStorage
6. Redirected to home feed

### Logout
1. Tap "Sign out" on Profile screen
2. JWT cleared from AsyncStorage
3. Redirected to /login

## � Key Files

### Backend
- `backend/src/routes/auth.ts` — Auth endpoints (register, resend, verify, login)
- `backend/src/middleware/auth.ts` — JWT parsing and token signing
- `backend/src/routes/users.ts` — GET /users/me endpoint
- `backend/migrations/003_add_auth_fields.sql` — Database schema changes

### Frontend
- `frontend/app/login.tsx` — Login screen
- `frontend/app/register.tsx` — Registration screen
- `frontend/app/verify.tsx` — Email verification screen
- `frontend/app/(tabs)/profile.tsx` — Profile with sign-out button
- `frontend/services/api.ts` — Auth functions (authRegister, authLogin, authVerify, getMe, logout)
- `frontend/app/_layout.tsx` — App startup auth check

## � API Endpoints

### POST /auth/register
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
Response: `{ "user": {...}, "message": "User created, verify your email" }`

### POST /auth/verify
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```
Response: `{ "token": "eyJhbGc...", "message": "Email verified" }`

### POST /auth/resend
```json
{
  "email": "john@example.com"
}
```
Response: `{ "message": "Verification code sent" }`

### POST /auth/login
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
Response: `{ "token": "eyJhbGc..." }`

### GET /users/me (Protected)
Headers: `Authorization: Bearer <token>`
Response: `{ "id": "...", "email": "...", "first_name": "...", "last_name": "...", "email_verified": true, ... }`

## 🛠️ Setup for Teammates

### 1. Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Apply Database Migration
```bash
psql -U doresdblogin -h doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com -d doresdine -f backend/migrations/003_add_auth_fields.sql
```

### 3. Configure Environment Variables
Create `backend/.env` (already exists, but ensure these are set):
```
DATABASE_URL=postgresql://doresdblogin:vandydoresdine@doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com:5432/doresdine
JWT_SECRET=your-random-secret-key
NODE_ENV=production
PORT=3000
```

### 4. (Optional) Configure Email Sending
To send real verification codes via email, add to `backend/.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@doresdine.local
SMTP_SECURE=false
```
If not set, codes are logged to server console (fine for development).

### 5. Start Servers
Backend:
```bash
cd backend && npm run dev
```

Frontend:
```bash
cd frontend && npm start
```

## 🧪 Manual Testing

### Test Registration
1. Tap "Create account" on login screen
2. Fill in: First name, Last name, Email, Password
3. Check backend console for verification code
4. Enter code on verify screen
5. Should see home feed

### Test Login
1. Tap "Sign out" on Profile screen
2. Tap "Log in"
3. Enter email and password from registration
4. Should see home feed immediately

### Test Error Cases
- Register with existing email → "email already exists"
- Login with wrong password → "Invalid credentials"
- Login before email verified → "Email not verified"
- Access /posts without token → 401 error
- Verify with wrong code → "Invalid verification code"

## � Database Schema Changes

Added to `users` table:
```sql
first_name VARCHAR(100)
last_name VARCHAR(100)
password_hash VARCHAR(255)
email_verified BOOLEAN NOT NULL DEFAULT false
verification_code VARCHAR(20)
verification_code_expires TIMESTAMPTZ
```

## � Current Status

- ✅ All auth endpoints working
- ✅ Frontend screens built and type-checked
- ✅ Database migration applied
- ✅ JWT tokens issued and validated
- ✅ AsyncStorage persistence working
- ✅ Backend and frontend compile cleanly
- ✅ Protected routes enforce authentication
- ✅ Both /users/me and existing routes support JWT

## 📋 Future Improvements

- [ ] Password reset flow
- [ ] Refresh token handling (auto-renew before 7-day expiry)
- [ ] OAuth (Google, Apple sign-in)
- [ ] Social login
- [ ] Profile editing
- [ ] Two-factor authentication

## 🐛 Troubleshooting

**Verification code not received?**
- Check backend server logs (code printed to console)
- Verify email spelling
- Check SMTP configuration if using email

**Login says "Email not verified"?**
- Verify email with the code from registration
- Check database: `SELECT email_verified FROM users WHERE email = '...';`

**"Invalid credentials" on login?**
- Check email spelling
- Verify password (case-sensitive)
- Ensure user was registered and email verified

**Token rejected?**
- Check JWT_SECRET matches between backend env and code
- Verify token hasn't expired (7 days)
- Check Authorization header format: `Bearer <token>`

