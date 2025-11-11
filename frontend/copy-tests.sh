#!/bin/bash

# Script to copy test files from old project
# Run this from the frontend directory

SOURCE_DIR="/Users/sonya/Documents/DoresDine/frontend/__tests__"
DEST_DIR="./__tests__"

echo "Copying test files from $SOURCE_DIR to $DEST_DIR..."

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: Source directory $SOURCE_DIR does not exist"
  exit 1
fi

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Copy all files and subdirectories
cp -r "$SOURCE_DIR"/* "$DEST_DIR/" 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ Test files copied successfully!"
  echo ""
  echo "Files copied:"
  find "$DEST_DIR" -type f
  echo ""
  echo "Run 'npm test' to run the tests"
else
  echo "❌ Failed to copy files. Please copy manually:"
  echo "  cp -r $SOURCE_DIR/* $DEST_DIR/"
fi

