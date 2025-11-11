# Manual Test File Copy

It looks like there are permission issues accessing the old directory. Here are a few options:

## Option 1: Check if directory is empty

The directory exists but might be empty. Try:

```bash
# Check what's actually in the old directory
open /Users/sonya/Documents/DoresDine/frontend/__tests__
```

This will open it in Finder so you can see what files are there.

## Option 2: Copy specific test files

If you know the test file names, you can copy them individually:

```bash
cd /Users/sonya/Documents/doresdine-test/frontend

# Example: if you have a test file called "api.test.ts"
cp /Users/sonya/Documents/DoresDine/frontend/__tests__/api.test.ts ./__tests__/

# Or if tests are in subdirectories:
cp -r /Users/sonya/Documents/DoresDine/frontend/__tests__/components ./__tests__/
```

## Option 3: List test files first

Try listing what's in the directory:

```bash
# Try with different methods
ls /Users/sonya/Documents/DoresDine/frontend/__tests__/
find /Users/sonya/Documents/DoresDine/frontend/__tests__ -type f
```

## Option 4: Use Finder

1. Open Finder
2. Press Cmd+Shift+G (Go to Folder)
3. Enter: `/Users/sonya/Documents/DoresDine/frontend/__tests__`
4. Select all files
5. Copy (Cmd+C)
6. Navigate to: `/Users/sonya/Documents/doresdine-test/frontend/__tests__`
7. Paste (Cmd+V)

## Option 5: Tell me the test file names

If you can tell me:
- What test files you have (e.g., `api.test.ts`, `components.test.tsx`)
- What they test
- I can help recreate them or fix the paths

## Current Status

✅ Test infrastructure is set up and working
✅ Jest is configured
✅ Mocks are in place
✅ Ready to run tests once files are copied

Run `npm test` after copying to see if they pass!

