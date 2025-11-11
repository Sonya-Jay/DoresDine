# TestFlight/App Store Submission Requirements

## Teacher's Requirements

1. ✅ **Evidence of TestFlight/App Store submission**
   - Steps taken to make app available on TestFlight
   - OR initial submission/contact with app store

2. ✅ **Presentation from mobile device**
   - Must be from deployed version on mobile device
   - NOT from laptop simulator
   - Must be able to project to screen from mobile device through laptop

## What You Need to Do

### Option 1: TestFlight (Recommended for Evidence)

#### Step 1: Apple Developer Account
- Sign up at https://developer.apple.com
- Cost: $99/year
- Required for TestFlight and App Store

#### Step 2: App Store Connect Setup
- Create app in App Store Connect
- Bundle ID: `com.doresdine.app`
- Set up app information

#### Step 3: Build and Submit
- Use EAS Build to create production build
- Submit to TestFlight
- Get TestFlight link for evidence

#### Step 4: Install on Device
- Install TestFlight app on your iPhone
- Install your app from TestFlight
- Test on real device

### Option 2: Development Build (Faster, but less "official")

#### Step 1: EAS Build
- Build development build
- Install directly on device
- Works on real device (not simulator)

#### Step 2: Evidence
- Screenshot of build process
- Screenshot of app running on device
- Documentation of deployment process

## Evidence You Can Provide

### For TestFlight:
1. Screenshot of App Store Connect app creation
2. Screenshot of TestFlight build submitted
3. TestFlight invitation/link
4. Screenshot of app running on device from TestFlight

### For Development Build:
1. Screenshot of EAS Build process
2. Screenshot of QR code/build link
3. Screenshot of app installed on device
4. Documentation of deployment steps

## Screen Mirroring for Presentation

### iOS (iPhone/iPad):
1. **AirPlay** (if Mac)
   - Connect iPhone and Mac to same WiFi
   - Swipe down from top-right on iPhone
   - Tap Screen Mirroring
   - Select your Mac

2. **QuickTime** (Mac)
   - Connect iPhone via USB
   - Open QuickTime
   - File → New Movie Recording
   - Click dropdown next to record button
   - Select your iPhone

3. **Third-party apps**
   - Reflector
   - AirServer
   - LonelyScreen

### Android:
1. **USB Debugging**
   - Enable USB debugging
   - Connect to laptop
   - Use scrcpy or Android Studio

2. **Wireless**
   - Use wireless ADB
   - Or screen mirroring apps

## Checklist for Submission

- [ ] Apple Developer account created (for TestFlight)
- [ ] App created in App Store Connect
- [ ] EAS Build configured
- [ ] Production build created
- [ ] Submitted to TestFlight
- [ ] App installed on real device
- [ ] Tested on device (not simulator)
- [ ] Screen mirroring tested
- [ ] Evidence collected (screenshots)

## Quick Start: TestFlight Setup

### 1. Create Apple Developer Account
- Go to https://developer.apple.com
- Enroll in Apple Developer Program
- Pay $99/year
- Wait for approval (usually 24-48 hours)

### 2. Create App in App Store Connect
- Go to https://appstoreconnect.apple.com
- Click "My Apps" → "+" → "New App"
- Fill in app information:
  - Name: DoresDine
  - Primary Language: English
  - Bundle ID: com.doresdine.app
  - SKU: doresdine-001

### 3. Install EAS CLI and Build
```bash
npm install -g eas-cli
cd frontend
eas login
eas build:configure
eas build --platform ios --profile production
```

### 4. Submit to TestFlight
```bash
eas submit --platform ios
```

### 5. Install on Device
- Install TestFlight app from App Store
- Accept TestFlight invitation
- Install your app
- Test on real device

## Alternative: Development Build (If TestFlight Takes Too Long)

If you need something faster for the presentation:

### 1. Build Development Build
```bash
npm install -g eas-cli
cd frontend
eas login
eas build:configure
eas build --platform ios --profile development
```

### 2. Install on Device
- Scan QR code from build
- Install on your iPhone
- App runs on real device (not simulator)

### 3. Evidence
- Screenshots of build process
- Screenshots of app on device
- Documentation of deployment

## Timeline

### TestFlight (Full Process):
- Apple Developer signup: 1-2 days (approval)
- App Store Connect setup: 30 minutes
- Build and submit: 1-2 hours
- TestFlight processing: 1-2 hours
- **Total: 2-3 days**

### Development Build (Quick):
- EAS setup: 30 minutes
- Build: 30-60 minutes
- Install on device: 5 minutes
- **Total: 1-2 hours**

## Recommendation

**For immediate presentation:**
1. Use **Development Build** for now
2. Install on real device
3. Test screen mirroring
4. Present from device

**For official evidence:**
1. Start TestFlight process
2. Submit to TestFlight
3. Get TestFlight link as evidence
4. Can present from TestFlight build

## Next Steps

1. **Decide**: TestFlight or Development Build?
2. **Set up**: EAS CLI and Expo account
3. **Build**: Create build for iOS
4. **Install**: Install on real device
5. **Test**: Screen mirroring setup
6. **Present**: From real device

Let me know which path you want to take, and I'll help you through it!

