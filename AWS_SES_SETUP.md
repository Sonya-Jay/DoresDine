# AWS SES Email Setup Guide

This guide will help you set up AWS SES (Simple Email Service) to send verification emails for DoresDine.

## Step 1: Set Up AWS SES

### 1.1 Create AWS Account (if you don't have one)
- Go to https://aws.amazon.com
- Sign up for a free account (12 months free tier)

### 1.2 Navigate to SES
- Go to AWS Console
- Search for "SES" or "Simple Email Service"
- Click on "SES"

### 1.3 Verify Your Email Address (Sandbox Mode)

**Important**: AWS SES starts in "sandbox mode" which means you can only send emails to verified addresses.

1. Click **"Verified identities"** in the left sidebar
2. Click **"Create identity"**
3. Select **"Email address"**
4. Enter your email (e.g., `noreply@yourdomain.com` or your personal email for testing)
5. Click **"Create identity"**
6. Check your email and click the verification link

### 1.4 Request Production Access (Optional but Recommended)

To send emails to any address (not just verified ones):

1. In SES, go to **"Account dashboard"**
2. Click **"Request production access"**
3. Fill out the form:
   - **Mail Type**: Transactional
   - **Website URL**: Your app URL
   - **Use case description**: "Sending email verification codes for user authentication in DoresDine mobile app"
   - **Expected sending volume**: Start with a low number (e.g., 1000/month)
4. Submit the request
5. Usually approved within 24 hours

## Step 2: Create IAM User for SES

### 2.1 Create IAM User
1. Go to **IAM** in AWS Console
2. Click **"Users"** > **"Create user"**
3. Enter username: `doresdine-ses-user`
4. Click **"Next"**

### 2.2 Attach SES Policy
1. Select **"Attach policies directly"**
2. Search for **"AmazonSESFullAccess"** or create a custom policy with:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```
3. Click **"Next"** > **"Create user"**

### 2.3 Create Access Keys
1. Click on the user you just created
2. Go to **"Security credentials"** tab
3. Click **"Create access key"**
4. Select **"Application running outside AWS"**
5. Click **"Next"** > **"Create access key"**
6. **IMPORTANT**: Copy both:
   - **Access key ID**
   - **Secret access key** (you won't see it again!)

## Step 3: Configure Backend Environment Variables

Add these to your `backend/.env` file:

```bash
# AWS SES Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id-here
AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
SES_FROM_EMAIL=noreply@yourdomain.com
```

**Notes**:
- `AWS_REGION`: Use the region where you set up SES (e.g., `us-east-1`, `us-west-2`)
- `AWS_ACCESS_KEY_ID`: The access key from Step 2.3
- `AWS_SECRET_ACCESS_KEY`: The secret key from Step 2.3
- `SES_FROM_EMAIL`: The verified email address from Step 1.3

## Step 4: Test Email Sending

### 4.1 Start Backend
```bash
cd backend
npm run dev
```

### 4.2 Test Registration
Try registering a new user with your email address. You should receive a verification code email.

### 4.3 Check Logs
If email fails, check backend logs for error messages.

## Troubleshooting

### "Email address is not verified"
- **Problem**: You're trying to send to an unverified email (sandbox mode)
- **Solution**: Verify the recipient email in SES, or request production access

### "Access Denied"
- **Problem**: IAM user doesn't have SES permissions
- **Solution**: Check IAM user has `ses:SendEmail` permission

### "Invalid credentials"
- **Problem**: Wrong AWS access keys
- **Solution**: Double-check `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `.env`

### "Region mismatch"
- **Problem**: SES is set up in different region than `AWS_REGION`
- **Solution**: Check which region your SES identity is in, update `AWS_REGION` accordingly

## Cost

- **Free Tier**: 62,000 emails/month for free (if using EC2)
- **After Free Tier**: $0.10 per 1,000 emails
- **Very affordable** for a small app!

## Security Best Practices

1. **Never commit `.env` file** to git
2. **Rotate access keys** periodically
3. **Use IAM roles** instead of access keys if running on EC2 (more secure)
4. **Limit IAM permissions** to only what's needed (SES send permissions only)

## Alternative: Use SMTP (if you prefer)

If you don't want to use AWS SES, you can use SMTP instead. The backend supports both:

```bash
# In backend/.env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
```

The backend will automatically use SMTP if `AWS_ACCESS_KEY_ID` is not set.

