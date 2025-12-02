"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
const client_ses_1 = require("@aws-sdk/client-ses");
const nodemailer_1 = __importDefault(require("nodemailer"));
// AWS SES configuration
const sesClient = new client_ses_1.SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        }
        : undefined, // Will use IAM role if not provided
});
const FROM_EMAIL = process.env.SES_FROM_EMAIL || process.env.SMTP_FROM || "noreply@doresdine.app";
/**
 * Send verification email using AWS SES
 */
async function sendVerificationEmail(email, code) {
    // Check if AWS SES is configured
    const useSES = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_REGION;
    if (useSES) {
        try {
            // Use AWS SES
            const command = new client_ses_1.SendEmailCommand({
                Source: FROM_EMAIL,
                Destination: {
                    ToAddresses: [email],
                },
                Message: {
                    Subject: {
                        Data: "DoresDine Email Verification Code",
                        Charset: "UTF-8",
                    },
                    Body: {
                        Html: {
                            Data: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #D4A574;">DoresDine Email Verification</h2>
                  <p>Your verification code is:</p>
                  <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <h1 style="color: #D4A574; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold;">${code}</h1>
                  </div>
                  <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
                  <p style="color: #666; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
                </div>
              `,
                            Charset: "UTF-8",
                        },
                        Text: {
                            Data: `Your DoresDine verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
                            Charset: "UTF-8",
                        },
                    },
                },
            });
            await sesClient.send(command);
            console.log(`✅ Verification email sent via AWS SES to ${email}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to send email via AWS SES to ${email}:`, error.message);
            // Fall back to console logging
            console.log(`📧 Verification code for ${email}: ${code}`);
            return false;
        }
    }
    // Fallback to SMTP if configured
    const smtpHost = process.env.SMTP_HOST;
    if (smtpHost) {
        try {
            const transporter = nodemailer_1.default.createTransport({
                host: smtpHost,
                port: Number(process.env.SMTP_PORT || 587),
                secure: process.env.SMTP_SECURE === "true",
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            await transporter.sendMail({
                from: FROM_EMAIL,
                to: email,
                subject: "DoresDine Email Verification Code",
                text: `Your verification code is: ${code}`,
                html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>DoresDine Email Verification</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #007AFF; font-size: 32px; letter-spacing: 4px;">${code}</h1>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this code, you can safely ignore this email.</p>
          </div>
        `,
            });
            console.log(`✅ Verification email sent via SMTP to ${email}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to send email via SMTP to ${email}:`, error.message);
            console.log(`📧 Verification code for ${email}: ${code}`);
            return false;
        }
    }
    // No email service configured - log to console for development
    console.log(`📧 Verification code for ${email}: ${code}`);
    console.log(`   (No email service configured - code logged to console)`);
    return false;
}
