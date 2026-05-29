import express from "express";
import MoU from "../models/MoU";

const router = express.Router();

// ✅ POST /api/mou
router.post("/", async (req, res) => {
  try {
    const mou = await MoU.create(req.body);
    res.status(201).json(mou);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// ✅ GET /api/mou
router.get("/", async (req, res) => {
  try {
    const mous = await MoU.find().sort({ createdAt: -1 });
    res.json(mous);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
