import express, { Request, Response } from "express";
import User from "../models/User";

const router = express.Router();

// Create or upsert user (for dev/testing)
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.json(existing);

    const user = await User.create({ name, email, role });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

// List users
router.get("/", async (_req: Request, res: Response) => {
  const users = await User.find();
  res.json(users);
});

export default router;
