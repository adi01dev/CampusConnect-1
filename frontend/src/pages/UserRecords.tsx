import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  Shield,
  GraduationCap,
  Briefcase,
  Key,
  Trash2,
  Eye,
  Settings
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const UserRecords = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Data State
  const [users, setUsers] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals & Dialogs State
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resettingUser, setResettingUser] = useState<any>(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Form State
  const [form, setForm] = useState<{
    name: string;
    email: string;
    password?: string;
    role: string;
    department: string;
    semester: string;
    subjects: string[];
  }>({
    name: "",
    email: "",
    password: "",
    role: "Student",
    department: "",
    semester: "",
    subjects: [],
  });

  const token = localStorage.getItem("accessToken");

  // Fetch Users & Subjects from Backend
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ title: "Failed to fetch users", variant: "destructive" });
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAvailableSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch subjects", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSubjects();
  }, []);

  // CRUD Actions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${API_BASE}/admin/users/${editing._id}`
      : `${API_BASE}/admin/users`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast({ title: editing ? "User details updated" : "New user created successfully" });
        setOpen(false);
        setEditing(null);
        setForm({
          name: "",
          email: "",
          password: "",
          role: "Student",
          department: "",
          semester: "",
          subjects: [],
        });
        fetchUsers();
      } else {
        const err = await res.json();
        toast({ title: "Operation failed", description: err.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user permanently?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast({ title: "User deleted successfully" });
        fetchUsers();
      } else {
        const err = await res.json();
        toast({ title: "Deletion failed", description: err.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleResetPassword = async () => {
    if (!resettingUser) return;
    try {
      setResetLoading(true);
      const res = await fetch(`${API_BASE}/admin/users/${resettingUser._id}/reset-password`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Password reset complete",
          description: `A new random password has been generated and emailed to ${resettingUser.name}.`,
        });
        setResetOpen(false);
        setResettingUser(null);
      } else {
        throw new Error(data.message || "Failed to reset password");
      }
    } catch (err: any) {
      toast({ title: "Reset failed", description: err.message, variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };

  // Stats computation
  const studentsCount = users.filter((u) => u.role === "Student").length;
  const facultyCount = users.filter((u) => u.role === "Faculty").length;
  const staffCount = users.filter((u) => u.role === "Admin").length;
  const totalCount = users.length;

  const stats = [
    { label: "Total Students", value: studentsCount.toLocaleString(), icon: GraduationCap, color: "text-blue-600" },
    { label: "Faculty Members", value: facultyCount.toLocaleString(), icon: Briefcase, color: "text-green-600" },
    { label: "Staff Members", value: staffCount.toLocaleString(), icon: Users, color: "text-purple-600" },
    { label: "Active Users", value: totalCount.toLocaleString(), icon: Shield, color: "text-orange-600" },
  ];

  // Dynamic filter lists
  const filterList = (roleType: string) => {
    return users.filter((u) => {
      if (u.role !== roleType) return false;
      if (!searchQuery) return true;
      const term = searchQuery.toLowerCase();
      
      const matchName = u.name?.toLowerCase().includes(term);
      const matchEmail = u.email?.toLowerCase().includes(term);
      const matchDept = u.department?.toLowerCase().includes(term);
      const matchSemester = u.semester?.toLowerCase().includes(term);
      const matchSubjects = u.subjects?.some((s: string) => s.toLowerCase().includes(term));
      const matchDesignation = u.designation?.toLowerCase().includes(term);
      const matchRoll = u.rollNumber?.toLowerCase().includes(term);
      const matchStudentId = u.studentId?.toLowerCase().includes(term);

      return (
        matchName ||
        matchEmail ||
        matchDept ||
        matchSemester ||
        matchSubjects ||
        matchDesignation ||
        matchRoll ||
        matchStudentId
      );
    });
  };

  const filteredStudents = filterList("Student");
  const filteredFaculty = filterList("Faculty");
  const filteredStaff = filterList("Admin");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              User Records
            </h1>
            <p className="text-muted-foreground mt-1">Manage and provision all user accounts and records</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              className="gap-2 bg-gradient-primary text-white shadow-glow"
              onClick={() => {
                setEditing(null);
                setForm({
                  name: "",
                  email: "",
                  password: "",
                  role: "Student",
                  department: "",
                  semester: "",
                  subjects: [],
                });
                setOpen(true);
              }}
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, email, department, designation, or subjects..."
            className="pl-10 backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* User Records Tabs */}
        <Tabs defaultValue="students" className="space-y-4">
          <TabsList className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
            <TabsTrigger value="students">Students ({filteredStudents.length})</TabsTrigger>
            <TabsTrigger value="faculty">Faculty ({filteredFaculty.length})</TabsTrigger>
            <TabsTrigger value="staff">Staff ({filteredStaff.length})</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Student Records
                </CardTitle>
                <CardDescription>Complete list of enrolled students</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase font-semibold">
                        <th className="text-left py-3.5 px-4">Roll Number</th>
                        <th className="text-left py-3.5 px-4">Name</th>
                        <th className="text-left py-3.5 px-4">Email</th>
                        <th className="text-left py-3.5 px-4">Department</th>
                        <th className="text-left py-3.5 px-4">Semester</th>
                        <th className="text-left py-3.5 px-4">Status</th>
                        <th className="text-right py-3.5 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-sm">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-muted-foreground italic">No student records found.</td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => (
                          <tr key={student._id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-semibold">{student.rollNumber || student.studentId || student._id.slice(-6).toUpperCase()}</td>
                            <td className="py-3 px-4 font-medium text-foreground">{student.name}</td>
                            <td className="py-3 px-4 text-muted-foreground">{student.email}</td>
                            <td className="py-3 px-4">{student.department || "General"}</td>
                            <td className="py-3 px-4">Semester {student.semester || "1"}</td>
                            <td className="py-3 px-4">
                              <Badge className="bg-green-500/10 text-green-600 border border-green-500/25">Active</Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button size="sm" variant="ghost" onClick={() => { setViewingUser(student); setViewOpen(true); }}><Eye className="h-3.5 w-3.5" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => {
                                  setEditing(student);
                                  setForm({
                                    name: student.name,
                                    email: student.email,
                                    password: "",
                                    role: student.role,
                                    department: student.department || "",
                                    semester: student.semester || "",
                                    subjects: student.subjects || []
                                  });
                                  setOpen(true);
                                }}><Settings className="h-3.5 w-3.5" /></Button>
                                <Button size="sm" variant="ghost" className="text-yellow-600 hover:text-yellow-700" onClick={() => { setResettingUser(student); setResetOpen(true); }}><Key className="h-3.5 w-3.5" /></Button>
                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive/80" onClick={() => handleDelete(student._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Faculty Tab */}
          <TabsContent value="faculty">
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Faculty Records
                </CardTitle>
                <CardDescription>All academic faculty members information</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase font-semibold">
                        <th className="text-left py-3.5 px-4">Faculty ID</th>
                        <th className="text-left py-3.5 px-4">Name</th>
                        <th className="text-left py-3.5 px-4">Email</th>
                        <th className="text-left py-3.5 px-4">Department</th>
                        <th className="text-left py-3.5 px-4">Designation</th>
                        <th className="text-left py-3.5 px-4">Assigned Subjects</th>
                        <th className="text-right py-3.5 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-sm">
                      {filteredFaculty.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-muted-foreground italic">No faculty records found.</td>
                        </tr>
                      ) : (
                        filteredFaculty.map((member) => (
                          <tr key={member._id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-semibold">{member._id.slice(-6).toUpperCase()}</td>
                            <td className="py-3 px-4 font-medium text-foreground">
                              {member.name}
                              {member.isMoUCoordinator && (
                                <Badge variant="outline" className="text-[9px] font-semibold border-green-500 bg-green-500/10 text-green-700 ml-2">MoU Coordinator</Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">{member.email}</td>
                            <td className="py-3 px-4">{member.department || "General"}</td>
                            <td className="py-3 px-4">{member.designation || "Faculty"}</td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                                {member.subjects && member.subjects.length > 0 ? (
                                  member.subjects.map((sub: string) => (
                                    <Badge key={sub} variant="secondary" className="px-2 py-0.5 bg-secondary/15 text-foreground rounded text-[11px] font-medium border-0">{sub}</Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">Unassigned</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button size="sm" variant="ghost" onClick={() => { setViewingUser(member); setViewOpen(true); }}><Eye className="h-3.5 w-3.5" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => {
                                  setEditing(member);
                                  setForm({
                                    name: member.name,
                                    email: member.email,
                                    password: "",
                                    role: member.role,
                                    department: member.department || "",
                                    semester: member.semester || "",
                                    subjects: member.subjects || []
                                  });
                                  setOpen(true);
                                }}><Settings className="h-3.5 w-3.5" /></Button>
                                <Button size="sm" variant="ghost" className="text-yellow-600 hover:text-yellow-700" onClick={() => { setResettingUser(member); setResetOpen(true); }}><Key className="h-3.5 w-3.5" /></Button>
                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive/80" onClick={() => handleDelete(member._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff">
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Staff Records
                </CardTitle>
                <CardDescription>Administrative and support staff information</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase font-semibold">
                        <th className="text-left py-3.5 px-4">Staff ID</th>
                        <th className="text-left py-3.5 px-4">Name</th>
                        <th className="text-left py-3.5 px-4">Email</th>
                        <th className="text-left py-3.5 px-4">Department</th>
                        <th className="text-left py-3.5 px-4">Role</th>
                        <th className="text-left py-3.5 px-4">Status</th>
                        <th className="text-right py-3.5 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-sm">
                      {filteredStaff.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-muted-foreground italic">No staff records found.</td>
                        </tr>
                      ) : (
                        filteredStaff.map((member) => (
                          <tr key={member._id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-semibold">{member._id.slice(-6).toUpperCase()}</td>
                            <td className="py-3 px-4 font-medium text-foreground">{member.name}</td>
                            <td className="py-3 px-4 text-muted-foreground">{member.email}</td>
                            <td className="py-3 px-4">{member.department || "Administration"}</td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary font-semibold">{member.role}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className="bg-green-500/10 text-green-600 border border-green-500/25">Active</Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <Button size="sm" variant="ghost" onClick={() => { setViewingUser(member); setViewOpen(true); }}><Eye className="h-3.5 w-3.5" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => {
                                  setEditing(member);
                                  setForm({
                                    name: member.name,
                                    email: member.email,
                                    password: "",
                                    role: member.role,
                                    department: member.department || "",
                                    semester: member.semester || "",
                                    subjects: member.subjects || []
                                  });
                                  setOpen(true);
                                }}><Settings className="h-3.5 w-3.5" /></Button>
                                <Button size="sm" variant="ghost" className="text-yellow-600 hover:text-yellow-700" onClick={() => { setResettingUser(member); setResetOpen(true); }}><Key className="h-3.5 w-3.5" /></Button>
                                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive/80" onClick={() => handleDelete(member._id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl border-0 shadow-2xl glass-effect p-8 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-primary">
              {editing ? "Configure User Identity" : "Provision New User"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border-border/40 bg-muted/20" required />
              </div>
              <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Email Address</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl border-border/40 bg-muted/20" required />
              </div>
            </div>

            {!editing && (
              <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Access Credentials</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-xl border-border/40 bg-muted/20" required />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">System Role</Label>
                <select className="flex h-10 w-full rounded-xl border border-border/40 bg-muted/20 px-3 py-2 text-sm focus-visible:outline-none font-bold" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option>Faculty</option>
                  <option>Student</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Department</Label>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="rounded-xl border-border/40 bg-muted/20" />
              </div>
            </div>

            {form.role === "Student" && (
              <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Academic Semester</Label>
                <Input value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className="rounded-xl border-border/40 bg-muted/20" />
              </div>
            )}

            {form.role === "Faculty" && (
              <div className="space-y-2 border-t border-border/20 pt-4">
                <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Assigned Subjects</Label>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.subjects && form.subjects.length > 0 ? (
                    form.subjects.map((sub: string) => (
                      <Badge key={sub} variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-secondary/15 text-secondary border-secondary/20 hover:bg-secondary/20 rounded-lg transition-colors">
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setForm(prev => ({
                              ...prev,
                              subjects: prev.subjects.filter(s => s !== sub)
                            }));
                          }}
                          className="hover:text-destructive transition-colors text-[10px] font-bold"
                        >
                          ✕
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic ml-1">No subjects assigned yet.</span>
                  )}
                </div>

                <select
                  className="flex h-10 w-full rounded-xl border border-border/40 bg-muted/20 px-3 py-2 text-sm focus-visible:outline-none font-bold"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !form.subjects.includes(val)) {
                      setForm(prev => ({
                        ...prev,
                        subjects: [...prev.subjects, val]
                      }));
                    }
                    e.target.value = "";
                  }}
                >
                  <option value="">Assign new subject...</option>
                  {availableSubjects
                    .filter((sub: any) => !form.subjects.includes(sub.name))
                    .map((sub: any) => (
                      <option key={sub._id} value={sub.name}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                </select>
              </div>
            )}

            <Button type="submit" className="w-full mt-4 h-12 rounded-2xl bg-gradient-primary shadow-glow text-white font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]">
              {editing ? "Commit Identity Changes" : "Initialize Account"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* View User Details Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="rounded-3xl border-0 shadow-2xl glass-effect p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-primary">User Information Card</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center gap-4 border-b border-border/20 pb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-black text-lg">
                  {(viewingUser.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-base leading-tight">{viewingUser.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{viewingUser.email}</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between border-b border-border/10 py-1">
                  <span className="font-medium text-muted-foreground">User ID:</span>
                  <span className="font-mono text-foreground font-semibold">{viewingUser._id}</span>
                </div>
                <div className="flex justify-between border-b border-border/10 py-1">
                  <span className="font-medium text-muted-foreground">System Role:</span>
                  <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-xs font-bold">{viewingUser.role}</Badge>
                </div>
                <div className="flex justify-between border-b border-border/10 py-1">
                  <span className="font-medium text-muted-foreground">Department:</span>
                  <span className="font-semibold text-foreground">{viewingUser.department || "General"}</span>
                </div>
                {viewingUser.role === "Student" && (
                  <>
                    <div className="flex justify-between border-b border-border/10 py-1">
                      <span className="font-medium text-muted-foreground">Semester:</span>
                      <span className="font-semibold text-foreground">Semester {viewingUser.semester || "1"}</span>
                    </div>
                    {viewingUser.rollNumber && (
                      <div className="flex justify-between border-b border-border/10 py-1">
                        <span className="font-medium text-muted-foreground">Roll Number:</span>
                        <span className="font-semibold text-foreground">{viewingUser.rollNumber}</span>
                      </div>
                    )}
                  </>
                )}
                {viewingUser.role === "Faculty" && (
                  <>
                    <div className="flex justify-between border-b border-border/10 py-1">
                      <span className="font-medium text-muted-foreground">Designation:</span>
                      <span className="font-semibold text-foreground">{viewingUser.designation || "Faculty Member"}</span>
                    </div>
                    <div className="border-b border-border/10 py-1.5 space-y-1">
                      <span className="font-medium text-muted-foreground block">Assigned Academic Subjects:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {viewingUser.subjects && viewingUser.subjects.length > 0 ? (
                          viewingUser.subjects.map((sub: string) => (
                            <Badge key={sub} variant="secondary" className="px-2 py-0.5 bg-secondary/15 text-secondary border-0 text-[11px] font-semibold">{sub}</Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No subjects currently assigned.</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-b border-border/10 py-1">
                  <span className="font-medium text-muted-foreground">Account Created:</span>
                  <span className="text-foreground">{new Date(viewingUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Button onClick={() => setViewOpen(false)} className="w-full mt-4 h-11 rounded-xl bg-muted/40 font-bold text-foreground hover:bg-muted/60 transition-all border border-border/40">
                Dismiss Card
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin Password Reset Confirmation Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="rounded-3xl border-0 shadow-2xl glass-effect p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-primary">
              Confirm Password Reset
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to reset the password for <strong className="text-foreground">{resettingUser?.name}</strong> (<span className="text-xs">{resettingUser?.email}</span>)?
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-2xl flex gap-3 text-xs text-yellow-600 font-medium">
              <Shield className="w-5 h-5 flex-shrink-0" />
              <span>A new random 8-digit alphanumeric password will be generated, updated in the database, and automatically sent to their registered email address.</span>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setResetOpen(false)}
                className="w-1/2 h-12 rounded-2xl border border-border/40 font-black uppercase text-[10px] tracking-wider hover:bg-muted/20"
                disabled={resetLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleResetPassword}
                className="w-1/2 h-12 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-black uppercase text-[10px] tracking-wider shadow-glow"
                disabled={resetLoading}
              >
                {resetLoading ? "Resetting..." : "Confirm Reset"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserRecords;
