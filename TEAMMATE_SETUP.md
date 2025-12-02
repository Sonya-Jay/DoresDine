# Quick Setup Guide for Teammate

## If You Can't Connect to Database

### Step 1: Get Your IP Address

Visit: https://whatismyipaddress.com/

Copy your **IPv4 Address** (looks like: `123.45.67.89`)

### Step 2: Share Your IP with Team Lead

Send your IP address to the person who has AWS access. They need to add it to the RDS security group.

### Step 3: Wait for Access

Once your IP is added, you should be able to connect. This usually takes effect immediately.

### Step 4: Test Connection

```bash
# Make sure you have the DATABASE_URL in backend/.env
cd backend
npm run dev
```

You should see: `✅ Database connected successfully!`

## If You Still Can't Connect

1. **Double-check your IP** - It might have changed (especially if you're on a different network)
2. **Check your `.env` file** - Make sure `DATABASE_URL` is set correctly
3. **Try from a different network** - If you're on a VPN, try disconnecting
4. **Contact team lead** - They may need to add your new IP

## Temporary Workaround

If you need to work on frontend-only features while waiting for database access:
- The frontend can run independently
- You can test UI/UX without database connection
- Backend features will need database access

## Your IP Changed?

If you move to a different location (home → coffee shop, etc.), your IP changes. You'll need to:
1. Get your new IP address
2. Ask team lead to add it to security group
3. Or use the same network/VPN as before

