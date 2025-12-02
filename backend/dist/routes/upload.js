"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// Initialize S3 client if credentials are provided
const s3Client = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? new client_s3_1.S3Client({
        region: process.env.AWS_REGION || "us-east-2",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    })
    : null;
const S3_BUCKET = process.env.S3_BUCKET_NAME || "";
// Log S3 configuration status
if (!s3Client || !S3_BUCKET) {
    console.warn("⚠️  S3 is NOT configured - using local storage (files will be lost on server restart)");
    if (!process.env.AWS_ACCESS_KEY_ID) {
        console.warn("   Missing: AWS_ACCESS_KEY_ID");
    }
    if (!process.env.AWS_SECRET_ACCESS_KEY) {
        console.warn("   Missing: AWS_SECRET_ACCESS_KEY");
    }
    if (!S3_BUCKET) {
        console.warn("   Missing: S3_BUCKET_NAME");
    }
    console.warn("   See backend/SETUP_S3.md for instructions");
}
else {
    console.log("✅ S3 is configured - files will be stored in:", S3_BUCKET);
}
// Configure multer for memory storage (we'll upload to S3 or local disk)
const storage = multer_1.default.memoryStorage();
// Configure multer with file size limits (50MB max)
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB in bytes
    },
});
// POST /upload/photo - upload a single photo
router.post("/photo", async (req, res) => {
    upload.single("photo")(req, res, async (err) => {
        if (err) {
            console.error("Upload error:", err);
            if (err && err.code && err.code.startsWith('LIMIT_')) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({ error: "File too large" });
                }
                return res.status(400).json({ error: `Upload error: ${err.message}` });
            }
            return res.status(500).json({ error: "Internal server error during upload" });
        }
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        try {
            // If S3 is configured, upload to S3
            if (s3Client && S3_BUCKET) {
                console.log("📤 Uploading to S3...");
                const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
                const fileExtension = path_1.default.extname(file.originalname || ".jpg");
                const s3Key = `uploads/${unique}${fileExtension}`;
                // Determine content type - support all image types
                const mimeTypeMap = {
                    ".jpg": "image/jpeg",
                    ".jpeg": "image/jpeg",
                    ".png": "image/png",
                    ".gif": "image/gif",
                    ".webp": "image/webp",
                    ".bmp": "image/bmp",
                    ".heic": "image/heic",
                    ".heif": "image/heif",
                    ".svg": "image/svg+xml",
                    ".ico": "image/x-icon",
                    ".tiff": "image/tiff",
                    ".tif": "image/tiff",
                };
                const contentType = file.mimetype ||
                    mimeTypeMap[fileExtension.toLowerCase()] ||
                    "application/octet-stream";
                // Upload to S3
                // Note: ACL "public-read" is deprecated and may not work if bucket has ACLs disabled
                // Instead, configure bucket policy to allow public reads
                // Remove ACL and rely on bucket policy for public access
                const command = new client_s3_1.PutObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: s3Key,
                    Body: file.buffer,
                    ContentType: contentType,
                    // ACL removed - use bucket policy for public access instead
                    // If you need public access, configure bucket policy:
                    // {
                    //   "Effect": "Allow",
                    //   "Principal": "*",
                    //   "Action": "s3:GetObject",
                    //   "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/uploads/*"
                    // }
                });
                await s3Client.send(command);
                // Return S3 URL as storage_key
                // Use virtual-hosted-style URL format (standard)
                // If bucket name contains dots, use path-style URL instead
                const region = process.env.AWS_REGION || "us-east-2";
                let s3Url;
                // Encode the S3 key to handle special characters properly
                // But preserve slashes for path structure
                const encodedKey = encodeURIComponent(s3Key).replace(/%2F/g, '/');
                if (S3_BUCKET.includes('.') || S3_BUCKET.length > 63) {
                    // Path-style URL for buckets with dots or very long names
                    s3Url = `https://s3.${region}.amazonaws.com/${S3_BUCKET}/${encodedKey}`;
                }
                else {
                    // Virtual-hosted-style URL (standard) - most common
                    s3Url = `https://${S3_BUCKET}.s3.${region}.amazonaws.com/${encodedKey}`;
                }
                console.log("✅ File uploaded to S3 successfully");
                console.log("   URL:", s3Url);
                console.log("   Key:", s3Key);
                console.log("   Bucket:", S3_BUCKET);
                console.log("   Region:", region);
                console.log("   ContentType:", contentType);
                res.json({ storage_key: s3Url });
            }
            else {
                // Fallback to local storage if S3 not configured
                console.warn("⚠️  Uploading to LOCAL STORAGE (files will be lost on server restart/scale)");
                console.warn("   Configure S3 by setting AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET_NAME environment variables");
                const uploadDir = path_1.default.join(__dirname, "../../uploads");
                if (!fs_1.default.existsSync(uploadDir)) {
                    fs_1.default.mkdirSync(uploadDir, { recursive: true });
                }
                const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
                const filename = unique + path_1.default.extname(file.originalname || ".jpg");
                const filePath = path_1.default.join(uploadDir, filename);
                // Write file to disk
                fs_1.default.writeFileSync(filePath, file.buffer);
                // Return relative path
                const projectRoot = path_1.default.join(__dirname, "../..");
                const storage_key = path_1.default.relative(projectRoot, filePath).replace(/\\/g, "/");
                console.log("⚠️  File uploaded to LOCAL storage:", storage_key);
                console.warn("   WARNING: This file will be LOST when the server restarts or scales!");
                res.json({ storage_key });
            }
        }
        catch (error) {
            console.error("Error processing upload:", error);
            res.status(500).json({ error: "Internal server error processing file" });
        }
    });
});
exports.default = router;
