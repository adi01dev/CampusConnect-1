import express, { Response } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth";
import { requireRole } from "../middlewares/requireRole";
import { rateLimiter } from "../middlewares/rateLimiter";
import AttendanceSession from "../models/AttendanceSession";
import AttendanceRecord from "../models/AttendanceRecord";
import { logAuditEvent } from "../utils/auditLogger";
import crypto from "crypto";

const router = express.Router();

/**
 * @route   POST /api/student/attendance/mark
 * @desc    Student scans QR to mark attendance (with strict proxy, replay, clock, and payload validations)
 * @access  Private (Student only)
 */
router.post("/mark", authenticate, requireRole("Student"), rateLimiter(100, 15 * 60 * 1000), async (req: AuthRequest, res: Response) => {
  const authUserId = req.user.id;
  try {
    const { sessionId, qrPayload, scanDelay, studentId: bodyStudentId } = req.body;

    // 1. Verify Request Parameters
    if (!sessionId || !qrPayload || scanDelay === undefined) {
      return res.status(400).json({ message: "Missing required attendance parameters" });
    }

    // 2. Validate Malformed Payloads
    // Expected formats:
    // 3-part: nonce:timestamp:signature
    // 4-part: sessionId:nonce:timestamp:signature
    const parts = qrPayload.split(":");
    let nonce = "";
    let timestampStr = "";
    let signature = "";

    if (parts.length === 4) {
      nonce = parts[1];
      timestampStr = parts[2];
      signature = parts[3];
    } else if (parts.length === 3) {
      nonce = parts[0];
      timestampStr = parts[1];
      signature = parts[2];
    } else {
      await logAuditEvent(authUserId, "SECURITY_MALFORMED_QR", `Malformed QR scan payload structure: ${qrPayload}`);
      return res.status(400).json({ message: "Invalid or malformed QR code structure" });
    }

    const timestamp = parseInt(timestampStr);
    if (isNaN(timestamp) || timestamp <= 0) {
      await logAuditEvent(authUserId, "SECURITY_MALFORMED_QR", `Malformed QR timestamp value: ${timestampStr}`);
      return res.status(400).json({ message: "Invalid QR code timestamp structure" });
    }

    // 3. Proxy Scan Attempt Detection
    // Checks if the target student ID matches the authenticated user ID
    const studentId = bodyStudentId || authUserId;
    if (studentId !== authUserId) {
      await logAuditEvent(
        authUserId,
        "ATTENDANCE_PROXY_ATTEMPT",
        `User attempted proxy scan. Authed user ${authUserId} tried to submit attendance for student ${studentId}.`
      );
      return res.status(403).json({ message: "Security Warning: Proxy attendance marking is strictly prohibited." });
    }

    // 4. Session Validation
    const session = await AttendanceSession.findById(sessionId);
    if (!session || !session.active) {
      return res.status(400).json({ message: "Invalid, expired, or inactive attendance session" });
    }

    // 5. HMAC Signature Validation
    const expectedSig = crypto
      .createHmac("sha256", session.secret)
      .update(`${nonce}:${timestamp}`)
      .digest("hex");

    if (signature !== expectedSig) {
      await logAuditEvent(
        authUserId,
        "ATTENDANCE_SIGNATURE_MISMATCH",
        `Scanned QR signature mismatch for session ${sessionId}. Got: ${signature}, Expected: ${expectedSig}`
      );
      return res.status(400).json({ message: "Security Error: QR code digital signature mismatch." });
    }

    // 6. Replay Attack Detection (Unique Nonce Verification)
    const existingNonceRecord = await AttendanceRecord.findOne({ qrId: nonce });
    if (existingNonceRecord) {
      await logAuditEvent(
        authUserId,
        "ATTENDANCE_REPLAY_ATTACK",
        `Replay attack intercepted. Nonce ${nonce} has already been registered in the database.`
      );
      return res.status(400).json({ message: "Security Error: QR code has already been scanned. Replay attempt rejected." });
    }

    // 7. Time Window & Delay Validation
    const GRACE_WINDOW = 3000; // 3 seconds
    const QR_LIFETIME = 15000; // 15 seconds
    const scanTime = Date.now();

    // Reject physically impossible scan delays
    if (scanDelay < -5000 || scanDelay > 45000) {
      await logAuditEvent(
        authUserId,
        "ATTENDANCE_DELAY_VIOLATION",
        `Attendance scan delay violation: ${scanDelay}ms. Standard scanning window exceeded.`
      );
      return res.status(400).json({ message: "Security Error: Attendance scanning delay mismatch. Please scan live code." });
    }

    const reconstructedScanTime = timestamp + scanDelay;
    const expiryTime = timestamp + QR_LIFETIME + GRACE_WINDOW;

    // Strict validation: Reconstructed scan time must occur before code expiry
    if (reconstructedScanTime > expiryTime) {
      await logAuditEvent(
        authUserId,
        "ATTENDANCE_TIME_EXPIRED",
        `Scanned QR code was expired. Scan time: ${reconstructedScanTime}, Expiry: ${expiryTime}`
      );
      return res.status(400).json({ message: "Security Error: QR Code expired at the time of scan. Please scan the current code." });
    }

    // 8. Save Attendance Record
    const record = await AttendanceRecord.create({
      session: session._id,
      student: studentId,
      course: session.course,
      scanDelay,
      qrId: nonce,
      verificationStatus: "verified"
    });

    // 9. Log Audit Success
    await logAuditEvent(
      authUserId,
      "ATTENDANCE_MARKED",
      `Successfully verified student attendance for course: ${session.course} (Session: ${sessionId})`
    );

    return res.status(200).json({ message: "Attendance verified and marked successfully", record });
  } catch (err: any) {
    console.error("Attendance mark error:", err.message);
    
    if (err.code === 11000) {
      await logAuditEvent(authUserId, "ATTENDANCE_DUPLICATE", `Attempted duplicate attendance marking.`);
      return res.status(400).json({ message: "Attendance already logged for this session" });
    }

    return res.status(500).json({ message: "Failed to process attendance validation", error: err.message });
  }
});

export default router;
