import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Assignment from "../models/Assignment";
import { authenticate, AuthRequest } from "../middlewares/auth";
import { requireRole } from "../middlewares/requireRole";
import User from "../models/User";

const router = express.Router();

// Create uploads directory
const uploadDir = path.join(process.cwd(), "uploads", "assignments");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// 🎯 Faculty: Create Assignment
router.post("/", authenticate, requireRole("Faculty"), async (req: AuthRequest, res: Response) => {
  try {
    const { title, subject, dueDate, totalMarks, instructions } = req.body;
    const { id: facultyId, department } = req.user;

    // 1. Basic Validation
    if (!title || !subject || !dueDate || !totalMarks) {
      return res.status(400).json({ message: "Please provide all required fields (Title, Subject, Due Date, Total Marks)." });
    }

    if (!department) {
      return res.status(400).json({ message: "Your profile is missing a Department. Please contact Admin or update your profile." });
    }

    // 2. Data Type Validation
    const parsedMarks = Number(totalMarks);
    if (isNaN(parsedMarks)) {
      return res.status(400).json({ message: "Total marks must be a valid number." });
    }

    const newAssignment = await Assignment.create({
      title,
      subject,
      department,
      faculty: facultyId,
      dueDate,
      totalMarks: parsedMarks,
      instructions,
    });
    res.status(201).json(newAssignment);
  } catch (error: any) {
    console.error("Error creating assignment:", error); // Log the actual error
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Validation Error", error: error.message });
    }
    res.status(500).json({ message: "Failed to create assignment", error: error.message || error });
  }
});

// 📋 Get Assignments (Context-Aware)
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { role, id, department } = req.user;

    let filter: any = {};

    if (role === "Student") {
      filter.department = { $regex: new RegExp(`^${department}$`, "i") };
    } else if (role === "Faculty") {
      filter.faculty = id;
    }

    const assignments = await Assignment.find(filter)
      .populate("faculty", "name")
      .sort({ createdAt: -1 })
      .lean(); // Use lean for better performance and modification

    if (role === "Student") {
      // Sanctify and transform for student
      const studentAssignments = assignments.map((assignment: any) => {
        // Find *this* student's submission
        const mySubmission = assignment.submissions?.find(
          (s: any) => s.studentId.toString() === id
        );

        let status = "pending";
        if (mySubmission) {
          status = "submitted";
          // Check if graded (assuming future feature where submission has grade, 
          // currently assignment marks are global, but usually grade is on submission)
          // For now, let's assume if there's a huge logic change we'd see it, but based on current model:
          // The current model puts 'submissions' as a sub-document. 
          // We likely need to store the grade ON the submission.
          // IF the updated model (not seen yet? or I missed it) supports it.
          // Let's assume standard behavior: if mySubmission has a 'grade' field (check model again if needed, assuming implicit flexibility or future add).
          // Actually, let's check the Assignment model I read earlier..
          // The Assignment model I read had: submissions: [{ ... }] with NO grade field in ISubmission?
          // Wait, I need to check the model again.
          // Re-reading Step 123 output: ISubmission has studentName, studentId, submissionText, linkUrl, fileUrl, submittedAt. NO GRADE.
          // Realistically, we need to add 'grade' and 'feedback' to ISubmission in the schema.
        } else if (new Date(assignment.dueDate) < new Date()) {
          status = "overdue";
        }

        // Return sanitized object
        return {
          ...assignment,
          submissions: undefined, // Hide all submissions
          status,
          submittedOn: mySubmission ? mySubmission.submittedAt : null,
          mySubmission: mySubmission,
          grade: mySubmission?.grade || null,
          feedback: mySubmission?.feedback || null
        };
      });
      return res.json(studentAssignments);
    }

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assignments", error });
  }
});

// 🔍 Student: Get Sync Data (Faculty Maps)
// Returns list of faculty + subjects for the student's department
router.get("/sync-map", authenticate, requireRole("Student"), async (req: AuthRequest, res: Response) => {
  try {
    const { department } = req.user;
    const facultyMembers = await User.find({
      role: "Faculty",
      department
    }).select("name subjects email");

    res.json(facultyMembers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sync map", error });
  }
});

// 📘 Get Single Assignment
router.get("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate("faculty", "name");
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assignment", error });
  }
});

