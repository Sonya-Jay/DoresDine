# Setting Up Email Verification

## Problem
Verification codes are currently only logged to console because SMTP is not configured.

## Solution: Configure SMTP

You need to set up email sending. Here are your options:

### Option 1: AWS SES (Recommended for AWS deployment)

1. **Go to AWS SES Console**
   - https://console.aws.amazon.com/ses/
   - Make sure you're in `us-east-2` region

2. **Verify Your Email Domain or Email Address**
   - Click "Verified identities" → "Create identity"
   - Choose "Domain" (for vanderbilt.edu) or "Email address"
   - For domain: Add DNS records to verify ownership
   - For email: Click verification link sent to email

3. **Get SMTP Credentials**
   - Go to "SMTP settings" in SES
   - Click "Create SMTP credentials"
   - Save the username and password

4. **Set Environment Variables in Elastic Beanstalk**
   - Go to Elastic Beanstalk → Your environment → Configuration
   - Software → Environment properties
   - Add:
     - `SMTP_HOST` = `email-smtp.us-east-2.amazonaws.com` (or your SES endpoint)
     - `SMTP_PORT` = `587`
     - `SMTP_SECURE` = `false`
     - `SMTP_USER` = (your SES SMTP username)
     - `SMTP_PASS` = (your SES SMTP password)
     - `SMTP_FROM` = `noreply@vanderbilt.edu` (or your verified email)

### Option 2: Gmail SMTP (For Testing)

1. **Enable App Password in Gmail**
   - Go to Google Account → Security
   - Enable 2-Step Verification
   - Generate App Password for "Mail"

2. **Set Environment Variables**
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_SECURE` = `false`
   - `SMTP_USER` = `your-email@gmail.com`
   - `SMTP_PASS` = (your app password)
   - `SMTP_FROM` = `your-email@gmail.com`

### Option 3: SendGrid (Easy Setup)

1. **Sign up for SendGrid** (free tier available)
2. **Create API Key**
3. **Set Environment Variables**
   - `SMTP_HOST` = `smtp.sendgrid.net`
   - `SMTP_PORT` = `587`
   - `SMTP_SECURE` = `false`
   - `SMTP_USER` = `apikey`
   - `SMTP_PASS` = (your SendGrid API key)
   - `SMTP_FROM` = `noreply@yourdomain.com`

## After Setting Up

1. **Redeploy Backend** (environment variables are picked up on restart)
2. **Test Registration** - Code should be sent to email
3. **Check Spam Folder** - First emails might go to spam

## Quick Test

After setting up, test with:
```bash
curl -X POST "http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","email":"your-email@vanderbilt.edu","password":"test123"}'
```

Check your email for the verification code!

