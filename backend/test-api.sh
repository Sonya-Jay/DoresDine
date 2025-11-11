#!/bin/bash

# DoresDine Backend API Test Script
# Run this after PostgreSQL is set up

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "DoresDine Backend API Test"
echo "======================================"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
HEALTH=$(curl -s $BASE_URL/health)
echo "Response: $HEALTH"
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed - Is PostgreSQL running?${NC}"
    echo "Please run: createdb doresdine && psql -d doresdine -f migrations/001_initial_schema.sql"
    exit 1
fi
echo ""

# Test 2: Create User
echo -e "${YELLOW}Test 2: Create User${NC}"
USER_RESPONSE=$(curl -s -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"testuser@example.com"}')

echo "Response: $USER_RESPONSE"

if echo "$USER_RESPONSE" | grep -q '"id"'; then
    USER_ID=$(echo "$USER_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ User created with ID: $USER_ID${NC}"
else
    # Try to handle "already exists" error
    if echo "$USER_RESPONSE" | grep -q '"error":"username already exists"'; then
        echo -e "${YELLOW}⚠️  User already exists, using fallback UUID${NC}"
        USER_ID="00000000-0000-0000-0000-000000000001"
    else
        echo -e "${RED}❌ User creation failed${NC}"
        exit 1
    fi
fi
echo ""

# Test 3: Create Post
echo -e "${YELLOW}Test 3: Create Post${NC}"
POST_RESPONSE=$(curl -s -X POST $BASE_URL/posts \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $USER_ID" \
  -d '{
    "caption": "Test post from API script!",
    "photos": []
  }')

echo "Response: $POST_RESPONSE"

if echo "$POST_RESPONSE" | grep -q '"id"'; then
    POST_ID=$(echo "$POST_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✅ Post created with ID: $POST_ID${NC}"
else
    echo -e "${RED}❌ Post creation failed${NC}"
    exit 1
fi
echo ""

# Test 4: Create Post with Photos
echo -e "${YELLOW}Test 4: Create Post with Photos${NC}"
POST_WITH_PHOTOS=$(curl -s -X POST $BASE_URL/posts \
  -H "Content-Type: application/json" \
  -H "X-User-Id: $USER_ID" \
  -d '{
    "caption": "Post with mock photos",
    "photos": [
      {"storage_key": "uploads/test1.jpg", "display_order": 0},
      {"storage_key": "uploads/test2.jpg", "display_order": 1}
    ]
  }')

echo "Response: $POST_WITH_PHOTOS"

if echo "$POST_WITH_PHOTOS" | grep -q '"photos"'; then
    echo -e "${GREEN}✅ Post with photos created successfully${NC}"
else
    echo -e "${RED}❌ Post with photos failed${NC}"
    exit 1
fi
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo "======================================"
echo ""
echo "Your backend is ready to receive requests from the frontend!"
echo ""
echo "Next steps:"
echo "1. Start your React Native app: cd ../frontend && npm start"
echo "2. Click the + button to create a post"
echo "3. Fill out the form and submit"
echo "4. You should see a success alert!"
