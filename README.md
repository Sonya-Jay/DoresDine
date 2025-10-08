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

- **Frontend:** React Native (CLI-managed project)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Notifications:** Firebase

## Project Goals

- Provide accurate, real-time dining information
- Enhance student dining decisions with peer insights
- Create a secure, Vanderbilt login–based system for trust and community engagement

---

# ⚙️ Getting Started (Local Development)

### Prerequisites

You must have the following installed to run the project locally:

1.  **Node.js** (LTS version recommended)
2.  **Yarn** or **npm** (Yarn is preferred)
3.  **Xcode** (Latest stable version from the Mac App Store)
4.  **CocoaPods** (Installed via Ruby: `sudo gem install cocoapods`)

### 1. Project Setup

Navigate to the project root directory in your terminal and install all dependencies:

    # Install JavaScript dependencies
    npm install  # or yarn install

    # Navigate into the iOS directory and install native dependencies (Pods)
    cd ios
    pod install
    cd .. # Go back to the project root

### 2. Environment Variables

Create a file named **`.env`** in the project root and add your necessary environment variables (e.g., API URLs, Firebase configuration keys).

---

# ▶️ Running the Application (iOS Simulator)

1.  **Start the Metro Bundler** (Keep this terminal window open in the project root):

        npm start

2.  **Launch the App on the Simulator** (Open a new terminal window in the project root):

        npx react-native run-ios --simulator="iPhone 15 Pro"

    _(Replace `"iPhone 15 Pro"` with the exact name of any installed simulator.)_

---

# ⚠️ Troubleshooting Xcode Build Failures

If you encounter an iOS build error, follow this comprehensive cleanup and reset procedure.

| Step                  | Command (Run from project root unless noted)        | Purpose                                                                  |
| :-------------------- | :-------------------------------------------------- | :----------------------------------------------------------------------- |
| **1. Reset JS Cache** | `npm start -- --reset-cache`                        | Clears Metro Bundler's cache.                                            |
| **2. Clean Pods**     | `cd ios && pod deintegrate`                         | Removes Pods integration from Xcode config.                              |
| **3. Delete Files**   | `rm -rf ios/Pods ios/Podfile.lock ios/build`        | Deletes all generated native dependencies and local build artifacts.     |
| **4. Deep Cache**     | `rm -rf ~/Library/Developer/Xcode/DerivedData`      | Deletes the global Xcode build cache.                                    |
| **5. Indexing Cache** | `rm -rf ~/Library/Caches/com.apple.DeveloperTools/` | Clears the indexing cache (fixes 'Preparing Editor Functionality' loop). |
| **6. Reinstall Pods** | `cd ios && pod install`                             | Reinstalls and relinks all native dependencies cleanly.                  |
| **7. Final Build**    | `cd .. && npx react-native run-ios`                 | Attempts a fresh build and run.                                          |

## Common Solutions for Specific Errors

| Error Message                                 | Fix                                                                                                                                                 |
| :-------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Command PhaseScriptExecution failed...`      | Perform the comprehensive cleanup (steps 1-7 above).                                                                                                |
| `Implicit conversion loses integer precision` | **In Xcode:** Select the **Pods** project > **Build Settings**, search for `Treat Warnings as Errors`, and set it to **No** for all configurations. |
| `Signing requires a development team`         | **In Xcode:** Select the `DoresDine` target > **Signing** section. Select your **Julia Laforet (Personal Team)**.                                   |
| `ld: library 'DoubleConversion' not found`    | This is a **linker failure**. Run the comprehensive Pod cleanup and reinstall (steps 1-7 above) to correct the build paths.                         |
| **App won't install on Simulator**            | **In Simulator app:** Go to **Device** > **Erase All Content and Settings...** then run `npx react-native run-ios` again.                           |
| **Project is in iCloud/Downloads**            | **Move the entire project** to a local, non-synced folder (like your Desktop or Documents).                                                         |

---

## 🚀 Deployment

The app is currently managed via the React Native CLI for local development. Future deployment to App Store/Google Play will require configuring Distribution Certificates and Provisioning Profiles via Xcode/App Store Connect.
