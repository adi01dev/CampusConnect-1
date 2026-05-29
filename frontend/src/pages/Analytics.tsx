import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import {
  TrendingUp,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  AlertCircle,
  Download,
  RefreshCw,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import api from '@/lib/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Area,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsData {
  studentDistribution: Array<{ department: string; count: number }>;
  feeStats: {
    totalPaidFee: number;
    totalPendingFee: number;
    completionRate: number;
    breakdown: Array<{
      department: string;
      totalStudents: number;
      paidStudents: number;
      pendingStudents: number;
      totalPaidFee: number;
      totalPendingFee: number;
    }>;
  };
  academicPerformance: Array<{
    course: string;
    avgScore: number;
    avgAttendance: number;
    totalAssignments: number;
  }>;
  attendanceTrends: Array<{
    course: string;
    verified: number;
    late: number;
    flagged: number;
    total: number;
    avgDelay: number;
  }>;
  atRiskStudents: Array<{
    name: string;
    email: string;
    department: string;
    semester: string;
    attendance: string;
  }>;
  overview: {
    totalStudents: number;
    avgAttendanceRate: number;
    feePaidTotal: number;
    feePendingTotal: number;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const FEE_COLORS = ['#3b82f6', '#f59e0b']; // Paid vs Pending

const Analytics = () => {
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedSem, setSelectedSem] = useState('all');
  const [autoPoll, setAutoPoll] = useState(false);

  const fetchAnalytics = async (isSilent = false) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    if (!isSilent) setLoading(true);
    try {
      const res = await api.get<AnalyticsData>('/analytics/summary', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          department: selectedDept,
          semester: selectedSem
        }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      toast({
        title: 'Error Loading Analytics',
        description: 'Failed to retrieve aggregate statistics from backend.',
        variant: 'destructive'
      });
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Fetch on filters change
  useEffect(() => {
    fetchAnalytics();
  }, [selectedDept, selectedSem]);

  // Real-time polling effect
  useEffect(() => {
    if (!autoPoll) return;

    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 15000); // Poll every 15s

    return () => clearInterval(interval);
  }, [autoPoll, selectedDept, selectedSem]);

  // Compile and Download CSV Report
  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Title
    csvContent += 'CampusConnect ERP Analytics Report Summary\n';
    csvContent += `Generated On: ${new Date().toLocaleString()}\n`;
    csvContent += `Filters Applied - Dept: ${selectedDept}, Semester: ${selectedSem}\n\n`;

    // Overview Section
    csvContent += 'INSTITUTIONAL OVERVIEW\n';
    csvContent += `Total Enrolled Students,${data.overview.totalStudents}\n`;
    csvContent += `Average Attendance Rate,${data.overview.avgAttendanceRate}%\n`;
    csvContent += `Total Fee Collected (INR),${data.overview.feePaidTotal}\n`;
    csvContent += `Total Fee Pending (INR),${data.overview.feePendingTotal}\n\n`;

    // Academic Stats
    csvContent += 'ACADEMIC COURSE PERFORMANCE\n';
    csvContent += 'Course,Avg Class Score,Avg Attendance Rate,Total Coursework Assignments\n';
    data.academicPerformance.forEach(row => {
      csvContent += `"${row.course}",${row.avgScore}%,${row.avgAttendance}%,${row.totalAssignments}\n`;
    });
    csvContent += '\n';

    // Attendance records
    csvContent += 'ATTENDANCE VERIFICATION TRENDS\n';
    csvContent += 'Course,Verified Scans,Late Scans,Flagged Scans,Total Scans,Avg Scan Delay (ms)\n';
    data.attendanceTrends.forEach(row => {
      csvContent += `"${row.course}",${row.verified},${row.late},${row.flagged},${row.total},${row.avgDelay}\n`;
    });
    csvContent += '\n';

    // At-Risk students
    csvContent += 'CRITICAL AT-RISK ROSTER\n';
    csvContent += 'Student Name,Student Email,Department,Semester,Attendance Rate\n';
    data.atRiskStudents.forEach(row => {
      csvContent += `"${row.name}","${row.email}","${row.department}",${row.semester},"${row.attendance}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `campusconnect_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast({
      title: 'Report Downloaded',
      description: 'The CSV report summary has been generated and saved locally.'
    });
  };

  const getDepartmentStatsForPie = () => {
    if (!data) return [];
    return data.studentDistribution.map(item => ({
      name: item.department,
      value: item.count
    }));
  };

  const getFeeDataForPie = () => {
    if (!data) return [];
    return [
      { name: 'Paid Collections', value: data.feeStats.totalPaidFee },
      { name: 'Pending Outstandings', value: data.feeStats.totalPendingFee }
    ];
  };

  return (
    <motion.div
      className="space-y-6 academic-pattern p-6 rounded-3xl animate-fade-in-up"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <BreadcrumbNav />

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Institutional Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time aggregate overview of campus attendance, coursework performance, and finance metrics.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Polling Switch */}
          <Button
            variant={autoPoll ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoPoll(!autoPoll)}
            className="rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Activity className={`w-4 h-4 mr-2 ${autoPoll ? 'animate-pulse text-green-400' : ''}`} />
            {autoPoll ? 'Polling: 15s Active' : 'Enable Real-time'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics()}
            disabled={loading}
            className="rounded-xl text-xs font-bold transition-all shadow-sm bg-card hover:bg-primary/5"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>

          <Button
            onClick={handleExportCSV}
            disabled={!data}
            className="rounded-xl text-xs font-bold transition-all bg-primary hover:bg-primary/95 shadow-md flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Summary
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      <Card className="border border-primary/10 bg-card/65 backdrop-blur-xl rounded-2xl shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-black uppercase tracking-widest min-w-fit">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span>Interactive Filters:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            <div className="space-y-1">
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="bg-background/50 border-border/40 text-xs rounded-xl h-10">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Civil">Civil</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Select value={selectedSem} onValueChange={setSelectedSem}>
                <SelectTrigger className="bg-background/50 border-border/40 text-xs rounded-xl h-10">
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  <SelectItem value="4">Semester 4</SelectItem>
                  <SelectItem value="5">Semester 5</SelectItem>
                  <SelectItem value="6">Semester 6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading overlay if fetching */}
      <AnimatePresence>
        {loading && !data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-80 flex flex-col items-center justify-center text-muted-foreground gap-3 border border-dashed rounded-3xl bg-muted/10"
          >
            <RefreshCw className="w-10 h-10 text-primary animate-spin" />
            <span className="font-bold text-xs uppercase tracking-widest text-primary/70">Invoking Aggregation Pipelines...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {data && (
        <>
          {/* KPI Widget Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Total Students */}
            <Card className="glass-effect border-0 shadow-card hover-lift overflow-hidden rounded-2xl">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Total Enrolled</p>
                  <p className="text-3xl font-black text-foreground">{data.overview.totalStudents}</p>
                  <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full flex items-center w-fit gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +5.2% Growth
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-primary shadow-glow">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </CardContent>
            </Card>

            {/* Attendance % */}
            <Card className="glass-effect border-0 shadow-card hover-lift overflow-hidden rounded-2xl">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Avg Attendance</p>
                  <p className="text-3xl font-black text-foreground">{data.overview.avgAttendanceRate}%</p>
                  <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full flex items-center w-fit gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Optimal Stable
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-secondary shadow-glow">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </CardContent>
            </Card>

            {/* Fee Completion % */}
            <Card className="glass-effect border-0 shadow-card hover-lift overflow-hidden rounded-2xl">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">Fee Completion</p>
                  <p className="text-3xl font-black text-foreground">{data.feeStats.completionRate}%</p>
                  <div className="w-[85%] bg-muted/60 h-2.5 rounded-full overflow-hidden border mt-1">
                    <div
                      style={{ width: `${data.feeStats.completionRate}%` }}
                      className="bg-gradient-primary h-full rounded-full transition-all duration-700"
                    ></div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-hero shadow-glow">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </CardContent>
            </Card>

            {/* At-Risk Students */}
            <Card className="glass-effect border-0 shadow-card hover-lift overflow-hidden rounded-2xl">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-wider">At-Risk Students</p>
                  <p className="text-3xl font-black text-destructive">{data.atRiskStudents.length}</p>
                  <span className="text-[10px] text-destructive font-bold bg-destructive/10 px-2 py-0.5 rounded-full flex items-center w-fit gap-1 animate-pulse">
                    <TrendingDown className="w-3 h-3" />
                    Attention Needed
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-destructive/20 border border-destructive/30">
                  <AlertCircle className="w-6 h-6 text-destructive animate-bounce" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Stacked Attendance Verification Trends */}
            <Card className="glass-effect border-0 shadow-card rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-border/10 bg-muted/10">
                <CardTitle className="text-sm font-black text-primary flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span>Attendance Scan Categories</span>
                </CardTitle>
                <CardDescription className="text-xs">Stacked verification counts per academic subject</CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.attendanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="course" fontSize={10} stroke="#888888" />
                    <YAxis fontSize={10} stroke="#888888" />
                    <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", border: "0", borderRadius: "12px", color: "#fff", fontSize: "11px" }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                    <Bar dataKey="verified" name="Verified" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="late" name="Late Scans" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="flagged" name="Flagged Scans" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Composed Performance Chart: Score vs Attendance */}
            <Card className="glass-effect border-0 shadow-card rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-border/10 bg-muted/10">
                <CardTitle className="text-sm font-black text-primary flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span>Academic Score vs Schedule Attendance</span>
                </CardTitle>
                <CardDescription className="text-xs">Composed view matching class test averages with log presence</CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.academicPerformance}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="course" fontSize={10} stroke="#888888" />
                    <YAxis yAxisId="left" label={{ value: 'Avg Grade (%)', angle: -90, position: 'insideLeft', style: {fontSize: 10, fill: "#888"} }} fontSize={10} stroke="#888888" />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Attendance (%)', angle: 90, position: 'insideRight', style: {fontSize: 10, fill: "#888"} }} fontSize={10} stroke="#888888" />
                    <Tooltip contentStyle={{ background: "rgba(15,23,42,0.9)", border: "0", borderRadius: "12px", color: "#fff", fontSize: "11px" }} />
                    <Legend wrapperStyle={{ fontSize: "10px" }} />
                    <Area yAxisId="left" type="monotone" dataKey="avgScore" name="Avg Score" fill="#3b82f6" fillOpacity={0.15} stroke="#3b82f6" />
                    <Line yAxisId="right" type="monotone" dataKey="avgAttendance" name="Attendance" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Fee Collection Ratios */}
            <Card className="glass-effect border-0 shadow-card rounded-3xl overflow-hidden xl:col-span-1">
              <CardHeader className="border-b border-border/10 bg-muted/10">
                <CardTitle className="text-sm font-black text-primary flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-primary" />
                  <span>Fee Collection Shares</span>
                </CardTitle>
                <CardDescription className="text-xs">Overall paid vs pending finances</CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-80 flex flex-col justify-between">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="80%">
                    <RechartsPieChart>
                      <Pie
                        data={getFeeDataForPie()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getFeeDataForPie().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={FEE_COLORS[index % FEE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4 text-xs font-bold">
                  <div className="flex justify-between items-center text-[#3b82f6]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></div>
                      <span>Paid Collections</span>
                    </div>
                    <span>₹{data.feeStats.totalPaidFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#f59e0b]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div>
                      <span>Pending Outstandings</span>
                    </div>
                    <span>₹{data.feeStats.totalPendingFee.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Ratios */}
            <Card className="glass-effect border-0 shadow-card rounded-3xl overflow-hidden xl:col-span-1">
              <CardHeader className="border-b border-border/10 bg-muted/10">
                <CardTitle className="text-sm font-black text-primary flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-primary" />
                  <span>Student Registrations Share</span>
                </CardTitle>
                <CardDescription className="text-xs">Student distribution proportion across departments</CardDescription>
              </CardHeader>
              <CardContent className="p-6 h-80 flex flex-col justify-between">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="80%">
                    <RechartsPieChart>
                      <Pie
                        data={getDepartmentStatsForPie()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        labelLine={false}
                      >
                        {getDepartmentStatsForPie().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-muted-foreground mt-4">
                  {getDepartmentStatsForPie().map((dept, index) => (
                    <div key={index} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="truncate">{dept.name} ({dept.value})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Critical At-Risk Roster list */}
            <Card className="glass-effect border-0 shadow-card rounded-3xl overflow-hidden xl:col-span-1">
              <CardHeader className="border-b border-border/10 bg-muted/10">
                <CardTitle className="text-sm font-black text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span>At-Risk Students Roster</span>
                </CardTitle>
                <CardDescription className="text-xs">Students with low log presence needing attention</CardDescription>
              </CardHeader>
              <CardContent className="p-4 h-80 overflow-y-auto space-y-3 scrollbar-thin">
                {data.atRiskStudents.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-destructive/5 border border-destructive/10 text-xs">
                    <div>
                      <h4 className="font-bold text-foreground">{student.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{student.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[9px] px-1 py-0">{student.department}</Badge>
                        <span className="text-[9px] text-muted-foreground">Sem {student.semester}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="font-black px-2 py-0.5 rounded-lg">
                        {student.attendance}
                      </Badge>
                    </div>
                  </div>
                ))}
                {data.atRiskStudents.length === 0 && (
                  <div className="h-full flex items-center justify-center flex-col text-muted-foreground text-center">
                    <Users className="w-8 h-8 opacity-20 mb-2 text-green-500" />
                    <p className="text-xs font-bold text-green-500">Perfect Class Presence</p>
                    <p className="text-[10px]">All student attendance rates are above 75%.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Analytics;