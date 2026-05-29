import express from "express";
import Query from "../models/Query";

const router = express.Router();

// 📩 Create new student query
router.post("/", async (req, res) => {
  try {
    const {
      studentId,
      facultyId,
      studentName,
      facultyName,
      course,
      category,
      queryText,
      urgent,
    } = req.body;

    const query = await Query.create({
      studentId,
      facultyId,
      studentName,
      facultyName,
      course,
      category,
      queryText,
      urgent,
    });

    res.status(201).json({ message: "Query submitted successfully", query });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// 📋 Faculty fetches all queries assigned to them
router.get("/faculty/:facultyId", async (req, res) => {
  try {
    const queries = await Query.find({ facultyId: req.params.facultyId }).sort({
      createdAt: -1,
    });
    res.json(queries);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// 📬 Faculty replies to a student query
router.put("/:id/reply", async (req, res) => {
  try {
    const { replyText, from } = req.body;
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ message: "Query not found" });

    query.replies.push({
      from,
      message: replyText,
      timestamp: new Date().toISOString(),
    });

    query.replyText = replyText;
    query.status = "resolved";
    query.repliedAt = new Date();
    await query.save();

    res.json({ message: "Reply sent successfully", query });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// 📘 Student fetches their queries
router.get("/student/:studentId", async (req, res) => {
  try {
    const queries = await Query.find({
      studentId: req.params.studentId,
    }).sort({ createdAt: -1 });
    res.json(queries);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
