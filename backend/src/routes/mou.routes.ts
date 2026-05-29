import express, { Request, Response } from "express";
import MoU from "../models/MoU";
const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const doc = await MoU.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await MoU.find().sort({ submittedDate: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

router.put("/:id/status", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const mou = await MoU.findById(req.params.id);
    if (!mou) return res.status(404).json({ message: "Not found" });
    mou.status = status;
    await mou.save();
    res.json(mou);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
