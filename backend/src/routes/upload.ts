import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Configure multer for local disk storage (for demo; use S3 or similar in prod)
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => cb(null, uploadDir),
  filename: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
// Configure multer with file size limits (20MB max)
const upload = multer({ 
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB in bytes
  },
});

// POST /upload/photo - upload a single photo
router.post("/photo", (req: Request, res: Response) => {
  upload.single("photo")(req, res, (err: any) => {
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

    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Return a storage_key (relative path for now)
      // On AWS, file.path should be the full path to the uploaded file
      // We'll use a path relative to the project root
      const projectRoot = path.join(__dirname, "../..");
      const storage_key = path.relative(projectRoot, file.path).replace(/\\/g, "/");
      
      console.log("File uploaded successfully:", storage_key);
      res.json({ storage_key });
    } catch (error: any) {
      console.error("Error processing upload:", error);
      res.status(500).json({ error: "Internal server error processing file" });
    }
  });
});

export default router;