// 🧑‍🎓 Student: Submit Assignment
router.post("/:id/submit", authenticate, requireRole("Student"), upload.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    const { submissionText, linkUrl } = req.body;
    const { id: studentId, name: studentName } = req.user;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const fileUrl = req.file ? `/uploads/assignments/${req.file.filename}` : undefined;

    // Check if already submitted? (Optional, skipping for now to allow re-uploads)

    assignment.submissions.push({
      studentName,
      studentId,
      fileUrl,
      submissionText,
      linkUrl,
      submittedAt: new Date(),
    });

    await assignment.save();
    res.status(201).json({ message: "Submission successful", assignment });
  } catch (error) {
    res.status(500).json({ message: "Error submitting assignment", error });
  }
});

// 🧾 Faculty: Get Submissions
router.get("/:id/submissions", authenticate, requireRole("Faculty"), async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    // Security: Only owner faculty can view
    if (assignment?.faculty.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized access to these submissions" });
    }

    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    res.json(assignment.submissions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching submissions", error });
  }
});

// 🗑️ Faculty: Delete Assignment
router.delete("/:id", authenticate, requireRole("Faculty"), async (req: AuthRequest, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    // Ensure ownership
    if (assignment.faculty.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this assignment" });
    }

    await assignment.deleteOne();
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting assignment", error });
  }
});

// 🎓 Faculty: Grade Submission
router.post("/:id/submissions/:studentId/grade", authenticate, requireRole("Faculty"), async (req: AuthRequest, res: Response) => {
  try {
    const { grade, feedback } = req.body;
    const { id: assignmentId, studentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    // Ensure Faculty Ownership
    if (assignment.faculty.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to grade this assignment" });
    }

    // Find submission
    const submission = assignment.submissions.find((s: any) => s.studentId.toString() === studentId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found for this student" });
    }

    // Update grade
    submission.grade = Number(grade);
    submission.feedback = feedback || "";

    // Force Mongoose to detect change in subdocument array (if needed often happens)
    assignment.markModified('submissions');

    await assignment.save();

    res.json({ message: "Grade updated successfully", submission });
  } catch (error) {
    res.status(500).json({ message: "Error grading submission", error });
  }
});

// Robust Submission Download (GET)
router.get("/:id/submissions/:studentId/download", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id: assignmentId, studentId } = req.params;
    const { id: userId, role } = req.user;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    // Security check: Only faculty (owner) or the student themselves can download
    const isOwner = assignment.faculty.toString() === userId;
    const isStudent = studentId === userId;

    if (!isOwner && !isStudent && role !== "Admin") {
      return res.status(403).json({ message: "Unauthorized download access" });
    }

    const submission = assignment.submissions.find((s: any) => s.studentId.toString() === studentId);
    if (!submission || !submission.fileUrl) {
      return res.status(404).json({ message: "Submission file not found" });
    }

    // Use robust path joining relative to process.cwd()
    const relativePath = submission.fileUrl.startsWith('/') ? submission.fileUrl.substring(1) : submission.fileUrl;
    const filePath = path.join(process.cwd(), relativePath);

    if (!fs.existsSync(filePath)) {
      console.error("Submission file not found at path:", filePath);
      return res.status(404).json({ message: "File not found on server" });
    }

    const ext = path.extname(filePath);
    const sanitizedName = (submission.studentName || "Student").replace(/\s+/g, '_');
    const sanitizedTitle = (assignment.title || "Assignment").replace(/\s+/g, '_');
    const downloadName = `${sanitizedName}_${sanitizedTitle}${ext}`;

    res.download(filePath, downloadName, (err) => {
      if (err) {
        console.error("Error during assignment download:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error sending file" });
        }
      }
    });
  } catch (error) {
    console.error("Download route caught error:", error);
    res.status(500).json({ message: "Error downloading submission", error });
  }
});

export default router;
