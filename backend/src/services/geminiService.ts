import { GEMINI_API_KEY } from "../config";

export interface ChatUserContext {
  id: string;
  role: "Student" | "Faculty" | "Admin";
  name: string;
  email: string;
  department?: string;
  semester?: string;
  subjects?: string[];
}

export interface ChatResponse {
  reply: string;
  intent?: string;
  redirectUrl?: string;
  actionLabel?: string;
}

/**
 * Local Rule-based fallback matcher for core academic intents
 */
export function getLocalFallbackResponse(message: string, user: ChatUserContext): ChatResponse {
  const query = message.toLowerCase();

  // Intent: Show assignments
  if (query.includes("assignment") || query.includes("homework") || query.includes("task") || query.includes("project")) {
    if (user.role === "Student") {
      return {
        reply: `Hello ${user.name}. You can view, download, and submit your pending coursework and class assignments in the Student Coursework section.`,
        intent: "Show assignments",
        redirectUrl: "/student/assignments",
        actionLabel: "Go to Assignments"
      };
    } else {
      return {
        reply: `Hello Professor ${user.name}. You can create, grade, and manage your students' coursework and assignments in the Coursework Management module.`,
        intent: "Show assignments",
        redirectUrl: "/assignments",
        actionLabel: "Manage Assignments"
      };
    }
  }

  // Intent: How to mark attendance?
  if (query.includes("attendance") || query.includes("present") || query.includes("roll call")) {
    if (user.role === "Student") {
      return {
        reply: "To mark your attendance, open the QR Attendance module to scan the dynamic secure code shown by your class teacher.",
        intent: "How to mark attendance?",
        redirectUrl: "/qr-attendance",
        actionLabel: "Scan Attendance QR"
      };
    } else if (user.role === "Faculty") {
      return {
        reply: "To take attendance, navigate to the QR Attendance module where you can launch a dynamic QR code session for your students to scan.",
        intent: "How to mark attendance?",
        redirectUrl: "/qr-attendance",
        actionLabel: "Generate Attendance QR"
      };
    } else {
      return {
        reply: "The ERP provides real-time QR attendance verification logs and tracking parameters in the Attendance Dashboard.",
        intent: "How to mark attendance?",
        redirectUrl: "/qr-attendance",
        actionLabel: "View QR Attendance"
      };
    }
  }

  // Intent: Show today's schedule
  if (query.includes("schedule") || query.includes("timetable") || query.includes("routine") || query.includes("today's class") || query.includes("classes")) {
    if (user.role === "Student") {
      return {
        reply: "Your lecture and laboratory timetable schedules are displayed in the Class Schedule tab.",
        intent: "Show today's schedule",
        redirectUrl: "/class-schedule",
        actionLabel: "View Class Schedule"
      };
    } else {
      return {
        reply: "You can view your allocated hours, teaching slots, and assigned lecture halls in the Faculty Timetable module.",
        intent: "Show today's schedule",
        redirectUrl: "/faculty-schedule",
        actionLabel: "View Teaching Schedule"
      };
    }
  }

  // Intent: How to upload notes?
  if (query.includes("note") || query.includes("upload") || query.includes("material") || query.includes("lecture note") || query.includes("study note")) {
    if (user.role === "Student") {
      return {
        reply: "You can check, download, and study all materials and reference notes shared by your professors in the My Courses section.",
        intent: "How to upload notes?",
        redirectUrl: "/my-courses",
        actionLabel: "View Course Notes"
      };
    } else if (user.role === "Faculty") {
      return {
        reply: "To upload lecture outlines, reference slides, or syllabus files, go to the Upload Materials section.",
        intent: "How to upload notes?",
        redirectUrl: "/upload-materials",
        actionLabel: "Upload Study Materials"
      };
    } else {
      return {
        reply: "The syllabus material depository can be monitored in the files section.",
        intent: "How to upload notes?",
        redirectUrl: "/file-storage",
        actionLabel: "View File Locker"
      };
    }
  }

  // General Fallback
  const dashboardPath = user.role === "Student"
    ? "/dashboard/student"
    : user.role === "Faculty"
    ? "/dashboard/faculty"
    : "/dashboard/admin";

  return {
    reply: `Welcome to CampusConnect Support, ${user.name}. I am your ERP virtual assistant. I can help you find assignments, manage schedules, mark attendance, or upload notes. How can I assist you today?`,
    redirectUrl: dashboardPath,
    actionLabel: "Go to Dashboard"
  };
}

/**
 * Process a message with the Google Gemini API (or fallback if key is missing/invalid)
 */
