#!/bin/bash

# Free Development Build Script for DoresDine
# This builds a development build that can be installed on your iPhone for FREE

set -e

echo "🆓 DoresDine FREE Development Build"
echo "===================================="
echo ""
echo "This will build a development build that you can install on your iPhone"
echo "for FREE (no Apple Developer account needed for development builds)"
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
    echo "✅ EAS CLI installed"
else
    echo "✅ EAS CLI is installed"
fi

echo ""
echo "🔐 Checking Expo login..."
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to Expo. Please run: eas login"
    echo "   (Expo account is FREE at https://expo.dev)"
    exit 1
fi
echo "✅ Logged in to Expo"

echo ""
echo "📦 Build Configuration:"
echo "  - Profile: development"
echo "  - Platform: iOS"
echo "  - Distribution: internal"
echo "  - Cost: FREE ✅"
echo "  - Apple Developer Account: NOT REQUIRED ✅"
echo ""

echo "📱 After build completes:"
echo "  1. You'll get a QR code"
echo "  2. Scan with your iPhone camera"
echo "  3. Install the app directly"
echo "  4. Or download .ipa file and install via Xcode"
echo ""

read -p "Ready to build? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🏗️  Starting development build..."
echo "   This will take 10-20 minutes..."
echo "   (First build may take longer)"
echo ""

# Build for development
eas build --platform ios --profile development

echo ""
echo "✅ Build completed!"
echo ""
echo "📱 Next steps:"
echo "  1. Scan the QR code with your iPhone camera"
echo "  2. Or download the .ipa file from the build URL"
echo "  3. Install on your device"
echo "  4. Project your iPhone to screen and present!"
echo ""
echo "💡 Tip: You can project your iPhone to your laptop using:"
echo "   - AirPlay (if you have Apple TV or compatible device)"
echo "   - QuickTime (connect iPhone to Mac via USB)"
echo "   - Third-party apps (Reflector, AirServer, etc.)"
echo ""
echo "✨ Done! Your app is ready to install for FREE!"

