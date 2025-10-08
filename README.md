# DoresDine

## Overview

DoresDine is a mobile-first application designed to dramatically improve the Vanderbilt dining experience. It provides student-generated photos, ratings, and reviews of dining hall meals to help students make informed choices and engage with their peers in a community-driven system.

## Features

- View menus by dining hall
- Search dishes by name or dietary filters
- Upload and browse photos of meals
- Ratings, reviews, and trending dishes
- Push notifications for favorite meals
- Dining hall comparisons and busyness indicators
- Community moderation and contributions
- Chatbot support for quick meal queries

## Tech Stack

- **Frontend:** React Native 0.81.4 (CLI-managed project)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Notifications:** Firebase
- **Dependencies:** react-native-safe-area-context, react-native-vector-icons

## Project Goals

- Provide accurate, real-time dining information
- Enhance student dining decisions with peer insights
- Create a secure, Vanderbilt login–based system for trust and community engagement

---

# ⚙️ System Requirements & Prerequisites

## Required Software

1. **Node.js** (v16+ recommended) - [Download from nodejs.org](https://nodejs.org)
2. **Xcode** (15.4+ required) - Install from Mac App Store
3. **CocoaPods** (Will be installed during setup)
4. **Ruby** (System Ruby 2.6+ is sufficient)

## Important Compatibility Notes

This project uses React Native 0.81.4 which has specific requirements:
- **Xcode 15.4+** is supported (though RN 0.81.4 officially prefers 16.1+)
- **CocoaPods 1.11.3+** is required for compatibility
- Several podspec files have been modified for backward compatibility

---

# 🛠️ Initial Setup (First Time Only)

## Step 1: Install CocoaPods

If you don't have CocoaPods installed, run these commands:

```bash
# Install CocoaPods via gem (user installation)
gem install --user-install cocoapods -v 1.11.3

# Add gem binaries to your PATH (for zsh users)
echo 'export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
pod --version
```

**Expected output:** `1.11.3`

## Step 2: Project Setup

Navigate to the project root directory and install dependencies:

```bash
# Clone the repository (if not already done)
git clone https://github.com/Sonya-Jay/DoresDine.git
cd DoresDine

# Install JavaScript dependencies
cd frontend
npm install

# Install iOS native dependencies
cd ios
pod install
cd ..
```

## Step 3: Environment Variables

Create a file named **`.env`** in the `frontend` directory and add your necessary environment variables:

```bash
cd frontend
touch .env
```

Add your configuration (example):
```
API_BASE_URL=http://localhost:3000
FIREBASE_API_KEY=your_firebase_api_key
```

---

# ▶️ Running the Application

## Start Development Environment

1. **Start the Metro Bundler** (from `frontend` directory):
   ```bash
   cd frontend
   npm start
   ```
   Keep this terminal window open.

2. **Launch the iOS App** (open a new terminal in `frontend` directory):
   ```bash
   cd frontend
   npx react-native run-ios --simulator="iPhone 15 Pro"
   ```

## Available Simulators

To see available iOS simulators:
```bash
xcrun simctl list devices
```

Common simulator options:
- `"iPhone 15 Pro"`
- `"iPhone 14"`
- `"iPhone SE (3rd generation)"`

---

# ⚠️ Troubleshooting & Known Issues

## CocoaPods Installation Issues

### Issue: `pod: command not found`
**Solution:** Follow the CocoaPods installation steps above, ensuring the gem bin directory is added to your PATH.

### Issue: `visionos platform not supported`
**Status:** ✅ **Already Fixed** - visionos references have been commented out in the following files:
- `node_modules/react-native-safe-area-context/react-native-safe-area-context.podspec`
- `node_modules/react-native/React/CoreModules/React-CoreModules.podspec`
- `node_modules/react-native/sdks/hermes-engine/hermes-engine.podspec`

### Issue: `Please upgrade XCode` (requiring Xcode 16.1+)
**Status:** ✅ **Already Fixed** - Xcode version check has been disabled in:
- `node_modules/react-native/scripts/cocoapods/utils.rb`

### Issue: `always_out_of_date script phase option not supported`
**Status:** ✅ **Already Fixed** - Unsupported option removed from:
- `node_modules/react-native/React/React-RCTFBReactNativeSpec.podspec`

## iOS Build Failures

If you encounter build errors, follow this comprehensive cleanup procedure:

| Step | Command | Purpose |
|------|---------|---------|
| **1. Reset JS Cache** | `npm start -- --reset-cache` | Clears Metro Bundler's cache |
| **2. Clean Pods** | `cd ios && pod deintegrate` | Removes Pods integration |
| **3. Delete Build Files** | `rm -rf ios/Pods ios/Podfile.lock ios/build` | Deletes generated files |
| **4. Clear Xcode Cache** | `rm -rf ~/Library/Developer/Xcode/DerivedData` | Deletes Xcode build cache |
| **5. Clear Dev Tools Cache** | `rm -rf ~/Library/Caches/com.apple.DeveloperTools/` | Fixes indexing issues |
| **6. Reinstall Pods** | `cd ios && pod install` | Reinstalls dependencies |
| **7. Rebuild** | `cd .. && npx react-native run-ios` | Fresh build |

## Common Error Solutions

| Error | Solution |
|-------|----------|
| `Command PhaseScriptExecution failed` | Run full cleanup procedure above |
| `Signing requires a development team` | In Xcode: Select DoresDine target > Signing > Choose your team |
| `library not found` | Run pod deintegrate + clean + pod install |
| `Simulator won't install app` | Reset simulator: Device > Erase All Content and Settings |
| `Metro bundler connection issues` | Restart Metro: `npm start -- --reset-cache` |

## Dependency Compatibility Notes

- **CocoaPods 1.11.3** is specifically installed for React Native 0.81.4 compatibility
- **Ruby 2.6.10** system version is sufficient (no upgrade needed)
- **Node.js v22.20.0** is currently used and working well
- Several podspec files have been patched for older CocoaPods compatibility

---

# 🔧 Configuration Files Modified

The following files have been modified for compatibility and should not be updated via `npm install`:

## React Native Core Files
- `node_modules/react-native/scripts/cocoapods/utils.rb` - Xcode version check disabled
- `node_modules/react-native/React/CoreModules/React-CoreModules.podspec` - visionos removed
- `node_modules/react-native/React/React-RCTFBReactNativeSpec.podspec` - always_out_of_date removed
- `node_modules/react-native/sdks/hermes-engine/hermes-engine.podspec` - visionos removed

## Third-party Dependencies
- `node_modules/react-native-safe-area-context/react-native-safe-area-context.podspec` - visionos removed

## Podfile Configuration
- `frontend/ios/Podfile` - Added environment variable to ignore Xcode version requirement

**⚠️ Important:** These modifications will be lost if you run `npm install` or update dependencies. You may need to reapply these changes after dependency updates.

---

# 🚀 Deployment

The app is currently configured for local development. For production deployment:

1. **iOS App Store:** Configure Distribution Certificates and Provisioning Profiles via Xcode/App Store Connect
2. **Android:** Set up signing keys and configure for Google Play Store
3. **Environment Configuration:** Set up production environment variables

---

# 📱 Supported Platforms

- **iOS:** 15.1+ (configured in Podfile)
- **Android:** API level 21+ (React Native default)
- **Development OS:** macOS (required for iOS development)

---

# 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the setup instructions above
4. Make your changes
5. Test on both iOS and Android (if applicable)
6. Submit a pull request

---

# � Notes for Developers

- Always run `pod install` after pulling changes that modify dependencies
- Keep Metro bundler running during development for hot reloading
- Use `npx react-native run-ios` instead of building directly in Xcode for development
- The project uses React Native's new architecture (enabled by default in 0.81.4)
- Hermes JavaScript engine is enabled for better performance
