import express, { Request, Response } from "express";
import Query from "../models/Query";
const router = express.Router();

// create query
router.post("/", async (req: Request, res: Response) => {
  try {
    const q = await Query.create(req.body);
    res.status(201).json(q);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// faculty fetch
router.get("/faculty/:facultyId", async (req: Request, res: Response) => {
  try {
    const queries = await Query.find({ facultyId: req.params.facultyId }).sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// student fetch
router.get("/student/:studentId", async (req: Request, res: Response) => {
  try {
    const queries = await Query.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// reply
router.put("/:id/reply", async (req: Request, res: Response) => {
  try {
    const { replyText, from } = req.body;
    const q = await Query.findById(req.params.id);
    if (!q) return res.status(404).json({ message: "Not found" });
    q.replies.push({ from, message: replyText, timestamp: new Date().toISOString() });
    q.replyText = replyText;
    q.status = "resolved";
    q.repliedAt = new Date();
    await q.save();
    res.json(q);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
