This file documents the cleanup performed and how to restore removed artifacts.

Removed directories:

- node_modules/ (run `npm install` to restore)
- ios/Pods/ (run `cd ios && pod install` to restore CocoaPods artifacts)
- ios/build/ (Xcode build artifacts)
- 2.6.0/ (ruby runtime/gems directory included in the repo)

How to restore the environment:

1. Install Node dependencies

   npm install

2. Reinstall iOS CocoaPods (requires CocoaPods and Xcode)

   cd ios
   pod install

3. If you rely on a specific Ruby environment, reinstall gems or use your project's Ruby setup.

Notes:
- I updated `.gitignore` to exclude node_modules, Pods, build folders, and vendor/bundle items. If you keep any generated files intentionally in the repo, please let me know.

*** End of file
