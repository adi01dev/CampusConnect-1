import express, { Response } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth";
import ChatLog, { IChatMessage } from "../models/ChatLog";
import { processChatbotMessage, ChatUserContext } from "../services/geminiService";

const router = express.Router();

/**
 * @route   POST /api/chatbot/message
 * @desc    Send a message to the AI Chatbot, save logs to MongoDB, and get Gemini reply
 * @access  Private
 */
router.post("/message", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "message is required and must be a string" });
    }

    const userId = req.user.id;
    const userRole = req.user.role;

    const userContext: ChatUserContext = {
      id: userId,
      role: userRole,
      name: req.user.name || "User",
      email: req.user.email || "",
      department: req.user.department,
      semester: req.user.semester,
      subjects: req.user.subjects,
    };

    // 1. Process message via service (Gemini with Fallback NLU)
    const chatResult = await processChatbotMessage(message, userContext);

    // 2. Prepare database structures
    const userMsg: IChatMessage = {
      sender: "user",
      text: message,
      timestamp: new Date()
    };

    const assistantMsg: IChatMessage = {
      sender: "assistant",
      text: chatResult.reply,
      timestamp: new Date(),
      intent: chatResult.intent,
      redirectUrl: chatResult.redirectUrl,
      actionLabel: chatResult.actionLabel
    };

    // 3. Store chat log session in MongoDB
    let session = await ChatLog.findOne({ userId });

    if (!session) {
      session = new ChatLog({
        userId,
        role: userRole,
        messages: [userMsg, assistantMsg]
      });
    } else {
      session.messages.push(userMsg, assistantMsg);
      
      // Limit history size to prevent document exceeding MongoDB limit (max 50 messages)
      if (session.messages.length > 50) {
        session.messages = session.messages.slice(session.messages.length - 50);
      }
      
      session.updatedAt = new Date();
    }

    await session.save();

    // 4. Return both assistant message structure and session details
    return res.status(200).json(assistantMsg);
  } catch (err: any) {
    console.error("Chatbot router message error:", err.message);
    return res.status(500).json({ message: "Failed to process chat message", error: err.message });
  }
});

/**
 * @route   GET /api/chatbot/history
 * @desc    Retrieve chat logs history for the logged-in user
 * @access  Private
 */
router.get("/history", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const session = await ChatLog.findOne({ userId });

    if (!session) {
      return res.status(200).json([]);
    }

    return res.status(200).json(session.messages);
  } catch (err: any) {
    console.error("Chatbot router history error:", err.message);
    return res.status(500).json({ message: "Failed to retrieve chat history" });
  }
});

/**
 * @route   DELETE /api/chatbot/history
 * @desc    Clear chat logs history for the logged-in user
 * @access  Private
 */
router.delete("/history", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const session = await ChatLog.findOne({ userId });

    if (session) {
      session.messages = [];
      session.updatedAt = new Date();
      await session.save();
    }

    return res.status(200).json({ message: "Chat history cleared successfully" });
  } catch (err: any) {
    console.error("Chatbot router clear error:", err.message);
    return res.status(500).json({ message: "Failed to clear chat history" });
  }
});

export default router;
