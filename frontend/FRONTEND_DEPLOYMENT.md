# Frontend Deployment Guide

## Deployment Options for Expo Apps

### 1. **Development Build (Recommended for Testing)**
- Build a development build that can be installed on devices
- Works with Expo Go-like experience but with your custom native code
- Can install via QR code or direct download
- **Best for**: Testing with real devices, internal testing

### 2. **TestFlight (iOS Beta Testing)**
- Apple's beta testing platform
- Requires Apple Developer account ($99/year)
- Requires EAS Build to create iOS build first
- **Best for**: iOS beta testing with external testers

### 3. **Google Play Internal Testing (Android)**
- Google's internal testing platform
- Requires Google Play Developer account ($25 one-time)
- Requires EAS Build to create Android build first
- **Best for**: Android beta testing

### 4. **Production Build (App Store/Play Store)**
- Final production builds for App Store/Play Store
- Requires EAS Build
- **Best for**: Public release

## Quick Start: Development Build

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Configure EAS Build
```bash
cd frontend
eas build:configure
```

This will create an `eas.json` file with build configurations.

### Step 4: Build for iOS (Development)
```bash
eas build --platform ios --profile development
```

### Step 5: Build for Android (Development)
```bash
eas build --platform android --profile development
```

## TestFlight Setup (iOS)

### Prerequisites
1. Apple Developer account ($99/year)
2. App Store Connect access
3. EAS Build configured

### Steps
1. **Configure app.json for iOS:**
   - Add bundle identifier
   - Configure app icons and splash screens
   - Set up app store information

2. **Build for iOS (Production):**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Submit to TestFlight:**
   ```bash
   eas submit --platform ios
   ```

4. **Add TestFlight Testers:**
   - Go to App Store Connect
   - Add internal/external testers
   - Share TestFlight link

## Configuration Needed

### 1. Update app.json
Add iOS bundle identifier and Android package name:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.doresdine",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.doresdine",
      "versionCode": 1
    }
  }
}
```

### 2. Create eas.json
EAS Build configuration file with build profiles.

### 3. Environment Variables
Make sure `EXPO_PUBLIC_API_URL` is set in your build environment.

## Recommended: Start with Development Build

For testing, I recommend starting with a **development build**:
- Easier to set up (no Apple/Google accounts needed initially)
- Can install directly on devices
- Faster iteration
- Can test all features

Then move to TestFlight/Play Store when ready for beta testing.

## Next Steps

1. **Install EAS CLI**: `npm install -g eas-cli`
2. **Login**: `eas login`
3. **Configure**: `eas build:configure`
4. **Build**: `eas build --platform ios --profile development`

Would you like me to help you set up the EAS configuration?

