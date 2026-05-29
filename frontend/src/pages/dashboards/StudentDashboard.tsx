import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QrReader from "react-qr-reader-es6"; // npm install react-qr-reader
import { useState, useEffect } from "react";
import { Progress } from '@/components/ui/progress';
import AIAssistant from '../AIAssistant';
import MoURequests from '../MoURequests';
import FeePayment from '../FeePayment';
import { Link } from 'react-router-dom';
import { saveOfflineAttendance, getOfflineAttendance } from "@/lib/offlineStore";

import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  CreditCard,
  Trophy,
  TrendingUp,
  User,
  MessageSquare,
  Brain,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  Target,
  Eye,
  Download
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const BACKEND_URL = API_BASE.replace('/api', '');

const StudentDashboard = () => {

  const [scanOpen, setScanOpen] = useState(false);
  const { toast } = useToast();
  const token = localStorage.getItem("accessToken");

  // Dynamic Data State
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [schedule, setSchedule] = useState<any[]>([]);
  const [assignmentData, setAssignments] = useState<any[]>([]); // Renamed to avoid collison if any
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]); // New state

  const handleView = async (id: string, url: string) => {
    try {
      if (!token) return;
      await fetch(`${API_BASE}/materials/${id}/view`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      setRecentMaterials(prev => prev.map(item =>
        item._id === id ? { ...item, views: (item.views || 0) + 1 } : item
      ));

      const cleanUrl = url.replace(/^\/+/, '');
      const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}/${cleanUrl}`;
      window.open(fullUrl, '_blank');
    } catch (err) {
      console.error("View error", err);
    }
  };

  const handleDownload = async (id: string, url: string, filename: string) => {
    try {
      if (!token) return;
      const downloadUrl = `${API_BASE}/materials/${id}/download`;

      const response = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      setRecentMaterials(prev => prev.map(item =>
        item._id === id ? { ...item, downloads: (item.downloads || 0) + 1 } : item
      ));

      toast({ title: "Success", description: "Download started" });
    } catch (err) {
      console.error("Download error", err);
      toast({ title: "Error", description: "Failed to download file", variant: "destructive" });
    }
  };


  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Parallel fetch
        const [userRes, statsRes, scheduleRes, assignRes, attendanceRes, materialsRes] = await Promise.all([
          fetch(`${API_BASE}/auth/me`, { headers }),
          fetch(`${API_BASE}/dashboard/stats`, { headers }),
          fetch(`${API_BASE}/dashboard/schedule`, { headers }),
          fetch(`${API_BASE}/assignments`, { headers }),
          fetch(`${API_BASE}/student/attendance`, { headers }),
          fetch(`${API_BASE}/materials/recent`, { headers }) // Fetch recent materials
        ]);

        if (userRes.ok) setUser(await userRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
        if (scheduleRes.ok) setSchedule(await scheduleRes.json());
        if (assignRes.ok) setAssignments(await assignRes.json());
        if (attendanceRes.ok) {
          const attJson = await attendanceRes.json();
          setAttendanceData(attJson.subjectAttendance || []);
        }
        if (materialsRes.ok) setRecentMaterials(await materialsRes.json());

      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    fetchDashboardData();
  }, [token]);

  // Derived Data for UI
  const quickStats = [
    { label: 'Overall Attendance', value: stats.overallAttendance || '0%', change: 'Current', icon: Calendar, color: 'text-blue-500' },
    { label: 'Pending Assignments', value: stats.assignmentsPending?.toString() || '0', change: 'Due Soon', icon: FileText, color: 'text-orange-500' },
    { label: 'Classes Today', value: stats.classesToday?.toString() || schedule.length.toString(), change: 'On Time', icon: Clock, color: 'text-green-500' },
    { label: 'Enrolled Courses', value: stats.enrolledCourses?.toString() || '0', change: 'Active', icon: BookOpen, color: 'text-purple-500' },
  ];

  const todaysSchedule = schedule.map((item: any) => ({
    time: `${item.startTime} - ${item.endTime}`,
    subject: item.course,
    room: item.room,
    type: item.type
  }));

  // Filter for pending assignments and map to UI format
  // Assuming assignments have a 'status' or we just show recent ones.
  // Ideally, backend filters this, but we'll map the raw list here.
  // Filter for pending assignments and map to UI format
  // Ideally, backend filters this, but we'll map the raw list here.
  const recentAssignments = assignmentData.slice(0, 3).map((a: any) => ({
    title: a.title,
    subject: a.subject,
    dueDate: new Date(a.dueDate).toLocaleDateString(),
    status: 'pending' // Default for now until submission status is tracked
  }));

  const [offlineScansCount, setOfflineScansCount] = useState(0);

  const refreshOfflineCount = async () => {
    try {
      const records = await getOfflineAttendance();
      setOfflineScansCount(records.length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshOfflineCount();
    const handleSync = () => {
      refreshOfflineCount();
    };
    window.addEventListener("pwa-sync-status", handleSync);
    window.addEventListener("pwa-data-synced", handleSync);
    return () => {
      window.removeEventListener("pwa-sync-status", handleSync);
      window.removeEventListener("pwa-data-synced", handleSync);
    };
  }, []);

  const handleScan = async (qrPayload: string | null) => {
    if (!qrPayload) return;

    // Check if result is already processed to avoid double scans
    setScanOpen(false);

    try {
      // 1. Parse Payload to validate format immediately
      const parts = qrPayload.split(":");
      if (parts.length !== 4) {
        throw new Error("Invalid QR Code format");
      }
      const [sessionId, nonce, timestampStr, signature] = parts;

      const scanTime = Date.now();
      const genTime = parseInt(timestampStr);
      const scanDelay = scanTime - genTime;

      const payloadData = {
        sessionId,
        qrPayload,
        scanDelay,
        timestamp: scanTime
      };

      // 2. Check Connection
      if (!navigator.onLine) {
        await saveOfflineAttendance({
          sessionId,
          qrPayload,
          scanDelay,
          timestamp: scanTime,
          token: token || ""
        });
        refreshOfflineCount();
        toast({ title: "Saved Offline", description: "Attendance saved locally. It will auto-sync when connection restores." });
        return;
      }

      // 3. Online: Send to Backend
      await submitAttendance(payloadData);

    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const submitAttendance = async (data: any) => {
    const res = await fetch(`${API_BASE}/student/attendance/mark`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const resData = await res.json();
    if (!res.ok) throw new Error(resData.message);
    toast({ title: "Attendance Marked", description: resData.message });
  };

  const syncOfflineAttendance = () => {
    // Dispatches an online event to trigger PWAController's sync
    window.dispatchEvent(new Event("online"));
  };

  const handleError = (err: any) => {
    console.log(err);
  };



  return (
    <div className="space-y-8 academic-pattern p-6 rounded-3xl animate-fade-in-up">
      {/* Welcome Section */}
      <div className="bg-gradient-premium rounded-3xl p-8 text-white shadow-elegant relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-secondary/20 rounded-full blur-2xl group-hover:bg-secondary/30 transition-all duration-700"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">Welcome Back, {user?.name || 'Student'}</h1>
            <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
              Continue your academic journey. You have <span className="font-bold text-white underline decoration-secondary decoration-2 underline-offset-4">{assignmentData.length || stats.assignmentsPending || 0} assignments</span> waiting for your attention.
            </p>
            <div className="flex flex-wrap items-center gap-6 mt-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <GraduationCap className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium">Computer Science Engineering</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <Target className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium">Semester 6</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20 shadow-glow min-w-[120px]">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-secondary animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Today</p>
              <p className="text-4xl font-black">{new Date().getDate()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="glass-effect border-0 shadow-card hover-lift hover-border overflow-hidden">
            <CardContent className="p-6 relative group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="w-16 h-16" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black mt-1 text-foreground">{stat.value}</p>
                    <span className="text-[10px] font-medium text-success">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-primary shadow-glow group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="xl:col-span-1">
          <Card className="glass-effect border-0 shadow-elegant overflow-hidden h-full">
            <CardHeader className="bg-gradient-elegant border-b border-border/10">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Clock className="w-5 h-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {todaysSchedule.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No classes today.</p>
                  </div>
                ) : todaysSchedule.map((item, index) => (
                  <div key={index} className="group relative flex items-center gap-4 p-4 rounded-2xl bg-gradient-card hover-lift hover-border transition-all duration-300">
                    <div className="flex flex-col items-center justify-center min-w-[70px] py-1 border-r border-border/50">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Starts</p>
                      <p className="text-sm font-black text-primary">{item.time.split(' - ')[0]}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">{item.subject}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 border-primary/20 bg-primary/5">{item.room}</Badge>
                        <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0">{item.type}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments & Attendance */}
        <div className="xl:col-span-2 space-y-6">
          {/* Recent Assignments */}
          <Card className="glass-effect border-0 shadow-elegant overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-elegant border-b border-border/10">
              <CardTitle className="flex items-center gap-2 text-primary">
                <FileText className="w-5 h-5" />
                Assignment Tracker
              </CardTitle>
              <Link to="/student/assignments">
                <Button variant="ghost" size="sm" className="hover:bg-primary hover:text-white transition-colors">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentAssignments.length === 0 ? (
                  <p className="text-muted-foreground p-4">No assignments tracked.</p>
                ) : recentAssignments.map((assignment, index) => (
                  <div key={index} className="group flex items-center justify-between p-4 bg-gradient-card rounded-2xl border border-border/20 hover-scale hover-glow transition-all duration-300">
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{assignment.title}</h4>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-black px-2 py-0 border-secondary/20 bg-secondary/10 text-secondary-foreground">{assignment.subject}</Badge>
                        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due {assignment.dueDate}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {assignment.status === 'completed' ? (
                        <div className="p-2 rounded-full bg-success/10 text-success shadow-sm">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-full bg-warning/10 text-warning shadow-sm animate-pulse">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Study Materials */}
          <Card className="glass-effect border-0 shadow-elegant overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-elegant border-b border-border/10">
              <CardTitle className="flex items-center gap-2 text-primary">
                <BookOpen className="w-5 h-5" />
                Study Resources
              </CardTitle>
              <Link to="/upload-materials">
                <Button variant="ghost" size="sm" className="hover:bg-primary hover:text-white transition-colors">
                  Browse All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentMaterials && recentMaterials.length === 0 ? <p className="text-muted-foreground p-4">Empty shelf.</p> : recentMaterials.slice(0, 3).map((material, index) => {
                  return (
                    <motion.div
                      key={index}
                      className="group relative bg-gradient-card rounded-2xl border border-border/20 hover-lift hover-glow transition-all duration-300 h-full p-5"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl w-fit group-hover:scale-110 transition-transform">
                          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex gap-2 relative z-20">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg bg-primary/5 hover:bg-primary hover:text-white transition-all shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(material._id, material.fileUrl);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg bg-secondary/5 hover:bg-secondary hover:text-white transition-all shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(material._id, material.fileUrl, material.title);
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-foreground mb-4 line-clamp-1 group-hover:text-primary transition-colors uppercase tracking-tight">{material.title}</h4>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/5">
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter px-1.5 py-0 border-blue-200 bg-blue-50 text-blue-700">{material.courseCode || 'Course'}</Badge>
                        <span className="text-[10px] text-muted-foreground font-medium">{new Date(material.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Overview */}
          <Card className="glass-effect border-0 shadow-elegant overflow-hidden">
            <CardHeader className="bg-gradient-elegant border-b border-border/10">
              <CardTitle className="flex items-center gap-2 text-primary">
                <TrendingUp className="w-5 h-5" />
                Attendance Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {attendanceData.map((item, index) => (
                  <div key={index} className="space-y-3 group">
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <span className="text-[13px] font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{item.subject}</span>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.attended} / {item.total} lectures</p>
                      </div>
                      <span className={`text-lg font-black ${item.percentage < 75 ? 'text-destructive' : item.percentage < 85 ? 'text-warning' : 'text-success'}`}>
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-muted/50 border border-border/5">
                        <div
                          style={{ width: `${item.percentage}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ease-out ${item.percentage < 75 ? 'bg-destructive' : item.percentage < 85 ? 'bg-gradient-secondary' : 'bg-gradient-primary'
                            }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <button
        onClick={() => setScanOpen(true)}
        className="group relative w-full rounded-3xl overflow-hidden hover-scale transition-all duration-500 shadow-elegant"
      >
        <div className="absolute inset-0 bg-gradient-premium opacity-100 transition-opacity"></div>
        <div className="absolute top-0 left-0 w-full h-full academic-pattern opacity-10"></div>

        <CardContent className="relative p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-white/20 backdrop-blur-2xl p-6 rounded-full mb-8 border border-white/40 animate-pulse-glow shadow-glow-white">
            <QrCode className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter drop-shadow-2xl">Mark Attendance Now</h3>
          <p className="text-white/90 font-semibold mb-8 max-w-md mx-auto text-lg drop-shadow-md">
            Scan the faculty's QR code securely to log your presence in real-time.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 w-full">
            <div className="px-12 h-16 flex items-center justify-center bg-white text-primary font-black rounded-2xl shadow-glow-white uppercase tracking-widest text-sm hover:scale-105 transition-all">
              Start QR Scanner
            </div>
            {offlineScansCount > 0 && (
              <div
                className="px-8 h-16 flex items-center justify-center bg-secondary text-secondary-foreground font-black rounded-2xl animate-bounce shadow-2xl cursor-pointer border-2 border-white/20"
                onClick={(e) => { e.stopPropagation(); syncOfflineAttendance(); }}
              >
                Sync Offline ({offlineScansCount})
              </div>
            )}
          </div>
        </CardContent>
      </button>

      {/* QR Scanner Modal */}
      {scanOpen && (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
          <h2 className="text-white text-xl font-semibold mb-3">Scan Attendance QR</h2>
          <div className="w-72 h-72 bg-white p-2 rounded-lg">
            <QrReader
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => setScanOpen(false)}
          >
            Close
          </Button>
        </div>
      )}
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Pay Fees', desc: 'Semester fee payment due soon', icon: CreditCard, color: 'bg-gradient-primary', link: '/fee-payment', action: 'Pay Now' },
          { label: 'AI Study Helper', desc: 'Personalized learning assistant', icon: Brain, color: 'bg-gradient-secondary', link: '/ai-assistant', action: 'Launch AI' },
          { label: 'MoU Requests', desc: 'Submit requests to faculty', icon: MessageSquare, color: 'bg-gradient-hero', link: '/mou-requests', action: 'Submit' }
        ].map((item, i) => (
          <Link key={i} to={item.link} className="group h-full">
            <Card className="glass-effect border-2 border-primary/10 shadow-soft hover-lift hover-border h-full overflow-hidden bg-white/50 dark:bg-card/50">
              <CardContent className="p-8 text-center flex flex-col h-full relative z-10">
                <div className={`${item.color} p-5 rounded-[2rem] w-fit mx-auto mb-6 shadow-glow group-hover:scale-110 transition-all duration-500`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-black text-2xl text-foreground mb-3 uppercase tracking-tighter">{item.label}</h3>
                <p className="text-sm text-muted-foreground mb-8 leading-relaxed font-semibold">{item.desc}</p>
                <div className="mt-auto inline-flex items-center justify-center gap-3 bg-primary text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest group-hover:shadow-glow transition-all">
                  {item.action}
                  <TrendingUp className="w-4 h-4 rotate-90" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;