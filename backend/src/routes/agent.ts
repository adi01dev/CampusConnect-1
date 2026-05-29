import express, { Request, Response } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth";

const router = express.Router();

router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: "message is required" });
    }

    const payload = {
      message,
      user: {
        id: req.user.id,
        role: req.user.role,
        email: req.user.email,
        name: req.user.name,
        department: req.user.department || "",
        subjects: req.user.subjects || [],
      },
    };

    console.log("Proxying request to Python NLU Agent on port 8000...");
    
    // Call the Python FastAPI microservice on port 8000
    const agentRes = await fetch("http://localhost:8000/api/agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!agentRes.ok) {
      const errText = await agentRes.text();
      console.error("FastAPI error:", errText);
      return res.status(502).json({ message: "AI Agent backend returned an error" });
    }

    const data = await agentRes.json();
    return res.json(data);
  } catch (err: any) {
    console.error("Agent proxy error:", err.message);
    return res.status(500).json({ message: "Failed to communicate with AI Agent" });
  }
});

export default router;
