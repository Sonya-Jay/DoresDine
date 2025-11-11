# Submission Checklist for Teacher

## Requirements

### 1. Evidence of TestFlight/App Store Submission ✅
- [ ] Screenshot of App Store Connect app creation
- [ ] Screenshot of TestFlight build submission
- [ ] TestFlight invitation/link
- [ ] Screenshot of app running on device from TestFlight

### 2. Presentation from Mobile Device ✅
- [ ] App installed on real mobile device (not simulator)
- [ ] App runs on device
- [ ] Screen mirroring set up and tested
- [ ] Can project device screen to laptop

## Quick Path: Development Build (Fastest)

### Steps:
1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   cd frontend
   eas login
   ```

3. **Configure EAS Build**
   ```bash
   eas build:configure
   ```

4. **Build for iOS**
   ```bash
   eas build --platform ios --profile development
   ```

5. **Install on Device**
   - Scan QR code from build output
   - Install on your iPhone
   - App runs on real device (not simulator)

6. **Set Up Screen Mirroring**
   - Use AirPlay (iPhone to Mac)
   - Or QuickTime (iPhone via USB)
   - Test projection to laptop screen

### Evidence:
- Screenshot of EAS Build process
- Screenshot of build completion
- Screenshot of app installed on device
- Screenshot of app running on device
- Screenshot of screen mirroring setup

## Full Path: TestFlight (More Official)

### Steps:
1. **Apple Developer Account** ($99/year)
   - Sign up at https://developer.apple.com
   - Wait for approval (1-2 days)

2. **App Store Connect**
   - Create app in App Store Connect
   - Bundle ID: `com.doresdine.app`

3. **Build and Submit**
   - `eas build --platform ios --profile production`
   - `eas submit --platform ios`

4. **TestFlight**
   - App appears in TestFlight
   - Install TestFlight app on device
   - Install your app from TestFlight

### Evidence:
- Screenshot of App Store Connect app
- Screenshot of TestFlight build
- TestFlight invitation email
- Screenshot of app in TestFlight
- Screenshot of app running on device

## Screen Mirroring Setup

### iPhone to Mac (AirPlay):
1. Connect iPhone and Mac to same WiFi
2. On iPhone: Swipe down from top-right
3. Tap "Screen Mirroring"
4. Select your Mac
5. iPhone screen appears on Mac

### iPhone to Mac (QuickTime):
1. Connect iPhone via USB cable
2. Open QuickTime on Mac
3. File → New Movie Recording
4. Click dropdown next to record button
5. Select your iPhone
6. iPhone screen appears in QuickTime

### For Presentation:
- Use AirPlay for wireless projection
- Or QuickTime for wired connection
- Present from Mac screen (showing iPhone)

## Current Status

✅ **App configured** - `app.json` set up with bundle identifiers
✅ **Backend deployed** - AWS Elastic Beanstalk
✅ **API connected** - Frontend connects to backend
✅ **Ready to build** - Just need EAS Build setup

## Next Steps

1. **Install EAS CLI**: `npm install -g eas-cli`
2. **Login**: `eas login`
3. **Configure**: `eas build:configure`
4. **Build**: `eas build --platform ios --profile development`
5. **Install**: Install on your iPhone
6. **Test**: Test screen mirroring
7. **Present**: Present from device via screen mirroring

## Timeline

### Development Build: 1-2 hours
- EAS setup: 30 min
- Build: 30-60 min
- Install: 5 min
- Screen mirroring: 10 min

### TestFlight: 2-3 days
- Apple Developer: 1-2 days (approval)
- App Store Connect: 30 min
- Build and submit: 1-2 hours
- TestFlight processing: 1-2 hours

## Recommendation

**For immediate presentation:**
- Use **Development Build** (faster, works on real device)
- Set up screen mirroring
- Present from device

**For official evidence:**
- Start **TestFlight** process
- Submit to TestFlight
- Get TestFlight link as evidence
- Can still present from development build while waiting

## Evidence to Collect

1. Screenshots of build process
2. Screenshots of app on device
3. Screenshots of screen mirroring
4. Documentation of deployment steps
5. TestFlight submission (if using TestFlight)

Let's get you set up! Which path do you want to take?

