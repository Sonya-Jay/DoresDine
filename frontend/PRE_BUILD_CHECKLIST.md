# Pre-Build Testing Checklist

## ✅ Test Before Building

### 1. App Starts and Loads
- [ ] App opens without crashes
- [ ] Feed screen loads
- [ ] No white screen or errors

### 2. Backend Connection
- [ ] Posts load from backend
- [ ] Dining halls load from backend
- [ ] No network errors

### 3. Core Features
- [ ] Create post button works
- [ ] Can navigate to create post screen
- [ ] Can select dining hall
- [ ] Can select meal type
- [ ] Can add photos (test photo picker)
- [ ] Can submit post
- [ ] Post appears in feed after creation

### 4. User Authentication
- [ ] User ID is set correctly
- [ ] Posts are created with correct user
- [ ] No "user not found" errors

### 5. Photo Upload
- [ ] Can select photos from library
- [ ] Photos upload successfully
- [ ] No 413 errors (if backend is deployed with fixes)
- [ ] Photos appear in posts

### 6. Navigation
- [ ] Bottom nav works
- [ ] Can navigate between tabs
- [ ] Create post modal opens/closes
- [ ] Comments modal works

### 7. UI/UX
- [ ] Screen fits properly on device
- [ ] No layout issues
- [ ] Safe areas work correctly
- [ ] Text is readable

## Quick Test Commands

### Test Backend Connection
```bash
# Health check
curl http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/health

# Test posts endpoint
curl -H "X-User-Id: d14e38ed-daed-4328-a9e7-f4beb8a7ba8c" \
  http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/posts
```

### Test App Locally
```bash
cd frontend
npm start
# Then test in Expo Go or simulator
```

## What to Test

### 1. Basic Functionality
- ✅ App opens
- ✅ Feed loads
- ✅ Navigation works
- ✅ No crashes

### 2. Backend Integration
- ✅ Posts fetch from backend
- ✅ Can create posts
- ✅ Photos upload
- ✅ Comments work
- ✅ Likes work

### 3. Known Issues to Verify Fixed
- ✅ Create post button works
- ✅ Screen layout fits device
- ✅ Photo upload doesn't give 413 error (if backend is updated)
- ✅ User authentication works

## If Something Doesn't Work

### Backend Not Connected
- Check API URL in `constants/API.ts`
- Verify backend is running
- Check network connectivity

### Photo Upload Fails
- Verify backend is deployed with latest fixes
- Check file size (should be under 20MB)
- Check backend logs

### Create Post Doesn't Work
- Check user ID is set
- Verify backend is accessible
- Check error messages in console

### Layout Issues
- Verify safe area insets are working
- Check screen size on device
- Test on different device sizes

## Recommended Testing Order

1. **Start app locally** - Make sure it runs
2. **Test backend connection** - Verify API calls work
3. **Test core features** - Create post, upload photo
4. **Fix any issues** - Address problems before building
5. **Build for device** - Once everything works locally

## After Testing

Once everything works:
1. ✅ Build with EAS: `eas build --platform ios --profile development`
2. ✅ Install on device
3. ✅ Test on real device
4. ✅ Set up screen mirroring
5. ✅ Ready for presentation!

## Current Status Check

Let's verify:
- [ ] App runs locally without errors
- [ ] Backend connection works
- [ ] Can create posts
- [ ] Photos upload (if backend is updated)
- [ ] Navigation works
- [ ] UI looks good

Test these first, then we'll build! 🚀

