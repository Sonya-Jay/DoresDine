"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_1 = require("express");
const nodemailer_1 = __importDefault(require("nodemailer"));
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
async function sendVerificationEmail(email, code) {
    // If SMTP env provided, try to send; otherwise log to console for dev
    const host = process.env.SMTP_HOST;
    if (!host) {
        console.log(`📧 Verification code for ${email}: ${code}`);
        console.log(`   (SMTP not configured - code logged to console)`);
        return false; // Email not sent
    }
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === "true", // true for 465
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        await transporter.sendMail({
            from: process.env.SMTP_FROM || `no-reply@doresdine.local`,
            to: email,
            subject: "DoresDine email verification code",
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
        console.log(`✅ Verification email sent to ${email}`);
        return true; // Email sent successfully
    }
    catch (error) {
        console.error(`❌ Failed to send email to ${email}:`, error.message);
        // Log code to console as fallback
        console.log(`📧 Verification code for ${email}: ${code}`);
        return false; // Email not sent
    }
}
// POST /auth/register
router.post("/register", async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Validate email is vanderbilt.edu
        const emailLower = email.trim().toLowerCase();
        if (!emailLower.endsWith('@vanderbilt.edu')) {
            return res.status(400).json({ error: "Only Vanderbilt email addresses (@vanderbilt.edu) are allowed" });
        }
        if (typeof password !== "string" || password.length < 6) {
            return res
                .status(400)
                .json({ error: "password must be a string of at least 6 characters" });
        }
        const password_hash = await bcrypt_1.default.hash(password, 10);
        const verification_code = generateVerificationCode();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        // Generate a username from email (before @) if not provided
        const username = email.trim().toLowerCase().split('@')[0];
        const result = await db_1.default.query(`INSERT INTO users (id, username, first_name, last_name, email, password_hash, verification_code, verification_code_expires)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, first_name, last_name, email_verified`, [(0, uuid_1.v4)(), username, first_name.trim(), last_name.trim(), email.trim().toLowerCase(), password_hash, verification_code, expires]);
        // Send verification email (or log)
        const emailSent = await sendVerificationEmail(email.trim().toLowerCase(), verification_code);
        const user = result.rows[0];
        // If SMTP is not configured, return the code in development mode
        // This allows testing without email setup
        const response = {
            message: "User created, verify your email",
            user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name }
        };
        // Only return code if SMTP is not configured (development mode)
        if (!process.env.SMTP_HOST) {
            response.verification_code = verification_code;
            response.message = "User created. Check console for verification code (SMTP not configured)";
        }
        return res.status(201).json(response);
    }
    catch (err) {
        console.error("Error in register:", err);
        if (err.code === "23505") {
            // unique violation
            return res.status(409).json({ error: "email already exists" });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
});
// POST /auth/resend
router.post("/resend", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ error: "email required" });
        const code = generateVerificationCode();
        const expires = new Date(Date.now() + 15 * 60 * 1000);
        const result = await db_1.default.query(`UPDATE users SET verification_code = $1, verification_code_expires = $2 WHERE email = $3 RETURNING id, email`, [code, expires, email.trim().toLowerCase()]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: "User not found" });
        const emailSent = await sendVerificationEmail(email.trim().toLowerCase(), code);
        const response = { message: "Verification code sent" };
        // If SMTP is not configured, return the code in development mode
        if (!process.env.SMTP_HOST) {
            response.verification_code = code;
            response.message = "Verification code sent. Check console for code (SMTP not configured)";
        }
        return res.json(response);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
// POST /auth/verify
router.post("/verify", async (req, res) => {
    try {
        const { email, code } = req.body;
        // Validate required fields with specific error messages
        if (!email && !code) {
            return res.status(400).json({ error: "Email and verification code are required" });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ error: "Email is required" });
        }
        if (!code || !code.trim()) {
            return res.status(400).json({ error: "Verification code is required" });
        }
        // Validate code format (6 digits)
        if (!/^\d{6}$/.test(code.trim())) {
            return res.status(400).json({ error: "Verification code must be 6 digits" });
        }
        const result = await db_1.default.query(`SELECT id, verification_code, verification_code_expires FROM users WHERE email = $1 LIMIT 1`, [email.trim().toLowerCase()]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const user = result.rows[0];
        if (!user.verification_code || !user.verification_code_expires) {
            return res.status(400).json({ error: "No verification code set for this user. Please request a new code." });
        }
        const now = new Date();
        if (now > new Date(user.verification_code_expires)) {
            return res.status(400).json({ error: "Verification code has expired. Please request a new code." });
        }
        if (code.trim() !== user.verification_code) {
            return res.status(400).json({ error: "Invalid verification code. Please check and try again." });
        }
        // mark verified and clear code
        await db_1.default.query(`UPDATE users SET email_verified = true, verification_code = NULL, verification_code_expires = NULL WHERE id = $1`, [user.id]);
        const token = (0, auth_1.signToken)(user.id);
        return res.json({ message: "Email verified", token });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
// POST /auth/login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate required fields with specific error messages
        if (!email && !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ error: "Email is required" });
        }
        if (!password || !password.trim()) {
            return res.status(400).json({ error: "Password is required" });
        }
        // Validate email format
        const emailLower = email.trim().toLowerCase();
        if (!emailLower.endsWith('@vanderbilt.edu')) {
            return res.status(400).json({ error: "Only Vanderbilt email addresses (@vanderbilt.edu) are allowed" });
        }
        // Validate email username part
        const emailUsername = emailLower.split('@')[0];
        if (!emailUsername || emailUsername.length === 0) {
            return res.status(400).json({ error: "Please enter your email username" });
        }
        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }
        const result = await db_1.default.query(`SELECT id, password_hash, email_verified FROM users WHERE email = $1 LIMIT 1`, [emailLower]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const user = result.rows[0];
        if (!user.password_hash) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const ok = await bcrypt_1.default.compare(password, user.password_hash);
        if (!ok) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        if (!user.email_verified) {
            return res.status(403).json({ error: "Email not verified. Please verify your email before logging in." });
        }
        const token = (0, auth_1.signToken)(user.id);
        return res.json({ token });
    }
    catch (err) {
        console.error("Error in login:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
