import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  BookOpen,
  Clock,
  FileText,
  QrCode,
  MessageSquare,
  Brain,
  Calendar,
  Upload,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  Target
} from 'lucide-react';


import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const FacultyDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // 1. Fetch Me
        const userRes = await fetch(`${API_BASE}/auth/me`, { headers });
        if (userRes.ok) setUser(await userRes.json());

        // 2. Fetch Stats
        const statsRes = await fetch(`${API_BASE}/dashboard/stats`, { headers });
        if (statsRes.ok) setStats(await statsRes.json());

        // 3. Fetch Schedule
        const scheduleRes = await fetch(`${API_BASE}/dashboard/schedule`, { headers });
        if (scheduleRes.ok) setSchedule(await scheduleRes.json());

      } catch (error) {
        console.error("Dashboard fetch error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickStats = [
    { icon: BookOpen, label: 'Courses Teaching', value: stats.coursesTeaching?.toString() || '0', color: 'text-primary' },
    { icon: Users, label: 'Total Students', value: stats.totalStudents?.toString() || '0', color: 'text-success' },
    { icon: MessageSquare, label: 'Pending Queries', value: stats.pendingQueries?.toString() || '0', color: 'text-warning' },
    { icon: FileText, label: 'Assignments to Review', value: stats.assignmentsToReview?.toString() || '0', color: 'text-secondary' },
  ];

  // Static for now, as no Query API endpoint fully integrated in dashboard yet specific for this view
  const studentQueries = [
    { student: 'Ansh Dubey', query: 'Clarification on Database Normalization', course: 'DBMS', time: '2 hours ago', urgent: false },
    { student: 'Ramesh Kumar', query: 'Assignment submission deadline extension', course: 'DSA', time: '4 hours ago', urgent: true },
  ];

  const classPerformance = [
    { course: 'Database Systems', attendance: 89, avgScore: 85, assignments: 8 },
    { course: 'Data Structures', attendance: 92, avgScore: 78, assignments: 12 },
  ];

  return (
    <div className="space-y-8 p-6 academic-pattern rounded-3xl animate-fade-in-up">
      {/* Welcome Section */}
      <div className="bg-gradient-secondary rounded-3xl p-8 text-white shadow-elegant relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-700"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">Welcome Back, {user?.name || 'Faculty'}</h1>
            <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
              You have <span className="font-bold text-white underline decoration-white/40 decoration-2 underline-offset-4">{schedule.length} classes</span> scheduled today and <span className="font-bold text-white underline decoration-white/40 decoration-2 underline-offset-4">{stats.pendingQueries || 0} student queries</span> waiting for your response.
            </p>
            <div className="flex flex-wrap items-center gap-6 mt-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <GraduationCap className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium">{user?.department || 'Department'}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <Target className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium">Faculty Member</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/20 shadow-glow min-w-[120px]">
              <QrCode className="w-10 h-10 mx-auto mb-3 text-white animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Attendance</p>
              <Link to={"/qr-attendance"}><Button variant="secondary" size="sm" className="mt-2 font-black uppercase text-[10px] tracking-widest shadow-lg">
                Start Session
              </Button></Link>
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
                  <p className="text-3xl font-black mt-1 text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-secondary shadow-glow group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="xl:col-span-1">
          <Card className="glass-effect border-0 shadow-elegant overflow-hidden h-full">
            <CardHeader className="bg-gradient-elegant border-b border-border/10">
              <CardTitle className="flex items-center gap-2 text-primary font-black uppercase tracking-tighter">
                <Clock className="w-5 h-5" />
                Today's Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {schedule.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No classes scheduled today.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedule.map((item, index) => (
                    <div key={index} className="group relative flex items-center gap-4 p-4 rounded-2xl bg-gradient-card border border-border/40 hover-lift hover-border transition-all duration-300">
                      <div className="flex flex-col items-center justify-center min-w-[70px] py-1 border-r border-border/50">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Time</p>
                        <p className="text-sm font-black text-primary">{item.startTime}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-foreground group-hover:text-primary transition-colors">{item.course}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] font-black px-2 py-0 border-secondary/20 bg-secondary/5 text-secondary">{item.room}</Badge>
                          <Badge variant="secondary" className="text-[10px] font-black px-2 py-0">{item.type}</Badge>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <TrendingUp className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Student Queries & Class Performance */}
        <div className="xl:col-span-2 space-y-8">
          {/* Student Queries */}
          <Card className="glass-effect border-0 shadow-elegant overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-elegant border-b border-border/10">
              <CardTitle className="flex items-center gap-2 text-primary font-black uppercase tracking-tighter">
                <MessageSquare className="w-5 h-5" />
                Student Inquiries
              </CardTitle>
              <Button variant="ghost" size="sm" className="hover:bg-primary hover:text-white transition-all font-bold">
                View All
              </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentQueries.map((query, index) => (
                  <div key={index} className="group relative p-5 bg-gradient-card rounded-2xl border border-border/40 hover-lift hover-glow transition-all duration-300">
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`p-2 rounded-xl ${query.urgent ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-primary/10 text-primary'}`}>
                        {query.urgent ? <AlertCircle className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-black text-foreground leading-none">{query.student}</h4>
                          <Badge variant="outline" className="text-[9px] font-black tracking-widest">{query.course}</Badge>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">{query.time}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed italic border-l-2 border-primary/20 pl-3">
                      "{query.query}"
                    </p>
                    <Button variant="outline" size="sm" className="w-full rounded-xl border-primary/20 hover:bg-primary hover:text-white transition-all font-black uppercase text-[10px] tracking-widest">
                      Respond Now
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Class Performance */}
          <Card className="glass-effect border-0 shadow-elegant overflow-hidden">
            <CardHeader className="bg-gradient-elegant border-b border-border/10">
              <CardTitle className="flex items-center gap-2 text-primary font-black uppercase tracking-tighter">
                <TrendingUp className="w-5 h-5" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {classPerformance.map((item, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{item.course}</h4>
                      <Badge variant="secondary" className="text-[10px] font-black px-3 py-1 bg-primary/10 text-primary border-none">
                        {item.assignments} Tasks
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                          <span className="text-muted-foreground">Attendance</span>
                          <span className="text-success">{item.attendance}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                          <div
                            style={{ width: `${item.attendance}%` }}
                            className="h-full bg-gradient-premium transition-all duration-1000"
                          ></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                          <span className="text-muted-foreground">Avg Score</span>
                          <span className="text-primary">{item.avgScore}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                          <div
                            style={{ width: `${item.avgScore}%` }}
                            className="h-full bg-gradient-secondary transition-all duration-1000"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Upload Materials', desc: 'Notes, assignments & resources', icon: Upload, color: 'bg-gradient-primary', action: 'Upload', link: '/upload-materials' },
          { label: 'QR Attendance', desc: 'New sessions & live tracking', icon: QrCode, color: 'bg-gradient-secondary', action: 'Start', link: '/qr-attendance' },
          { label: 'AI Study Helper', desc: 'Personalized learning assistant', icon: Brain, color: 'bg-gradient-hero', action: 'Explore', link: '/ai-assistant' },
          { label: 'Class Schedule', desc: 'Manage your timetable', icon: Calendar, color: 'bg-success/80', action: 'Manage', link: '/faculty-schedule' }
        ].map((item, i) => (
          <Link key={i} to={item.link} className="group">
            <Card className="glass-effect border-2 border-primary/5 shadow-soft hover-lift hover-border h-full overflow-hidden cursor-pointer">
              <CardContent className="p-8 text-center flex flex-col h-full bg-gradient-elegant opacity-80 group-hover:opacity-100 transition-opacity">
                <div className={`${item.color} p-4 rounded-[2rem] w-fit mx-auto mb-6 shadow-glow group-hover:rotate-12 transition-all duration-500`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-black text-lg text-foreground mb-2 uppercase tracking-tighter">{item.label}</h3>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed font-semibold">{item.desc}</p>
                <div className="mt-auto flex items-center justify-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest group-hover:gap-4 transition-all">
                  {item.action}
                  <CheckCircle className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FacultyDashboard;