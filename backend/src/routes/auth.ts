import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import pool from "../db";
import { signToken } from "../middleware/auth";

const router = Router();

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendVerificationEmail(email: string, code: string) {
  // If SMTP env provided, try to send; otherwise log to console for dev
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.log(`Verification code for ${email}: ${code}`);
    return;
  }

  const transporter = nodemailer.createTransport({
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
  });
}

// POST /auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, email, password } = req.body as {
      first_name: string;
      last_name: string;
      email: string;
      password: string;
    };

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

    const password_hash = await bcrypt.hash(password, 10);

    const verification_code = generateVerificationCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Generate a username from email (before @) if not provided
    const username = email.trim().toLowerCase().split('@')[0];
    
    const result = await pool.query(
      `INSERT INTO users (id, username, first_name, last_name, email, password_hash, verification_code, verification_code_expires)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, first_name, last_name, email_verified`,
      [uuidv4(), username, first_name.trim(), last_name.trim(), email.trim().toLowerCase(), password_hash, verification_code, expires]
    );

    // Send verification email (or log)
    await sendVerificationEmail(email.trim().toLowerCase(), verification_code);

    const user = result.rows[0];
    
    // Always send email - if SMTP not configured, log to console
    // Don't return code in response for security
    return res.status(201).json({ 
      message: "User created, verify your email", 
      user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name }
    });
  } catch (err: any) {
    console.error("Error in register:", err);
    if (err.code === "23505") {
      // unique violation
      return res.status(409).json({ error: "email already exists" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/resend
router.post("/resend", async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) return res.status(400).json({ error: "email required" });

    const code = generateVerificationCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    const result = await pool.query(
      `UPDATE users SET verification_code = $1, verification_code_expires = $2 WHERE email = $3 RETURNING id, email`,
      [code, expires, email.trim().toLowerCase()]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    await sendVerificationEmail(email.trim().toLowerCase(), code);
    return res.json({ message: "Verification code sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/verify
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body as { email: string; code: string };
    if (!email || !code) return res.status(400).json({ error: "email and code required" });

    const result = await pool.query(
      `SELECT id, verification_code, verification_code_expires FROM users WHERE email = $1 LIMIT 1`,
      [email.trim().toLowerCase()]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const user = result.rows[0];
    if (!user.verification_code || !user.verification_code_expires) {
      return res.status(400).json({ error: "No verification code set for this user" });
    }

    const now = new Date();
    if (now > new Date(user.verification_code_expires)) {
      return res.status(400).json({ error: "Verification code expired" });
    }

    if (code !== user.verification_code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // mark verified and clear code
    await pool.query(`UPDATE users SET email_verified = true, verification_code = NULL, verification_code_expires = NULL WHERE id = $1`, [user.id]);

    const token = signToken(user.id);
    return res.json({ message: "Email verified", token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const result = await pool.query(`SELECT id, password_hash, email_verified FROM users WHERE email = $1 LIMIT 1`, [email.trim().toLowerCase()]);
    if (result.rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    if (!user.password_hash) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    if (!user.email_verified) return res.status(403).json({ error: "Email not verified" });

    const token = signToken(user.id);
    return res.json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
