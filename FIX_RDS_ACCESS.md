# Fix RDS Database Access for Teammate

## The Problem
Your teammate's IP address isn't whitelisted in the AWS RDS security group, so they can't connect to the database.

## Solution: Add Teammate's IP to RDS Security Group

### Step 1: Get Teammate's IP Address

Your teammate needs to find their public IP address:

**Option A: Using a website**
- Go to https://whatismyipaddress.com/
- Copy the IPv4 address shown (e.g., `123.45.67.89`)

**Option B: Using command line**
```bash
# On Mac/Linux
curl ifconfig.me

# Or
curl ipinfo.io/ip
```

### Step 2: Add IP to RDS Security Group (AWS Console)

1. **Go to AWS Console**
   - Navigate to https://console.aws.amazon.com
   - Sign in with your AWS account

2. **Find Your RDS Instance**
   - Go to **RDS** service
   - Click **Databases** in the left sidebar
   - Find your database (likely named something like `doresdine-db`)
   - Click on it to open details

3. **Open Security Group**
   - In the **Connectivity & security** tab
   - Find **VPC security groups** section
   - Click on the security group link (e.g., `sg-xxxxxxxxx`)

4. **Add Inbound Rule**
   - In the security group page, click **Edit inbound rules**
   - Click **Add rule**
   - Configure:
     - **Type**: PostgreSQL (or Custom TCP)
     - **Port**: 5432
     - **Source**: Custom
     - **IP**: Enter teammate's IP address with `/32` (e.g., `123.45.67.89/32`)
     - **Description**: "Teammate access - [their name]"
   - Click **Save rules**

### Step 3: Verify Connection

Your teammate should now be able to connect. They can test by:

```bash
# Test connection from their machine
psql "postgresql://doresdblogin:password@doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com:5432/doresdine"
```

Or start the backend:
```bash
cd backend
npm run dev
```

## Alternative: Allow All IPs (NOT RECOMMENDED for Production)

If you want to allow connections from anywhere (less secure):

1. In the security group inbound rules
2. Add rule:
   - **Type**: PostgreSQL
   - **Port**: 5432
   - **Source**: `0.0.0.0/0` (allows all IPs)
   - **Description**: "Allow all - development only"

⚠️ **Warning**: This is less secure. Only use for development/testing.

## Alternative: Use VPN or Bastion Host

If you can't modify security groups, consider:
- Setting up a VPN
- Using an AWS EC2 instance as a bastion host
- Using AWS Systems Manager Session Manager

## Quick Fix: Share Your IP Whitelist

If you already have access, you can share your current security group rules with your teammate so they know what format to use.

## Troubleshooting

### "Connection timeout"
- Check that the security group rule was saved
- Verify the IP address is correct
- Make sure port 5432 is open

### "Password authentication failed"
- This is a different issue - check database credentials in `.env`

### "SSL required"
- Make sure `DATABASE_URL` includes SSL parameters or backend uses SSL for RDS connections

## For Multiple Teammates

You can add multiple IP addresses:
- Add each teammate's IP as a separate rule
- Or use a CIDR block if they're on the same network (e.g., `192.168.1.0/24`)

## Finding Your RDS Instance Details

If you need to find your RDS endpoint:
```bash
# In backend/.env, look for:
DATABASE_URL=postgresql://user:pass@doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com:5432/doresdine
```

The hostname is: `doresdine-db.c78uu0gy0jpq.us-east-2.rds.amazonaws.com`
The region is: `us-east-2`

