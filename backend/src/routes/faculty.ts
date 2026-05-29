import express from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import { requireRole } from '../middlewares/requireRole';
import Class from '../models/Class';
import Query from '../models/Query';
import Performance from '../models/Performance';
import Assignment from '../models/Assignment';
import AttendanceSession from '../models/AttendanceSession';
import AttendanceRecord from '../models/AttendanceRecord';
import User from '../models/User';

const router = express.Router();

// 1. Get quick stats
router.get('/dashboard/quick-stats', authenticate, requireRole('Faculty'), async (req: AuthRequest, res) => {
  try {
    const facultyId = req.user.id;
    // fetch counts
    const coursesCount = await Class.countDocuments({ faculty: facultyId });
    const studentsTotal = await Class.aggregate([
      { $match: { faculty: facultyId } },
      { $group: { _id: null, total: { $sum: '$studentsCount' } } }
    ]);
    const queriesPending = await Query.countDocuments({ faculty: facultyId, status: 'pending' });
    const assignmentsPending = await Assignment.countDocuments({ faculty: facultyId, status: 'pending' });

    res.json({
      coursesTeaching: coursesCount,
      totalStudents: studentsTotal.length ? studentsTotal[0].total : 0,
      pendingQueries: queriesPending,
      assignmentsToReview: assignmentsPending
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Get today’s classes
router.get('/dashboard/todays-classes', authenticate, requireRole('Faculty'), async (req: AuthRequest, res) => {
  try {
    const facultyId = req.user.id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const classes = await Class.find({
      faculty: facultyId,
      scheduleDateTime: { $gte: startOfDay, $lte: endOfDay }
    }).select('time courseName room type studentsCount');
    res.json(classes);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Get student queries
router.get('/dashboard/queries', authenticate, requireRole('Faculty'), async (req: AuthRequest, res) => {
  try {
    const facultyId = req.user.id;
    const queries = await Query.find({ faculty: facultyId }).select('student question course time urgent status');
    res.json(queries);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Get class performance
router.get('/dashboard/performance', authenticate, requireRole('Faculty'), async (req: AuthRequest, res) => {
  try {
    const facultyId = req.user.id;
    const performance = await Performance.find({ faculty: facultyId }).select('course attendancePercentage avgScore assignmentsCount');
    res.json(performance);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Create attendance session (generate QR etc)
router.post('/attendance/session', authenticate, requireRole('Faculty'), async (req: AuthRequest, res) => {
  try {
    const { course } = req.body;
    const facultyId = req.user.id;
    const sessionId = Date.now().toString(); // or better generate uuid
    const session = await AttendanceSession.create({
      faculty: facultyId,
      course,
      qrCodeSessionId: sessionId,
      studentsMarked: []
    });
    res.json({ sessionId, session });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Get all students with their real-time attendance and assignment details (Faculty only)
router.get('/students', authenticate, requireRole('Faculty'), async (req: AuthRequest, res) => {
  try {
    // 1. Fetch all students
    const students = await User.find({ role: 'Student' }).select('-passwordHash -refreshToken').lean();

    // 2. Fetch all assignments
    const allAssignments = await Assignment.find().lean();

    // 3. Fetch all attendance sessions and records
    const allSessions = await AttendanceSession.find().lean();
    const allRecords = await AttendanceRecord.find().lean();

    // For each student, compute attendance and assignment stats
    const studentData = [];

    for (const student of students) {
      const studentIdStr = student._id.toString();

      // Attendance calculations
      // Filter records belonging to this student
      const studentRecords = allRecords.filter(r => r.student.toString() === studentIdStr);
      
      // Distinct courses from all sessions
      const courses = [...new Set(allSessions.map(s => s.course))];
      
      const subjectwise: Record<string, { attended: number; total: number; percentage: number }> = {};
      let totalAttended = 0;
      let totalSessions = 0;

      courses.forEach(course => {
        const courseSessions = allSessions.filter(s => s.course === course);
        const courseRecords = studentRecords.filter(r => r.course === course);

        const attended = courseRecords.length;
        const total = courseSessions.length;
        const percentage = total > 0 ? Math.round((attended / total) * 100) : 100;

        subjectwise[course] = {
          attended,
          total,
          percentage
        };

        totalAttended += attended;
        totalSessions += total;
      });

      const overallAttendance = totalSessions > 0 ? Math.round((totalAttended / totalSessions) * 100) : 100;

      // Assignment calculations
      const studentAssignments = [];
      let submittedCount = 0;
      let gradedCount = 0;

      for (const assignment of allAssignments) {
        const submission = assignment.submissions?.find((s: any) => s.studentId.toString() === studentIdStr);
        if (submission) {
          submittedCount++;
          if (submission.grade !== undefined && submission.grade !== null) {
            gradedCount++;
          }
          studentAssignments.push({
            assignmentId: assignment._id,
            title: assignment.title,
            subject: assignment.subject,
            submitted: true,
            submittedAt: submission.submittedAt,
            grade: submission.grade,
            feedback: submission.feedback,
            totalMarks: assignment.totalMarks
          });
        } else {
          studentAssignments.push({
            assignmentId: assignment._id,
            title: assignment.title,
            subject: assignment.subject,
            submitted: false,
            grade: null,
            feedback: null,
            totalMarks: assignment.totalMarks
          });
        }
      }

      studentData.push({
        _id: student._id,
        name: student.name,
        email: student.email,
        rollNo: student.rollNumber || student.studentId || `STU${studentIdStr.substring(20)}`,
        department: student.department || 'General',
        class: student.semester ? `Semester ${student.semester}` : 'N/A',
        semester: student.semester || 'N/A',
        phone: student.phone || 'N/A',
        address: student.address || 'N/A',
        status: 'active',
        fees: student.attendance ? 'Paid' : 'Pending', // Mimic fee status or default to Paid
        attendance: {
          overall: overallAttendance,
          totalAttended,
          totalSessions,
          subjectwise
        },
        assignments: {
          total: allAssignments.length,
          submitted: submittedCount,
          graded: gradedCount,
          list: studentAssignments
        }
      });
    }

    res.json(studentData);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
