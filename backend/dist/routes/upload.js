"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// Configure multer for local disk storage (for demo; use S3 or similar in prod)
const uploadDir = path_1.default.join(__dirname, "../../uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path_1.default.extname(file.originalname));
    },
});
// Configure multer with file size limits (20MB max)
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB in bytes
    },
});
// POST /upload/photo - upload a single photo
router.post("/photo", (req, res) => {
    upload.single("photo")(req, res, (err) => {
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
            // Return a storage_key (relative path for now)
            // On AWS, file.path should be the full path to the uploaded file
            // We'll use a path relative to the project root
            const projectRoot = path_1.default.join(__dirname, "../..");
            const storage_key = path_1.default.relative(projectRoot, file.path).replace(/\\/g, "/");
            console.log("File uploaded successfully:", storage_key);
            res.json({ storage_key });
        }
        catch (error) {
            console.error("Error processing upload:", error);
            res.status(500).json({ error: "Internal server error processing file" });
        }
    });
});
exports.default = router;
