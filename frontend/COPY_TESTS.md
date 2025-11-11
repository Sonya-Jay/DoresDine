# Copy Test Files

## Testing Infrastructure ✅

The testing setup is complete:
- ✅ Jest configured
- ✅ React Native Testing Library installed
- ✅ jest-expo preset configured
- ✅ Mocks set up for expo-router, AsyncStorage, etc.
- ✅ Test scripts added to package.json

## Manual Copy Instructions

Since I can't access the old directory directly, please copy your test files manually:

### Option 1: Using Terminal

```bash
cd /Users/sonya/Documents/doresdine-test/frontend
cp -r /Users/sonya/Documents/DoresDine/frontend/__tests__/* ./__tests__/
```

### Option 2: Using Finder

1. Open Finder
2. Navigate to `/Users/sonya/Documents/DoresDine/frontend/__tests__`
3. Select all test files
4. Copy them (Cmd+C)
5. Navigate to `/Users/sonya/Documents/doresdine-test/frontend/__tests__`
6. Paste them (Cmd+V)

### Option 3: Check File Names

If the directory appears empty, the test files might be:
- In a subdirectory
- Named differently (check for `.test.js`, `.test.ts`, `.spec.js`, etc.)
- In a different location

## After Copying

Once you've copied the files, run:

```bash
cd frontend
npm test
```

This will run all your tests and show you if they pass or fail.

## Test Commands

- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode (auto-rerun on file changes)
- `npm run test:coverage` - Run tests with coverage report

## If Tests Fail

After copying, some tests might need updates because:
- File paths may have changed
- Component imports may need updating
- API mocks might need adjustment

Let me know which tests fail and I'll help fix them!

