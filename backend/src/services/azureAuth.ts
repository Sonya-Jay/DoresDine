import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { signToken } from "../middleware/auth";
import pool from "../db";
import { v4 as uuidv4 } from "uuid";

// Azure AD configuration
const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID || "";
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID || "";

// Microsoft's public key endpoint for token verification
const JWKS_URI = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/discovery/v2.0/keys`;

// Create JWKS client
const client = jwksClient({
  jwksUri: JWKS_URI,
  cache: true,
  cacheMaxAge: 86400000, // 24 hours
});

// Get signing key for token verification
function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
  });
}

// Verify Microsoft ID token and extract claims
export async function verifyMicrosoftToken(token: string): Promise<any> {
  if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID) {
    throw new Error("Azure AD configuration is missing. Please set AZURE_TENANT_ID and AZURE_CLIENT_ID");
  }

  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: AZURE_CLIENT_ID,
        issuer: [`https://login.microsoftonline.com/${AZURE_TENANT_ID}/v2.0`, `https://sts.windows.net/${AZURE_TENANT_ID}/`],
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) {
          console.error("Token verification error:", err);
          return reject(new Error(`Token verification failed: ${err.message}`));
        }
        resolve(decoded);
      }
    );
  });
}

// Check if token is from Vanderbilt tenant
export function isVanderbiltTenant(tokenClaims: any): boolean {
  const tid = tokenClaims.tid; // Tenant ID
  return tid === AZURE_TENANT_ID;
}

// Extract user info from Microsoft token
export interface MicrosoftUserInfo {
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  oid: string; // Microsoft object ID
}

export function extractUserInfo(tokenClaims: any): MicrosoftUserInfo {
  // Microsoft token claims structure
  const email = tokenClaims.email || tokenClaims.preferred_username || "";
  const name = tokenClaims.name || "";
  const givenName = tokenClaims.given_name || "";
  const familyName = tokenClaims.family_name || "";
  const oid = tokenClaims.oid || tokenClaims.sub || "";

  // Split name if full name is provided but first/last aren't
  let firstName = givenName;
  let lastName = familyName;
  if (!firstName && !lastName && name) {
    const nameParts = name.trim().split(" ");
    firstName = nameParts[0] || "";
    lastName = nameParts.slice(1).join(" ") || "";
  }

  return {
    email: email.toLowerCase(),
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    displayName: name || undefined,
    oid,
  };
}

// Create or update user from Microsoft account
export async function createOrUpdateUserFromMicrosoft(
  userInfo: MicrosoftUserInfo
): Promise<{ id: string; isNew: boolean }> {
  // Validate email is Vanderbilt
  if (!userInfo.email.endsWith("@vanderbilt.edu")) {
    throw new Error("Only Vanderbilt email addresses are allowed");
  }

  // Check if user exists by email
  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1 LIMIT 1",
    [userInfo.email]
  );

  if (existingUser.rows.length > 0) {
    // Update existing user
    const userId = existingUser.rows[0].id;
    await pool.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email_verified = true
       WHERE id = $3`,
      [userInfo.firstName, userInfo.lastName, userId]
    );
    return { id: userId, isNew: false };
  } else {
    // Create new user
    const userId = uuidv4();
    const username = userInfo.email.split("@")[0]; // Use email prefix as username

    await pool.query(
      `INSERT INTO users (id, username, email, first_name, last_name, email_verified)
       VALUES ($1, $2, $3, $4, $5, true)`,
      [
        userId,
        username,
        userInfo.email,
        userInfo.firstName || null,
        userInfo.lastName || null,
      ]
    );
    return { id: userId, isNew: true };
  }
}

// Main authentication function
export async function authenticateWithMicrosoft(
  microsoftToken: string
): Promise<{ token: string; user: any }> {
  // Verify Microsoft token
  const tokenClaims = await verifyMicrosoftToken(microsoftToken);

  // Check tenant
  if (!isVanderbiltTenant(tokenClaims)) {
    throw new Error("Access restricted to Vanderbilt University accounts only");
  }

  // Extract user info
  const userInfo = extractUserInfo(tokenClaims);

  // Create or update user
  const { id, isNew } = await createOrUpdateUserFromMicrosoft(userInfo);

  // Generate our own JWT token
  const token = signToken(id);

  // Get user from database
  const userResult = await pool.query(
    "SELECT id, username, email, first_name, last_name, email_verified FROM users WHERE id = $1",
    [id]
  );

  return {
    token,
    user: userResult.rows[0],
  };
}

