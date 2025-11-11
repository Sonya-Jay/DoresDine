# Quick Frontend Deployment Guide

## Option 1: Development Build (Recommended for Testing) ⭐

### Steps:
1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```
   (Create account at https://expo.dev if needed)

3. **Configure EAS Build**
   ```bash
   cd frontend
   eas build:configure
   ```
   This creates `eas.json` and updates `app.json`

4. **Build for iOS**
   ```bash
   eas build --platform ios --profile development
   ```

5. **Install on Device**
   - Scan QR code from build output
   - Or download from Expo dashboard
   - Install on your iPhone

### Cost: FREE ✅

---

## Option 2: TestFlight (iOS Beta Testing)

### Prerequisites:
- Apple Developer Account ($99/year)
- App Store Connect access

### Steps:
1. **Sign up for Apple Developer**
   - Go to https://developer.apple.com
   - Enroll in Apple Developer Program

2. **Create App in App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Create new app
   - Bundle ID: `com.doresdine.app`

3. **Build for Production**
   ```bash
   eas build --platform ios --profile production
   ```

4. **Submit to TestFlight**
   ```bash
   eas submit --platform ios
   ```

5. **Add Testers**
   - Go to App Store Connect → TestFlight
   - Add internal/external testers
   - Share TestFlight link

### Cost: $99/year (Apple Developer Account)

---

## Recommendation

**Start with Development Build:**
- ✅ Free
- ✅ No accounts needed
- ✅ Quick setup
- ✅ Install directly on devices
- ✅ Perfect for testing

**Then move to TestFlight:**
- When ready for beta testing
- When you need external testers
- When you want App Store distribution

---

## Current Configuration

✅ **app.json** - Updated with:
- Bundle identifier: `com.doresdine.app`
- App name: `DoresDine`
- iOS and Android configured

✅ **API URL** - Already configured:
- Backend: `http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com`

---

## Next Steps

1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Configure: `eas build:configure`
4. Build: `eas build --platform ios --profile development`

Then install on your device and test! 🚀

