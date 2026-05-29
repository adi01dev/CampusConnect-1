import { motion } from 'framer-motion';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const MyAttendance = () => {
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [subjectAttendance, setSubjectAttendance] = useState<any[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_BASE}/student/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSubjectAttendance(data.subjectAttendance || []);
          setRecentAttendance(data.recentAttendance || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const attendanceData = [
    { month: 'Aug', percentage: 88 },
    { month: 'Sep', percentage: 92 },
    { month: 'Oct', percentage: 89 },
    { month: 'Nov', percentage: 95 },
    { month: 'Dec', percentage: 91 },
    { month: 'Jan', percentage: Math.round(subjectAttendance.reduce((acc, s) => acc + s.percentage, 0) / (subjectAttendance.length || 1)) }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent': return <Badge variant="default" className="bg-green-500">Excellent</Badge>;
      case 'good': return <Badge variant="default">Good</Badge>;
      case 'warning': return <Badge variant="destructive">Below Required</Badge>;
      default: return <Badge variant="secondary">Average</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'good': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-orange-500" />;
    }
  };

  const overallAttendance = subjectAttendance.length > 0
    ? Math.round(subjectAttendance.reduce((acc, subject) => acc + subject.percentage, 0) / subjectAttendance.length)
    : 100;

  const subjectsAtRisk = subjectAttendance.filter(s => s.percentage < 75).length;

  return (
    <motion.div 
      className="space-y-6 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <BreadcrumbNav />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            My Attendance
          </h1>
          <p className="text-muted-foreground mt-2">Track your attendance across all subjects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overall Attendance</p>
                  <p className={`text-2xl font-bold ${overallAttendance >= 90 ? 'text-green-500' : overallAttendance >= 75 ? 'text-blue-500' : 'text-red-500'}`}>
                    {overallAttendance}%
                  </p>
                </div>
                <CalendarDays className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Classes This Week</p>
                  <p className="text-2xl font-bold text-green-500">
                    {subjectAttendance.reduce((acc, s) => acc + s.attendedClasses, 0)}/{subjectAttendance.reduce((acc, s) => acc + s.totalClasses, 0)}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subjects at Risk</p>
                  <p className="text-2xl font-bold text-red-500">{subjectsAtRisk}</p>
                  <p className="text-xs text-muted-foreground">Below 75%</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attendance Trend</p>
                  <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold text-green-500">+2.5%</p>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                </div>
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Subject-wise Attendance</CardTitle>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjectAttendance.map((subject) => (
                  <SelectItem key={subject.code} value={subject.code}>{subject.subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectAttendance.map((subject, index) => (
                <motion.div
                  key={subject.code}
                  className="p-4 border rounded-lg glass-card hover:bg-accent/50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{subject.subject}</h3>
                        <Badge variant="outline">{subject.code}</Badge>
                        {getStatusIcon(subject.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Last attended: {subject.lastAttended}
                      </p>
                    </div>
                    {getStatusBadge(subject.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Attendance: {subject.attendedClasses}/{subject.totalClasses} classes</span>
                      <span className={`font-medium ${subject.percentage >= subject.requiredPercentage ? 'text-green-600' : 'text-red-600'}`}>
                        {subject.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={subject.percentage} 
                      className={`h-2 ${subject.percentage < subject.requiredPercentage ? 'bg-red-100' : 'bg-green-100'}`}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Required: {subject.requiredPercentage}%</span>
                      <span>
                        {subject.percentage >= subject.requiredPercentage 
                          ? `${(subject.percentage - subject.requiredPercentage).toFixed(1)}% above required` 
                          : `${(subject.requiredPercentage - subject.percentage).toFixed(1)}% below required`
                        }
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAttendance.map((record, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${record.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div>
                      <p className="font-medium text-sm">{record.subject}</p>
                      <p className="text-xs text-muted-foreground">{record.date} at {record.time}</p>
                    </div>
                  </div>
                  <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                    {record.status === 'present' ? 'Present' : 'Absent'}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default MyAttendance;