export async function processChatbotMessage(message: string, user: ChatUserContext): Promise<ChatResponse> {
  if (!GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not defined. Falling back to local rule-based intent matcher.");
    return getLocalFallbackResponse(message, user);
  }

  try {
    const systemPrompt = `You are CampusConnect, a premium, intelligent AI Copilot for our university ERP system.
You are chatting with a user. Their profile details are:
- Name: ${user.name}
- Email: ${user.email}
- Role: ${user.role}
- Department: ${user.department || 'General'}
${user.role === 'Student' ? `- Semester: ${user.semester || 'N/A'}` : ''}
${user.role === 'Faculty' ? `- Subjects: ${user.subjects?.join(', ') || 'N/A'}` : ''}

Tailor your responses specifically to their role:
- Students: Focus on viewing assignments, scanning QR to mark attendance, viewing schedules, downloading notes, grades.
- Faculty: Focus on managing or creating assignments, generating attendance QR codes, uploading study materials, checking lecture schedules.
- Admins: Focus on user records, system management, system logs, analytics.

Here are the target pages and modules available in the ERP that you can redirect users to. If the user wants to perform an action or view a page, suggest the absolute route in the "redirectUrl" field and a suitable 2-4 word text for the button in "actionLabel":
- Student Dashboard: "/dashboard/student"
- Faculty Dashboard: "/dashboard/faculty"
- Admin Dashboard: "/dashboard/admin"
- Assignments (Student - to view/submit): "/student/assignments"
- Assignments (Faculty/Admin - to create/manage): "/assignments"
- Attendance Generator/Scanner: "/qr-attendance"
- Student Attendance History: "/my-attendance"
- Class Schedule (Student): "/class-schedule"
- Faculty Schedule (Faculty): "/faculty-schedule"
- Upload Notes/Materials (Faculty): "/upload-materials"
- Subject Assignments (Faculty): "/subject-assignment"
- Manage Users (Admin): "/manage-users"
- MoU Requests (All): "/mou-requests"
- User Profile: "/profile"
- ERP Settings: "/settings"
- Financial Reports: "/financial-reports"
- Help & Support: "/help"

Intents you MUST support and classify when requested:
- "Show assignments"
- "How to mark attendance?" (Faculty generates QR, Student scans QR)
- "Show today's schedule"
- "How to upload notes?" (Faculty uploads, Student views "My Courses" or "/my-courses")

You must respond in a valid JSON object with the following schema:
{
  "reply": "string (your markdown-formatted answer to the user. Be concise, polite, helpful, and highly professional. Do not use exclamation marks. If recommending a navigation link, write it as standard text here and set the fields below)",
  "intent": "string (optional - set to one of the basic intents if it matches, e.g., 'Show assignments', 'How to mark attendance?', 'Show today\\'s schedule', 'How to upload notes?')",
  "redirectUrl": "string (optional - suggest one of the absolute routes above to redirect the user to that module)",
  "actionLabel": "string (optional - 2-4 words for the action button, e.g., 'Go to Assignments', 'Open QR Attendance')"
}
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `System context:\n${systemPrompt}\n\nUser request: "${message}"` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    console.log("Sending prompt to Google Gemini 1.5 Flash API...");
    const apiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error(`Gemini API error status ${apiRes.status}:`, errText);
      throw new Error(`Gemini API returned status ${apiRes.status}`);
    }

    const data = await apiRes.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!candidateText) {
      console.warn("No text candidate returned from Gemini. Falling back locally.");
      return getLocalFallbackResponse(message, user);
    }

    try {
      const parsed = JSON.parse(candidateText.trim()) as ChatResponse;
      if (parsed.reply) {
        return {
          reply: parsed.reply,
          intent: parsed.intent || undefined,
          redirectUrl: parsed.redirectUrl || undefined,
          actionLabel: parsed.actionLabel || undefined
        };
      }
    } catch (parseErr: any) {
      console.warn("Failed to parse Gemini response as JSON. Content:", candidateText);
      // Fallback: use response text directly as reply
      return {
        reply: candidateText,
        ...getLocalFallbackFields(message, user)
      };
    }

    return getLocalFallbackResponse(message, user);
  } catch (err: any) {
    console.error("Failed to query Gemini API:", err.message);
    return getLocalFallbackResponse(message, user);
  }
}

/**
 * Secondary helper to fetch local fallback parameters when Gemini output isn't structured JSON
 */
function getLocalFallbackFields(message: string, user: ChatUserContext) {
  const query = message.toLowerCase();
  if (query.includes("assignment") || query.includes("homework") || query.includes("task") || query.includes("project")) {
    return {
      intent: "Show assignments",
      redirectUrl: user.role === "Student" ? "/student/assignments" : "/assignments",
      actionLabel: user.role === "Student" ? "Go to Assignments" : "Manage Assignments"
    };
  }
  if (query.includes("attendance") || query.includes("present") || query.includes("roll call")) {
    return {
      intent: "How to mark attendance?",
      redirectUrl: "/qr-attendance",
      actionLabel: user.role === "Student" ? "Scan Attendance QR" : "Generate Attendance QR"
    };
  }
  if (query.includes("schedule") || query.includes("timetable") || query.includes("routine") || query.includes("today's class") || query.includes("classes")) {
    return {
      intent: "Show today's schedule",
      redirectUrl: user.role === "Student" ? "/class-schedule" : "/faculty-schedule",
      actionLabel: user.role === "Student" ? "View Class Schedule" : "View Teaching Schedule"
    };
  }
  if (query.includes("note") || query.includes("upload") || query.includes("material") || query.includes("lecture note") || query.includes("study note")) {
    return {
      intent: "How to upload notes?",
      redirectUrl: user.role === "Faculty" ? "/upload-materials" : "/my-courses",
      actionLabel: user.role === "Faculty" ? "Upload Study Materials" : "View Course Notes"
    };
  }
  return {};
}
