# Quick Pre-Build Test

## ✅ Backend Status
✅ Backend is responding: `{"status":"ok","database":"connected"}`

## Quick Test Steps (5 minutes)

### 1. Start App Locally
```bash
cd frontend
npm start
```

### 2. Test in Expo Go (on your phone)
- Scan QR code
- App should open
- Feed should load posts from backend

### 3. Quick Feature Check
- [ ] Feed loads posts
- [ ] Create post button works
- [ ] Can navigate to create post screen
- [ ] Can select dining hall
- [ ] Navigation works (bottom nav)

### 4. Test Photo Upload (if time)
- [ ] Can select photo
- [ ] Photo uploads (if backend has latest fixes)

## If Everything Works ✅
→ Ready to build! Run:
```bash
eas build --platform ios --profile development
```

## If Something Breaks ❌
→ Fix it first, then build

## What to Test

### Must Work:
1. ✅ App opens
2. ✅ Feed loads posts
3. ✅ Navigation works
4. ✅ Create post screen opens

### Nice to Have:
5. ✅ Can create post
6. ✅ Photos upload
7. ✅ Comments work

## Quick Test Command

Test backend posts endpoint:
```bash
curl -H "X-User-Id: d14e38ed-daed-4328-a9e7-f4beb8a7ba8c" \
  http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/posts
```

If this returns posts, backend is working! ✅

