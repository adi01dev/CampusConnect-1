import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AppLayout from "./components/layout/AppLayout";
//import PrincipalDashboard from "./pages/dashboards/PrincipalDashboard";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import FacultyDashboard from "./pages/dashboards/FacultyDashboard";
//import HODDashboard from "./pages/dashboards/HODDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
//import AccountantDashboard from "./pages/dashboards/AccountantDashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import FeeManagement from "./pages/FeeManagement";
import PaymentHistory from "./pages/PaymentHistory";
import AIAssistant from "./pages/AIAssistant";
import InstituteSettings from "./pages/InstituteSettings";
import AcademicPerformance from "./pages/AcademicPerformance";
import AcademicCalendar from "./pages/AcademicCalendar";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
import ManageUsers from "./pages/ManageUsers";
import MyCourses from "./pages/MyCourses";
import SystemLogs from "./pages/SystemLogs";
import DepartmentStaff from "./pages/DepartmentStaff";
import SubjectAssignment from "./pages/SubjectAssignment";
import StudentManagement from "./pages/StudentManagement";
import UploadMaterials from "./pages/UploadMaterials";
import QRAttendance from "./pages/QRAttendance";
import AIPredictions from "./pages/AIPredictions";
import StudentQueries from "./pages/StudentQueries";
import ClassSchedule from "./pages/ClassSchedule";
import MyAttendance from "./pages/MyAttendance";
import FeePayment from "./pages/FeePayment";
import MoURequests from "./pages/MoURequests";
import AIRecommendations from "./pages/AIRecommendations";
import DocumentManagement from "./pages/DocumentManagement";
import FileStorage from "./pages/FileStorage";
//import DepartmentAnalytics from "./pages/DepartmentAnalytics";
import StudentAssignments from "./pages/StudentAssignments";
import UserRecords from "./pages/UserRecords";
import SystemManagement from "./pages/SystemManagement";
import AdminNotifications from "./pages/AdminNotifications";
import GenerateReceipts from "./pages/GenerateReceipts";
import FinancialReports from "./pages/FinancialReports";
import PaymentReminders from "./pages/PaymentReminders";
import Assignments from "./pages/Assignments";
import FacultySchedule from "./pages/FacultySchedule";
import AcademicGoals from "./pages/AcademicGoals";
import Help from "./pages/Help";
import ProtectedRoute from "./routes/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard/*" element={<AppLayout />}>
            <Route path="faculty" element={<FacultyDashboard />} />
            <Route path="student" element={<StudentDashboard />} />
            <Route path="admin" element={<AdminDashboard />}
            />
          </Route>

          <Route element={<AppLayout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/fee-management" element={<FeeManagement />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/system-logs" element={<SystemLogs />} />
            <Route path="/department-staff" element={<DepartmentStaff />} />
            <Route path="/subject-assignment" element={<SubjectAssignment />} />
            <Route path="/student-management" element={<StudentManagement />} />
            <Route path="/upload-materials" element={<UploadMaterials />} />
            <Route path="/qr-attendance" element={<QRAttendance />} />
            <Route path="/ai-predictions" element={<AIPredictions />} />
            <Route path="/student-queries" element={<StudentQueries />} />
            <Route path="/class-schedule" element={<ClassSchedule />} />
            <Route path="/my-attendance" element={<MyAttendance />} />
            <Route path="/fee-payment" element={<FeePayment />} />
            <Route path="/mou-requests" element={<MoURequests />} />
            <Route path="/ai-recommendations" element={<AIRecommendations />} />
            <Route path="/document-management" element={<DocumentManagement />} />
            <Route path="/file-storage" element={<FileStorage />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/institute-settings" element={<InstituteSettings />} />
            <Route path="/academic-performance" element={<AcademicPerformance />} />
            <Route path="/academic-calendar" element={<AcademicCalendar />} />
            <Route path="/academic-goals" element={<AcademicGoals />} />

            <Route path="/student/assignments" element={<StudentAssignments />} />
            <Route path="/user-records" element={<UserRecords />} />
            <Route path="/system-management" element={<SystemManagement />} />
            <Route path="/admin-notifications" element={<AdminNotifications />} />
            <Route path="/generate-receipts" element={<GenerateReceipts />} />
            <Route path="/financial-reports" element={<FinancialReports />} />
            <Route path="/payment-reminders" element={<PaymentReminders />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/faculty-schedule" element={<FacultySchedule />} />
            <Route path="/help" element={<Help />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
