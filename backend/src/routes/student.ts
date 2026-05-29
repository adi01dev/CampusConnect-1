import express from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth';
import AttendanceRecord from '../models/AttendanceRecord';
import AttendanceSession from '../models/AttendanceSession';
import LectureSchedule from '../models/LectureSchedule';
import Assignment from '../models/Assignment';

const router = express.Router();

// GET /api/student/attendance
// Returns attendance summary per course
router.get('/attendance', authenticate, async (req: AuthRequest, res) => {
    try {
        const studentId = req.user.id;

        // 1. Get all attendance records for this student
        const records = await AttendanceRecord.find({ student: studentId })
            .populate('session')
            .sort({ markedAt: -1 });

        // 2. Group attended sessions by course
        const attendanceMap: Record<string, number> = {};
        records.forEach(r => {
            attendanceMap[r.course] = (attendanceMap[r.course] || 0) + 1;
        });

        // 3. Get all attendance sessions in the database to calculate total sessions per course
        const sessions = await AttendanceSession.find();
        const sessionsMap: Record<string, number> = {};
        sessions.forEach(s => {
            sessionsMap[s.course] = (sessionsMap[s.course] || 0) + 1;
        });

        // Get all unique courses that have sessions or records
        const uniqueCourses = [...new Set([
            ...Object.keys(attendanceMap),
            ...Object.keys(sessionsMap)
        ])];

        const subjectAttendance = uniqueCourses.map(course => {
            const attended = attendanceMap[course] || 0;
            const total = sessionsMap[course] || 0;
            const percentage = total > 0 ? Math.round((attended / total) * 100) : 100;

            let status = 'average';
            if (percentage >= 90) status = 'excellent';
            else if (percentage >= 75) status = 'good';
            else status = 'warning';

            // Find last attended date
            const courseRecords = records.filter(r => r.course === course);
            const lastAttendedDate = courseRecords.length > 0 ? courseRecords[0].markedAt : null;

            return {
                subject: course,
                code: course.substring(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900),
                totalClasses: total,
                attendedClasses: attended,
                percentage,
                status,
                lastAttended: lastAttendedDate ? new Date(lastAttendedDate).toLocaleDateString('en-IN') : 'Never',
                requiredPercentage: 75
            };
        });

        const recentAttendance = records.slice(0, 5).map(r => ({
            date: new Date(r.markedAt).toLocaleDateString('en-IN'),
            subject: r.course,
            time: new Date(r.markedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            status: 'present'
        }));

        res.json({
            subjectAttendance,
            recentAttendance
        });
    } catch (err) {
        console.error("Attendance Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/student/courses
// Returns list of enrolled courses with metadata
router.get('/courses', authenticate, async (req: AuthRequest, res) => {
    try {
        const { department, semester } = req.user;

        // Find courses from schedule
        const distinctCourses = await LectureSchedule.find({ department, semester })
            .select('course facultyName room')
            .lean();

        // De-duplicate by course name
        const uniqueMap = new Map();
        distinctCourses.forEach((c: any) => {
            if (!uniqueMap.has(c.course)) {
                uniqueMap.set(c.course, c);
            }
        });

        const courses = Array.from(uniqueMap.values()).map((c: any, index) => ({
            id: index + 1,
            title: c.course,
            code: `CS${300 + index}`, // Mock code
            instructor: c.facultyName,
            semester: semester,
            progress: 70 + Math.floor(Math.random() * 30), // Mock progress
            grade: ['A', 'A+', 'B+', 'B'][Math.floor(Math.random() * 4)],
            status: 'active',
            nextClass: 'Check Schedule', // Could calculate real next class from schedule
            assignments: 2, // Could count from Assignment model
            materials: 10 + index,
            videos: 5 + index,
            description: `Comprehensive course on ${c.course}`,
            materialsLink: "#"
        }));

        res.json(courses);
    } catch (err) {
        console.error("Courses Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
