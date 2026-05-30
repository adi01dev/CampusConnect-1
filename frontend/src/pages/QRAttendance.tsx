import { motion } from 'framer-motion';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Scan, Users, Clock, Calendar, Download, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { QRCodeCanvas } from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const QRAttendance = () => {
  const { toast } = useToast();

  const [selectedSubject, setSelectedSubject] = useState("Data Structures");
  const [selectedSession, setSelectedSession] = useState("");
  const [duration, setDuration] = useState("60");
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<string[]>([
    'Data Structures',
    'Machine Learning',
    'Database Systems',
    'Algorithms',
    'Software Engineering'
  ]);
  const [livePresent, setLivePresent] = useState<any[]>([]);
  const [liveAbsent, setLiveAbsent] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<{ id: string, secret: string } | null>(null);

  const token = localStorage.getItem("accessToken");

  const todaysSessions = [
    {
      id: 1,
      subject: 'Data Structures',
      time: '10:00 AM - 11:00 AM',
      room: 'CS Lab 1',
      faculty: 'Dr. Priya Sharma',
      totalStudents: 45,
      present: 42,
      status: 'ongoing',
      qrCode: 'DS_2024_001'
    },
    {
      id: 2,
      subject: 'Machine Learning',
      time: '2:00 PM - 3:00 PM',
      room: 'CS-205',
      faculty: 'Prof. Rahul Patel',
      totalStudents: 38,
      present: 35,
      status: 'upcoming',
      qrCode: 'ML_2024_002'
    },
    {
      id: 3,
      subject: 'Database Systems',
      time: '11:30 AM - 12:30 PM',
      room: 'CS-101',
      faculty: 'Dr. Priya Sharma',
      totalStudents: 40,
      present: 38,
      status: 'completed',
      qrCode: 'DB_2024_003'
    }
  ];

  // Poll live scans
  useEffect(() => {
    if (!activeSession) return;

    const fetchLiveStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/faculty/attendance/session/${activeSession.id}/live`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLivePresent(data.present || []);
          setLiveAbsent(data.absent || []);
        }
      } catch (err) {
        console.error("Live attendance fetch error:", err);
      }
    };

    fetchLiveStatus(); // Initial
    const liveInterval = setInterval(fetchLiveStatus, 3000); // Poll every 3 seconds

    return () => clearInterval(liveInterval);
  }, [activeSession]);

  // Crypto helper for HMAC-SHA256
  const signPayload = async (secret: string, data: string) => {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Effect to update QR every 10s if session is active
  useEffect(() => {
    if (!activeSession) return;

    const updateQR = async () => {
      const timestamp = Date.now();
      const nonce = Math.random().toString(36).substring(7);
      const signature = await signPayload(activeSession.secret, `${nonce}:${timestamp}`);
      // Payload format: sessionId:nonce:timestamp:signature
      const payload = `${activeSession.id}:${nonce}:${timestamp}:${signature}`;

      setQrToken(payload);
      setExpiresAt(new Date(timestamp + 15000).toISOString()); // 15s validity
    };

    updateQR(); // Initial
    const interval = setInterval(updateQR, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, [activeSession]);

  const handleGenerateQR = async () => {
    if (!selectedSubject || !selectedSession) {
      toast({
        title: "Missing Details",
        description: "Please select a subject and session type.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/faculty/attendance/create-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          course: selectedSubject,
          sessionType: selectedSession,
          duration: parseInt(duration),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // Store session details (ID + Secret) to generate QRs locally
      setActiveSession({
        id: data.session.id,
        secret: data.session.secret
      });

      toast({
        title: "Session Started",
        description: `Dynamic QR generation active for ${selectedSubject}.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to generate QR code.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


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
            QR Attendance
          </h1>
          <p className="text-muted-foreground mt-2">Generate QR codes and track attendance digitally</p>
        </div>
        <Button className="glass-card"
          onClick={handleGenerateQR}
          disabled={loading}
        >
          <QrCode className="w-4 h-4 mr-2" />
          {loading ? "Generating..." : "Generate New QR"}
        </Button>
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
                  <p className="text-sm font-medium text-muted-foreground">Today's Classes</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
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
                  <p className="text-sm font-medium text-muted-foreground">Students Present</p>
                  <p className="text-2xl font-bold text-green-500">284</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
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
                  <p className="text-sm font-medium text-muted-foreground">Avg Attendance</p>
                  <p className="text-2xl font-bold text-purple-500">91.2%</p>
                </div>
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                </div>
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
                  <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                  <p className="text-2xl font-bold text-orange-500">3</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Generate QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session">Session Type</Label>
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lecture">Lecture</SelectItem>
                    <SelectItem value="lab">Lab Session</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" type="number" placeholder="60" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>



              <div className="p-6 bg-background/50 rounded-lg text-center border-2 border-dashed">
                {qrToken ? (
                  <>
                    <QRCodeCanvas
                      value={qrToken}
                      size={160}
                      includeMargin={true}
                      className="mx-auto mb-4"
                    />
                    <p className="text-sm font-medium text-green-600">QR Code Active</p>
                    {expiresAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Expires at: {new Date(expiresAt).toLocaleTimeString()}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <QrCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">QR Code will appear here</p>
                  </>
                )}
              </div>


              <Button className="glass-card"
                onClick={handleGenerateQR}
                disabled={loading}
              >
                <QrCode className="w-4 h-4 mr-2" />
                {loading ? "Generating..." : "Generate New QR"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Today's Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaysSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    className="p-4 border rounded-lg glass-card hover:bg-accent/50 transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{session.subject}</h3>
                          <Badge variant={
                            session.status === 'ongoing' ? 'default' :
                              session.status === 'completed' ? 'secondary' : 'outline'
                          }>
                            {session.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div>
                            <p><span className="font-medium">Time:</span> {session.time}</p>
                            <p><span className="font-medium">Room:</span> {session.room}</p>
                            <p><span className="font-medium">Faculty:</span> {session.faculty}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Students:</span> {session.totalStudents}</p>
                            <p><span className="font-medium">Present:</span>
                              <span className={session.present >= session.totalStudents * 0.9 ? 'text-green-500' : 'text-orange-500'}>
                                {" "}{session.present}/{session.totalStudents}
                              </span>
                            </p>
                            <p><span className="font-medium">Attendance:</span>
                              <span className={session.present >= session.totalStudents * 0.9 ? 'text-green-500' : 'text-orange-500'}>
                                {" "}{Math.round((session.present / session.totalStudents) * 100)}%
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {session.status === 'ongoing' && (
                          <Button variant="ghost" size="sm">
                            <Scan className="w-4 h-4 mr-1" />
                            Scan
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Live Attendance</CardTitle>
                <Button variant="ghost" size="sm" onClick={async () => {
                  if (!activeSession) return;
                  try {
                    const res = await fetch(`${API_BASE}/faculty/attendance/session/${activeSession.id}/live`, {
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setLivePresent(data.present || []);
                      setLiveAbsent(data.absent || []);
                      toast({ title: "Refreshed", description: "Attendance records up to date." });
                    }
                  } catch (e) {}
                }}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="present" className="space-y-4">
                <TabsList className="grid grid-cols-2 bg-muted/50 p-1 rounded-xl">
                  <TabsTrigger value="present" className="rounded-lg text-xs font-bold uppercase tracking-wider">
                    Present ({livePresent.length})
                  </TabsTrigger>
                  <TabsTrigger value="absent" className="rounded-lg text-xs font-bold uppercase tracking-wider">
                    Remaining ({liveAbsent.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="present" className="space-y-3">
                  {livePresent.length === 0 ? (
                    <p className="text-sm text-center py-8 text-muted-foreground">No students checked in yet.</p>
                  ) : (
                    livePresent.map((record, index) => (
                      <motion.div
                        key={record.studentId}
                        className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/10 rounded-xl"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <div>
                          <p className="font-semibold text-sm">{record.student}</p>
                          <p className="text-xs text-muted-foreground">{record.rollNo}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="default" className="mb-1 bg-green-500 hover:bg-green-600 text-white">Present</Badge>
                          <p className="text-[10px] text-muted-foreground">{record.time}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="absent" className="space-y-3">
                  {liveAbsent.length === 0 ? (
                    <p className="text-sm text-center py-8 text-muted-foreground">All students present!</p>
                  ) : (
                    liveAbsent.map((record, index) => (
                      <motion.div
                        key={record.studentId}
                        className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-xl"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <div>
                          <p className="font-semibold text-sm">{record.student}</p>
                          <p className="text-xs text-muted-foreground">{record.rollNo}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive" className="mb-1">Absent</Badge>
                        </div>
                      </motion.div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QRAttendance;