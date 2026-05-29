import express from "express";
import { authenticate, AuthRequest } from "../middlewares/auth";
import { requireRole } from "../middlewares/requireRole";
import AttendanceSession from "../models/AttendanceSession";
import AttendanceRecord from "../models/AttendanceRecord";
import User from "../models/User";

import { generateQRToken } from "../utils/qrToken";

const router = express.Router();

// 🎯 Create attendance session (faculty)
router.post("/create-session", authenticate, requireRole("Faculty"), async (req: AuthRequest, res) => {
  console.log("xyz");
  try {
    // NOTE: your authenticate middleware must attach req.user
    const facultyId = req.user.id;
    if (!facultyId) return res.status(401).json({ message: "Unauthenticated" });

    const { course, sessionType, duration } = req.body;
    if (!course) return res.status(400).json({ message: "Course required" });

    const durationMinutes = parseInt(duration) || 5;
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    const secret = require("crypto").randomBytes(32).toString("hex");

    const session = await AttendanceSession.create({
      faculty: facultyId,
      course,
      sessionType: sessionType || "Lecture",
      qrToken: "DYNAMIC_CLIENT_SIDE", // Placeholder
      secret,
      expiresAt,
      active: true,
    });

    res.json({
      message: "QR session created",
      session: {
        id: session._id,
        course: session.course,
        sessionType: session.sessionType,
        secret: session.secret, // Send secret to client
        expiresAt: session.expiresAt,
      },
    });
  } catch (err: any) {
    console.error("create-session error:", err);
    res.status(500).json({ message: "Error creating session" });
  }
});

// 🧾 Get attendance records for a course
router.get("/records/:course", authenticate, requireRole("Faculty"), async (req, res) => {
  try {
    const { course } = req.params;
    const records = await AttendanceRecord.find({ course }).populate("student", "name email");
    res.json(records);
  } catch (err: any) {
    res.status(500).json({ message: "Error fetching records" });
  }
});

// 🔴 Get live scanning status for a specific attendance session (Faculty only)
router.get("/session/:sessionId/live", authenticate, requireRole("Faculty"), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await AttendanceSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Attendance session not found" });

    // 1. Fetch all records marked for this session
    const records = await AttendanceRecord.find({ session: sessionId }).populate("student", "name email rollNumber studentId");

    // 2. Fetch all student users
    const allStudents = await User.find({ role: "Student" }).select("name email rollNumber studentId").lean();

    const presentIds = new Set(records.map(r => r.student?._id?.toString()));

    const presentList = records.map(r => {
      const student: any = r.student;
      return {
        studentId: student?._id,
        student: student?.name || "Unknown Student",
        rollNo: student?.rollNumber || student?.studentId || "N/A",
        time: new Date(r.markedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        status: "present"
      };
    });

    const absentList = allStudents
      .filter(s => !presentIds.has(s._id.toString()))
      .map(s => ({
        studentId: s._id,
        student: s.name,
        rollNo: s.rollNumber || s.studentId || "N/A",
        status: "absent"
      }));

    res.json({
      present: presentList,
      absent: absentList
    });
  } catch (err: any) {
    console.error("live-session error:", err);
    res.status(500).json({ message: "Error fetching live session records" });
  }
});

export default router;
