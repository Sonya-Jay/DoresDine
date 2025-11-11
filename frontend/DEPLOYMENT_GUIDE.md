# Frontend Deployment Guide

## Deployment Options

### Option 1: Development Build (Recommended for Testing)
- **What**: Build a native app you can install on devices
- **Pros**: 
  - No App Store/Play Store account needed
  - Can install directly on devices via QR code
  - Fast iteration and testing
  - Works with all native features
- **Best for**: Internal testing, development, beta testing with small groups

### Option 2: TestFlight (iOS) / Internal Testing (Android)
- **What**: Beta testing through App Store/Play Store
- **Pros**: 
  - Professional beta testing platform
  - Easy distribution to testers
  - Over-the-air updates
- **Cons**: 
  - Requires Apple Developer account ($99/year) for iOS
  - Requires Google Play Developer account ($25 one-time) for Android
- **Best for**: Beta testing with external testers

### Option 3: Production (App Store/Play Store)
- **What**: Public release on app stores
- **Best for**: Final production release

## Quick Start: Development Build

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
(Create an account at https://expo.dev if you don't have one)

### Step 3: Configure EAS Build
```bash
cd frontend
eas build:configure
```
This will:
- Create `eas.json` configuration file
- Add `projectId` to `app.json`
- Set up build profiles

### Step 4: Build for iOS (Development)
```bash
eas build --platform ios --profile development
```

### Step 5: Install on Device
- Scan QR code from build output
- Or download from Expo dashboard
- Install on your iPhone/iPad

### Step 6: Build for Android (Development)
```bash
eas build --platform android --profile development
```

## TestFlight Setup (iOS)

### Prerequisites
1. **Apple Developer Account** ($99/year)
   - Sign up at https://developer.apple.com
   - Enroll in Apple Developer Program

2. **App Store Connect Access**
   - Create an app in App Store Connect
   - Set up bundle identifier

### Steps

1. **Configure app.json** (already done)
   - Bundle identifier: `com.doresdine.app`
   - App name: `DoresDine`

2. **Build for iOS (Production)**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Submit to TestFlight**
   ```bash
   eas submit --platform ios
   ```
   (First time will ask for Apple credentials)

4. **Add TestFlight Testers**
   - Go to App Store Connect
   - Navigate to TestFlight
   - Add internal/external testers
   - Share TestFlight link

## Configuration Files

### app.json
Already configured with:
- iOS bundle identifier: `com.doresdine.app`
- Android package: `com.doresdine.app`
- App name: `DoresDine`

### eas.json (will be created)
Contains build profiles for:
- Development builds
- Production builds
- Build configuration

## Environment Variables

### For EAS Build
Set environment variables in `eas.json` or via EAS CLI:
```bash
eas build:configure
```

Or set in `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com"
      }
    }
  }
}
```

## Recommended Workflow

### For Testing (Now):
1. **Development Build**
   - Build with `eas build --platform ios --profile development`
   - Install on devices via QR code
   - Test all features
   - Iterate quickly

### For Beta Testing (Later):
1. **TestFlight/Play Store Internal Testing**
   - Build production builds
   - Submit to TestFlight/Play Store
   - Distribute to beta testers
   - Collect feedback

### For Production (Final):
1. **App Store/Play Store Release**
   - Build production builds
   - Submit for review
   - Release to public

## Cost

### Development Build
- **Free** - No cost for development builds
- EAS Build free tier includes builds

### TestFlight
- **Apple Developer Account**: $99/year
- **TestFlight**: Free (included with developer account)

### Google Play Internal Testing
- **Google Play Developer Account**: $25 one-time
- **Internal Testing**: Free

## Next Steps

1. **Install EAS CLI**: `npm install -g eas-cli`
2. **Login**: `eas login`
3. **Configure**: `eas build:configure`
4. **Build iOS**: `eas build --platform ios --profile development`
5. **Install on device** and test!

## Notes

- **API URL**: Already configured in `constants/API.ts`
- **Backend**: Connected to AWS Elastic Beanstalk
- **User Authentication**: Currently using test user
- **Photo Uploads**: Fixed with 20MB limit

## Troubleshooting

### Build fails
- Check `eas.json` configuration
- Verify app.json is correct
- Check EAS Build logs

### Can't install on device
- Check device UDID is registered (for development builds)
- Verify build completed successfully
- Check QR code is valid

### TestFlight submission fails
- Verify Apple Developer account is active
- Check bundle identifier matches App Store Connect
- Verify certificates are valid

