# Free iOS Build - Quick Start

## ✅ FREE Option: Development Build

**You can build and install on your iPhone for FREE!**

No Apple Developer account ($99/year) needed for development builds.

## 🚀 Quick Start (3 Steps)

### Step 1: Install EAS CLI and Login

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo (FREE account)
eas login
# Create account at https://expo.dev if needed (it's free!)
```

### Step 2: Build Development Build

```bash
cd frontend
eas build --platform ios --profile development
```

⏱️ Takes 10-20 minutes. You'll get a QR code to scan.

### Step 3: Install on Your iPhone

**Option A: QR Code (Easiest)**
- Scan QR code with iPhone camera
- Install directly
- Open and test

**Option B: Download .ipa**
- Download .ipa file from build URL
- Install via Xcode (free, requires Mac)
- Or use AltStore/Sideloadly (free)

## 📱 For Your Presentation

Your requirement: "presentation must be from a version deployed on one of your mobile device"

**Solution:**
1. Build development build (FREE)
2. Install on your iPhone (FREE)
3. Project iPhone to laptop/screen
4. Present from your device

**This meets the requirement! ✅**

## 🎬 Projecting iPhone to Screen

### Option 1: QuickTime (Mac + USB)
1. Connect iPhone to Mac via USB
2. Open QuickTime Player
3. File → New Movie Recording
4. Click dropdown next to record button
5. Select your iPhone
6. Full screen and present!

### Option 2: AirPlay (If available)
1. Connect iPhone and Mac to same WiFi
2. Swipe down on iPhone → Screen Mirroring
3. Select your Mac
4. Present!

### Option 3: Third-Party Apps
- Reflector (paid)
- AirServer (paid)
- LonelyScreen (free trial)

## 💰 Cost Comparison

| Method | Cost | Apple Dev Account | Distribution |
|--------|------|-------------------|--------------|
| **Development Build** | **FREE ✅** | Not needed | Manual (you) |
| TestFlight | $99/year | Required | Easy (testers) |

## 🔄 Development Build vs TestFlight

### Development Build (FREE)
- ✅ Free
- ✅ No Apple Developer account
- ✅ Install on your device
- ✅ All features work
- ❌ Manual installation
- ❌ Limited distribution

### TestFlight ($99/year)
- ❌ $99/year
- ❌ Requires Apple Developer account
- ✅ Easy distribution
- ✅ Automatic updates
- ✅ Up to 10,000 testers
- ✅ Professional

## 🎯 For Your Use Case

**Development Build is Perfect Because:**
- ✅ FREE
- ✅ Meets presentation requirement
- ✅ Install on your device
- ✅ Project to screen
- ✅ All features work
- ✅ No cost

**You don't need TestFlight for your presentation!**

## 📝 Quick Commands

```bash
# Build development build (FREE)
eas build --platform ios --profile development

# Check build status
eas build:list

# View build details
eas build:view [BUILD_ID]
```

## 🆘 Troubleshooting

### Build Fails
- Check logs: `eas build:list` → Click on build
- Common: Network issues, try again

### Can't Install on Device
- Make sure you're scanning QR code correctly
- Or download .ipa and install via Xcode
- Check iOS version compatibility

### App Doesn't Work
- Check API URL is correct in `eas.json`
- Verify backend is running
- Check network connectivity

## ✨ Summary

**You can build and install on your iPhone for FREE using development builds!**

No need for TestFlight ($99/year) unless you need:
- Easy distribution to many testers
- Automatic updates
- Professional appearance for clients

For your presentation, development build is perfect and FREE! ✅

