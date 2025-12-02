"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMicrosoftToken = verifyMicrosoftToken;
exports.isVanderbiltTenant = isVanderbiltTenant;
exports.extractUserInfo = extractUserInfo;
exports.createOrUpdateUserFromMicrosoft = createOrUpdateUserFromMicrosoft;
exports.authenticateWithMicrosoft = authenticateWithMicrosoft;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const auth_1 = require("../middleware/auth");
const db_1 = __importDefault(require("../db"));
const uuid_1 = require("uuid");
// Azure AD configuration
const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID || "";
const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID || "";
// Microsoft's public key endpoint for token verification
const JWKS_URI = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/discovery/v2.0/keys`;
// Create JWKS client
const client = (0, jwks_rsa_1.default)({
    jwksUri: JWKS_URI,
    cache: true,
    cacheMaxAge: 86400000, // 24 hours
});
// Get signing key for token verification
function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        const signingKey = key?.getPublicKey();
        callback(err, signingKey);
    });
}
// Verify Microsoft ID token and extract claims
async function verifyMicrosoftToken(token) {
    if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID) {
        throw new Error("Azure AD configuration is missing. Please set AZURE_TENANT_ID and AZURE_CLIENT_ID");
    }
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, getKey, {
            audience: AZURE_CLIENT_ID,
            issuer: [`https://login.microsoftonline.com/${AZURE_TENANT_ID}/v2.0`, `https://sts.windows.net/${AZURE_TENANT_ID}/`],
            algorithms: ["RS256"],
        }, (err, decoded) => {
            if (err) {
                console.error("Token verification error:", err);
                return reject(new Error(`Token verification failed: ${err.message}`));
            }
            resolve(decoded);
        });
    });
}
// Check if token is from Vanderbilt tenant
function isVanderbiltTenant(tokenClaims) {
    const tid = tokenClaims.tid; // Tenant ID
    return tid === AZURE_TENANT_ID;
}
function extractUserInfo(tokenClaims) {
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
async function createOrUpdateUserFromMicrosoft(userInfo) {
    // Validate email is Vanderbilt
    if (!userInfo.email.endsWith("@vanderbilt.edu")) {
        throw new Error("Only Vanderbilt email addresses are allowed");
    }
    // Check if user exists by email
    const existingUser = await db_1.default.query("SELECT id FROM users WHERE email = $1 LIMIT 1", [userInfo.email]);
    if (existingUser.rows.length > 0) {
        // Update existing user
        const userId = existingUser.rows[0].id;
        await db_1.default.query(`UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email_verified = true
       WHERE id = $3`, [userInfo.firstName, userInfo.lastName, userId]);
        return { id: userId, isNew: false };
    }
    else {
        // Create new user
        const userId = (0, uuid_1.v4)();
        const username = userInfo.email.split("@")[0]; // Use email prefix as username
        await db_1.default.query(`INSERT INTO users (id, username, email, first_name, last_name, email_verified)
       VALUES ($1, $2, $3, $4, $5, true)`, [
            userId,
            username,
            userInfo.email,
            userInfo.firstName || null,
            userInfo.lastName || null,
        ]);
        return { id: userId, isNew: true };
    }
}
// Main authentication function
async function authenticateWithMicrosoft(microsoftToken) {
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
    const token = (0, auth_1.signToken)(id);
    // Get user from database
    const userResult = await db_1.default.query("SELECT id, username, email, first_name, last_name, email_verified FROM users WHERE id = $1", [id]);
    return {
        token,
        user: userResult.rows[0],
    };
}
