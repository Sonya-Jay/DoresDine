"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_s3_1 = require("@aws-sdk/client-s3");
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
// Configure multer for memory storage (we'll upload to S3 or local disk)
const storage = multer_1.default.memoryStorage();
// Configure multer with file size limits (20MB max)
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB in bytes
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
                const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
                const fileExtension = path_1.default.extname(file.originalname || ".jpg");
                const s3Key = `uploads/${unique}${fileExtension}`;
                // Determine content type
                const contentType = file.mimetype ||
                    (fileExtension === ".jpg" || fileExtension === ".jpeg" ? "image/jpeg" :
                        fileExtension === ".png" ? "image/png" :
                            fileExtension === ".gif" ? "image/gif" : "application/octet-stream");
                // Upload to S3
                const command = new client_s3_1.PutObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: s3Key,
                    Body: file.buffer,
                    ContentType: contentType,
                    // Make files publicly readable
                    ACL: "public-read",
                });
                await s3Client.send(command);
                // Return S3 URL as storage_key
                const s3Url = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || "us-east-2"}.amazonaws.com/${s3Key}`;
                console.log("File uploaded to S3:", s3Url);
                res.json({ storage_key: s3Url });
            }
            else {
                // Fallback to local storage if S3 not configured
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
                console.log("File uploaded to local storage:", storage_key);
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
