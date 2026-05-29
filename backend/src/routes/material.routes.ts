import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import Material from "../models/Material";
import { createUploader } from "../middlewares/upload";
import { authenticate, AuthRequest } from "../middlewares/auth";

const router = express.Router();
const uploader = createUploader("materials");

// Post new material (Faculty only, but checking auth generally here)
router.post("/upload", authenticate, uploader.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    const { courseCode, title, description, subject, type } = req.body; // 'subject' from frontend maps to courseCode likely, or we store both

    if (!req.file) return res.status(400).json({ message: "File required" });

    const fileUrl = `/uploads/materials/${req.file.filename}`;
    const fileType = (req.file.mimetype || "").split("/")[1] || "file";
    const fileSize = req.file.size; // Get file size from multer

    // Use logged in user's name
    const uploadedBy = req.user?.name || "Unknown Faculty";

    const material = await Material.create({
      courseCode: subject || courseCode, // specific to frontend 'subject' field
      title,
      description,
      fileUrl,
      fileType: type || fileType, // Use selected type from frontend if available
      fileSize,
      uploadedBy,
      uploadedAt: new Date(),
      downloads: 0,
      views: 0
    });

    res.status(201).json(material);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: (err as Error).message });
  }
});

// Get statistics
router.get("/stats", authenticate, async (req: Request, res: Response) => {
  try {
    const totalMaterials = await Material.countDocuments();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = await Material.countDocuments({ uploadedAt: { $gte: oneWeekAgo } });

    const aggregation = await Material.aggregate([
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: "$downloads" },
          totalViews: { $sum: "$views" },
          storageUsed: { $sum: "$fileSize" }
        }
      }
    ]);

    const stats = aggregation[0] || { totalDownloads: 0, totalViews: 0, storageUsed: 0 };

    res.json({
      totalMaterials,
      thisWeek,
      totalDownloads: stats.totalDownloads,
      totalViews: stats.totalViews,
      storageUsed: stats.storageUsed
    });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// Increment view count
router.post("/:id/view", authenticate, async (req: Request, res: Response) => {
  try {
    await Material.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.status(200).json({ message: "View count incremented" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// Increment download count (POST) - Kept for tracking without redirection
router.post("/:id/download", authenticate, async (req: Request, res: Response) => {
  try {
    await Material.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } });
    res.status(200).json({ message: "Download count incremented" });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// Robust File Download (GET) - Serves the actual file
router.get("/:id/download", authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Atomically increment and get document
    const material = await Material.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!material) {
      console.error(`Material not found: ${id}`);
      return res.status(404).json({ message: "Material record not found in database" });
    }

    // 2. Resolve absolute path robustly
    const relativePath = material.fileUrl.startsWith('/') ? material.fileUrl.substring(1) : material.fileUrl;
    const filePath = path.resolve(process.cwd(), relativePath);

    console.log(`Download request for: ${material.title}`);
    console.log(`Resolved Path: ${filePath}`);

    // 3. Check physical file existence
    if (!fs.existsSync(filePath)) {
      console.error(`Physical file missing: ${filePath}`);
      return res.status(404).json({ message: "The requested file is missing from the server storage" });
    }

    // 4. Sanitize download name
    const ext = path.extname(filePath);
    const downloadName = `${material.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${ext}`;

    // 5. Stream download
    res.download(filePath, downloadName, (err) => {
      if (err) {
        console.error("Error streaming file:", err);
        // If headers weren't sent yet, we can send a 500. 
        // If they WERE sent, the connection is already broken and handled by Express.
        if (!res.headersSent) {
          res.status(500).json({ message: "Failed to initialize file transfer", error: err.message });
        }
      }
    });
  } catch (err: any) {
    console.error("Download route exception:", err);
    res.status(500).json({
      message: "Internal server error occurred while processing download",
      error: err.message
    });
  }
});

// Get recent materials (for "Recent Uploads" and Dashboard activity)
router.get("/recent", authenticate, async (req: Request, res: Response) => {
  try {
    // Limit to 5 or 10
    const materials = await Material.find().sort({ uploadedAt: -1 }).limit(10);
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// Get ALL materials (for Materials Library)
router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const materials = await Material.find().sort({ uploadedAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// Get materials for course
router.get("/:courseCode", authenticate, async (req: Request, res: Response) => {
  try {
    const materials = await Material.find({ courseCode: req.params.courseCode }).sort({ uploadedAt: -1 });
    res.json(materials);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
