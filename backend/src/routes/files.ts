import express, { Request, Response } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth";
import { logAuditEvent } from "../utils/auditLogger";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";

const router = express.Router();
const FILE_SECRET = process.env.FILE_SIGN_SECRET || "secure_campusconnect_file_signing_secret";

/**
 * @route   POST /api/files/signed-url
 * @desc    Generate a 10-minute temporary signed JWT token for secure file download access
 * @access  Private (Authenticated users only)
 */
router.post("/signed-url", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { filePath } = req.body;
    if (!filePath || typeof filePath !== "string") {
      return res.status(400).json({ message: "filePath is required and must be a string" });
    }

    // Sanity check: prevent directory traversal attacks (ensure file stays inside uploads/)
    const absolutePath = path.resolve(process.cwd(), filePath.replace(/^\/+/, ""));
    const uploadsBase = path.resolve(process.cwd(), "uploads");

    if (!absolutePath.startsWith(uploadsBase)) {
      await logAuditEvent(
        req.user.id,
        "SECURITY_TRAVERSAL_ALERT",
        `User attempted directory traversal via file signing: ${filePath}`
      );
      return res.status(403).json({ message: "Access Denied: Invalid file path parameters" });
    }

    if (!fs.existsSync(absolutePath)) {
      return res.status(444).json({ message: "File does not exist on server disk" });
    }

    // Sign a temporary token valid for 10 minutes
    const token = jwt.sign(
      {
        filePath,
        userId: req.user.id
      },
      FILE_SECRET,
      { expiresIn: "10m" }
    );

    // Return the secure, fully formatted downloadable URL
    const signedUrl = `/api/files/download?token=${token}`;
    return res.status(200).json({ signedUrl });

  } catch (err: any) {
    console.error("Signed URL creation failure:", err.message);
    return res.status(500).json({ message: "Failed to generate temporary signed download token" });
  }
});

/**
 * @route   GET /api/files/download
 * @desc    Serve files securely using signed tokens (no direct file access allowed)
 * @access  Public (Requires valid token)
 */
router.get("/download", async (req: Request, res: Response) => {
  let decoded: any;
  const token = req.query.token as string;

  if (!token) {
    return res.status(401).json({ message: "Access Denied: Missing file access token" });
  }

  try {
    // 1. Verify Signed Token Integrity and Expiry
    decoded = jwt.verify(token, FILE_SECRET);
  } catch (err: any) {
    return res.status(403).json({ message: "Access Denied: File access token has expired or is invalid" });
  }

  try {
    const { filePath, userId } = decoded;

    // 2. Prevent Directory Traversal
    const absolutePath = path.resolve(process.cwd(), filePath.replace(/^\/+/, ""));
    const uploadsBase = path.resolve(process.cwd(), "uploads");

    if (!absolutePath.startsWith(uploadsBase) || !fs.existsSync(absolutePath)) {
      await logAuditEvent(
        userId,
        "SECURITY_ALERT_FILE",
        `Invalid download path attempt: ${filePath}`
      );
      return res.status(403).json({ message: "Access Denied: Invalid file path" });
    }

    // 3. Log Audit Download Event
    await logAuditEvent(
      userId,
      "FILE_DOWNLOADED",
      `Securely downloaded file: ${filePath} using signed PWA token`
    );

    // 4. Send File Stream
    return res.sendFile(absolutePath);

  } catch (err: any) {
    console.error("Secure download failure:", err.message);
    return res.status(500).json({ message: "Server error during file transmission" });
  }
});

export default router;
