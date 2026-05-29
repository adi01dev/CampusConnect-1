// This part will be completely replaced by the functional part below with updated styling


import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Database,
  Settings,
  Shield,
  HardDrive,
  Activity,
  FileText,
  Cloud,
  Server,
  Monitor,
  UserPlus,
  Trash2,
  Eye,
  Briefcase,
  Check,
  X,
  FileSpreadsheet,
  PlusCircle,
  Key,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [mous, setMous] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [mouOpen, setMouOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resettingUser, setResettingUser] = useState<any>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!resettingUser) return;
    try {
      setResetLoading(true);
      const res = await fetch(`${API_BASE}/admin/users/${resettingUser._id}/reset-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Password Reset Success",
          description: `A new random 8-character password has been generated and emailed to ${resettingUser.name}.`,
        });
        setResetOpen(false);
        setResettingUser(null);
      } else {
        throw new Error(data.message || "Failed to reset password");
      }
    } catch (err: any) {
      toast({ title: "Reset Failed", description: err.message, variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  };

  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);

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

  const [formMoU, setFormMoU] = useState({
    organization: "",
    type: "Industry Partnership",
    contact: "",
    duration: "1 year",
    purpose: "",
    benefits: "",
    coordinatorId: "",
  });

  const token = localStorage.getItem("accessToken");

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast({ title: "Failed to fetch users", variant: "destructive" });
    }
  };

  const fetchMous = async () => {
    try {
      const res = await fetch(`${API_BASE}/mou`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMous(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ title: "Failed to fetch MoUs", variant: "destructive" });
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
    fetchMous();
    fetchSubjects();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${API_BASE}/admin/users/${editing._id}`
      : `${API_BASE}/admin/users`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast({ title: editing ? "User updated" : "User added" });
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
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    await fetch(`${API_BASE}/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchUsers();
    toast({ title: "User deleted" });
  };

  const handleSubmitMoU = async (e: any) => {
    e.preventDefault();
    if (!formMoU.organization || !formMoU.type || !formMoU.coordinatorId) {
      toast({ title: "Validation Error", description: "Please enter all required fields", variant: "destructive" });
      return;
    }

    const selectedFaculty = users.find(u => u._id === formMoU.coordinatorId);
    if (!selectedFaculty) {
      toast({ title: "Error", description: "Selected Faculty Coordinator not found", variant: "destructive" });
      return;
    }

    try {
      // 1. Create MoU record
      const resMoU = await fetch(`${API_BASE}/mou`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          organization: formMoU.organization,
          type: formMoU.type,
          contact: formMoU.contact,
          duration: formMoU.duration,
          purpose: formMoU.purpose,
          benefits: formMoU.benefits,
          submittedBy: selectedFaculty.name,
        }),
      });

      if (!resMoU.ok) {
        const err = await resMoU.json();
        throw new Error(err.message || "Failed to create MoU record");
      }

      // 2. Update Faculty designation to isMoUCoordinator = true
      const resUser = await fetch(`${API_BASE}/admin/users/${selectedFaculty._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: selectedFaculty.name,
          email: selectedFaculty.email,
          role: selectedFaculty.role,
          department: selectedFaculty.department,
          semester: selectedFaculty.semester,
          subjects: selectedFaculty.subjects,
          isMoUCoordinator: true,
        }),
      });

      if (!resUser.ok) {
        const err = await resUser.json();
        throw new Error(err.message || "Failed to designate Faculty coordinator");
      }

      toast({ title: "MoU successfully added", description: `Assigned as coordinator: ${selectedFaculty.name}` });
      setMouOpen(false);
      setFormMoU({
        organization: "",
        type: "Industry Partnership",
        contact: "",
        duration: "1 year",
        purpose: "",
        benefits: "",
        coordinatorId: "",
      });
      fetchMous();
      fetchUsers(); // Refresh users list so the dropdown filters out the newly assigned coordinator
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE}/mou/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast({ title: `MoU status updated to ${newStatus.toUpperCase()}` });
        fetchMous();
      } else {
        throw new Error("Failed to update MoU status");
      }
    } catch (err: any) {
      toast({ title: "Status Update Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <motion.div
      className="space-y-8 p-6 academic-pattern rounded-3xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <BreadcrumbNav />

      {/* Welcome Hero */}
      <div className="bg-gradient-premium rounded-3xl p-8 text-white shadow-elegant relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3 tracking-tighter">System Administration Portal</h1>
            <p className="text-white/80 text-lg max-w-2xl leading-relaxed">
              Managing <span className="text-white font-black underline decoration-white/30 decoration-2 underline-offset-4">{users.length} active users</span> across the CampusConnect platform.
            </p>
            <div className="flex flex-wrap items-center gap-6 mt-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                <Shield className="w-5 h-5 text-white animate-pulse" />
                <span className="text-sm font-black uppercase tracking-widest">Root Administrator</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                <Server className="w-5 h-5 text-white" />
                <span className="text-sm font-black uppercase tracking-widest">System: Stable</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block bg-white/10 backdrop-blur-2xl p-6 rounded-3xl border border-white/20 shadow-glow text-center">
            <Monitor className="w-10 h-10 mx-auto mb-2 opacity-80" />
            <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-60">System Uptime</p>
            <p className="text-3xl font-black">99.9%</p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: users.length.toString(), icon: Users, color: 'bg-gradient-primary', status: 'Online' },
          { label: 'Database', value: '2.4 GB', icon: Database, color: 'bg-gradient-secondary', status: '92% Full' },
          { label: 'System Health', value: '100%', icon: Activity, color: 'bg-success/80', status: 'Stable' },
          { label: 'Cloud Storage', value: '68%', icon: HardDrive, color: 'bg-gradient-hero', status: 'Active' }
        ].map((stat, i) => (
          <Card key={i} className="glass-effect border-0 shadow-card hover-lift overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-2xl shadow-glow group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/10 bg-primary/5">{stat.status}</Badge>
              </div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-foreground mt-1">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* User Management Table Section */}
        <div className="xl:col-span-2">
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-muted/30 border border-border/40 rounded-2xl p-1.5 shadow-soft">
              <TabsTrigger value="users" className="rounded-xl font-black uppercase text-[10px] tracking-[0.15em]">User Directory</TabsTrigger>
              <TabsTrigger value="mous" className="rounded-xl font-black uppercase text-[10px] tracking-[0.15em]">MoU Registry</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="animate-fade-in-up mt-0">
              <Card className="glass-effect border-0 shadow-elegant overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-elegant border-b border-border/10">
                  <CardTitle className="flex items-center gap-2 text-primary font-black uppercase tracking-tighter">
                    <Users className="w-5 h-5" />
                    Identity & Access Management
                  </CardTitle>
                  <Button size="sm" onClick={() => {
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
                  }} className="rounded-xl shadow-glow-primary font-black uppercase text-[10px] tracking-widest">
                    <UserPlus className="w-4 h-4 mr-2" /> Add User
                  </Button>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    {users.length === 0 ? (
                      <div className="text-center py-12 opacity-40">Loading platform users...</div>
                    ) : users.map((u) => (
                      <div key={u._id} className="group flex items-center justify-between p-4 bg-gradient-card rounded-2xl border border-border/40 hover-lift hover-border transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-black text-sm shadow-glow group-hover:rotate-[360deg] transition-transform duration-700">
                            {(u.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-foreground group-hover:text-primary transition-colors leading-none">{u.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-[9px] font-black uppercase px-2 py-0 ${u.role === 'Admin' ? 'border-primary/40 bg-primary/10 text-primary' : 'border-secondary/40 bg-secondary/10 text-secondary'}`}>
                                {u.role}
                              </Badge>
                              {u.isMoUCoordinator && (
                                <Badge variant="outline" className="text-[9px] font-black uppercase px-2 py-0 border-green-400 bg-green-50 text-green-700 ml-1">
                                  MoU Coordinator
                                </Badge>
                              )}
                              <span className="text-[10px] font-medium text-muted-foreground">{u.department || "No Department"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => { setViewingUser(u); setViewOpen(true); }}
                            className="p-2 rounded-xl bg-muted/40 hover:bg-primary hover:text-white transition-all shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditing(u);
                              setForm({
                                name: u.name,
                                email: u.email,
                                password: "",
                                role: u.role,
                                department: u.department || "",
                                semester: u.semester || "",
                                subjects: u.subjects || [],
                              });
                              setOpen(true);
                            }}
                            className="p-2 rounded-xl bg-muted/40 hover:bg-secondary hover:text-white transition-all shadow-sm"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setResettingUser(u);
                              setResetOpen(true);
                            }}
                            className="p-2 rounded-xl bg-muted/40 hover:bg-yellow-500 hover:text-white transition-all shadow-sm"
                            title="Reset Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="p-2 rounded-xl bg-muted/40 hover:bg-destructive hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4 text-destructive group-hover:text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mous" className="animate-fade-in-up mt-0">
              <Card className="glass-effect border-0 shadow-elegant overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-elegant border-b border-border/10">
                  <CardTitle className="flex items-center gap-2 text-secondary font-black uppercase tracking-tighter">
                    <Briefcase className="w-5 h-5 text-secondary" />
                    Partnership Agreements (MoU)
                  </CardTitle>
                  <Button size="sm" onClick={() => setMouOpen(true)} className="rounded-xl shadow-glow-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90 font-black uppercase text-[10px] tracking-widest">
                    <PlusCircle className="w-4 h-4 mr-2" /> Add MoU
                  </Button>
                </CardHeader>

                <CardContent className="p-4">
                  <div className="space-y-4">
                    {mous.length === 0 ? (
                      <div className="text-center py-12 opacity-40">No Memorandum of Understanding recorded.</div>
                    ) : mous.map((m) => (
                      <div key={m._id} className="group relative p-5 bg-gradient-card rounded-2xl border border-border/40 hover-lift hover-border transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-black text-foreground group-hover:text-primary transition-colors text-lg">{m.organization}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[9px] font-black uppercase">{m.type}</Badge>
                              <Badge variant="outline" className="text-[9px] font-semibold">{m.duration}</Badge>
                            </div>
                          </div>
                          
                          <Badge variant="outline" className={`text-[10px] font-black px-2.5 py-0.5 border-none uppercase ${
                            m.status === 'approved' ? 'bg-green-50 text-green-700' :
                            m.status === 'rejected' ? 'bg-red-50 text-red-700' :
                            'bg-orange-50 text-orange-700'
                          }`}>
                            {m.status}
                          </Badge>
                        </div>

                        <div className="text-xs space-y-1.5 text-muted-foreground border-l-2 border-primary/20 pl-3 leading-relaxed">
                          <p><strong>Objectives:</strong> {m.purpose}</p>
                          {m.benefits && <p><strong>Benefits:</strong> {m.benefits}</p>}
                          <p className="text-[11px] text-foreground font-semibold flex items-center gap-1.5 mt-2">
                            <Users className="w-3.5 h-3.5 text-secondary" />
                            Coordinator: {m.submittedBy || 'Unassigned'}
                          </p>
                        </div>

                        <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-border/10">
                          {m.status !== 'approved' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusUpdate(m._id, "approved")}
                              className="h-8 text-green-600 hover:bg-green-50 rounded-lg text-xs"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" /> Approve
                            </Button>
                          )}
                          {m.status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatusUpdate(m._id, "rejected")}
                              className="h-8 text-red-600 hover:bg-red-50 rounded-lg text-xs"
                            >
                              <X className="w-3.5 h-3.5 mr-1" /> Reject
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* System Logs & Actions */}
        <div className="space-y-8">
          <Card className="glass-effect border-0 shadow-elegant overflow-hidden">
            <CardHeader className="bg-gradient-elegant border-b border-border/10">
              <CardTitle className="flex items-center gap-2 text-primary font-black uppercase tracking-tighter">
                <Settings className="w-5 h-5" />
                Global Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { label: 'Platform Backup', icon: Database, color: 'text-primary' },
                { label: 'Security Audit', icon: Shield, color: 'text-secondary' },
                { label: 'System Logs', icon: FileText, color: 'text-success' },
                { label: 'Deploy Updates', icon: Cloud, color: 'text-warning' }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="w-full justify-start gap-4 p-6 rounded-2xl bg-gradient-card border-border/40 hover-lift hover-border transition-all">
                  <div className={`${action.color} bg-current/10 p-2 rounded-xl`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="font-black uppercase text-[10px] tracking-widest">{action.label}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs remain functional with basic styling updates if needed */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-3xl border-0 shadow-2xl glass-effect p-8">
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
                <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Email Protocol</Label>
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
                <select className="flex h-10 w-full rounded-xl border border-border/40 bg-muted/20 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-bold" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
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
                      <Badge key={sub} variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20 rounded-lg transition-colors">
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

            <Button type="submit" className="w-full mt-4 h-12 rounded-2xl bg-gradient-primary shadow-glow-primary font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]">
              {editing ? "Commit Identity Changes" : "Initialize Account"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* View User Details Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="space-y-2">
              <p><strong>Name:</strong> {viewingUser.name}</p>
              <p><strong>Email:</strong> {viewingUser.email}</p>
              <p><strong>Role:</strong> {viewingUser.role}</p>
              {viewingUser.department && (
                <p><strong>Department:</strong> {viewingUser.department}</p>
              )}
              {viewingUser.semester && (
                <p><strong>Semester:</strong> {viewingUser.semester}</p>
              )}
              <p><strong>Created At:</strong> {new Date(viewingUser.createdAt).toLocaleString()}</p>
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
                className="w-1/2 h-12 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-black uppercase text-[10px] tracking-wider shadow-glow-destructive"
                disabled={resetLoading}
              >
                {resetLoading ? "Resetting..." : "Confirm Reset"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create MoU Dialog */}
      <Dialog open={mouOpen} onOpenChange={setMouOpen}>
        <DialogContent className="rounded-3xl border-0 shadow-2xl glass-effect p-8 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-secondary">
              Add MoU Collaboration
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitMoU} className="space-y-4 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Organization Name</Label>
                <Input
                  value={formMoU.organization}
                  onChange={(e) => setFormMoU({ ...formMoU, organization: e.target.value })}
                  className="rounded-xl border-border/40 bg-muted/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">MoU Type</Label>
                <select
                  className="flex h-10 w-full rounded-xl border border-border/40 bg-muted/20 px-3 py-2 text-sm focus-visible:outline-none font-bold"
                  value={formMoU.type}
                  onChange={(e) => setFormMoU({ ...formMoU, type: e.target.value })}
                >
                  <option>Industry Partnership</option>
                  <option>Academic Collaboration</option>
                  <option>Technology Partnership</option>
                  <option>Research Collaboration</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Contact Protocol</Label>
                <Input
                  value={formMoU.contact}
                  onChange={(e) => setFormMoU({ ...formMoU, contact: e.target.value })}
                  className="rounded-xl border-border/40 bg-muted/20"
                  placeholder="email@partner.org"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Duration</Label>
                <select
                  className="flex h-10 w-full rounded-xl border border-border/40 bg-muted/20 px-3 py-2 text-sm focus-visible:outline-none font-bold"
                  value={formMoU.duration}
                  onChange={(e) => setFormMoU({ ...formMoU, duration: e.target.value })}
                >
                  <option>1 year</option>
                  <option>2 years</option>
                  <option>3 years</option>
                  <option>5 years</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Faculty Coordinator</Label>
              <select
                className="flex h-10 w-full rounded-xl border border-border/40 bg-muted/20 px-3 py-2 text-sm focus-visible:outline-none font-bold"
                value={formMoU.coordinatorId}
                onChange={(e) => setFormMoU({ ...formMoU, coordinatorId: e.target.value })}
                required
              >
                <option value="">Choose designated faculty...</option>
                {users
                  .filter((u: any) => u.role === "Faculty" && !u.isMoUCoordinator)
                  .map((faculty: any) => (
                    <option key={faculty._id} value={faculty._id}>
                      {faculty.name} {faculty.department ? `(${faculty.department})` : ""}
                    </option>
                  ))}
              </select>
              <p className="text-[10px] text-muted-foreground ml-1">
                Only shows faculty members not currently serving as MoU coordinators.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Objectives & Purpose</Label>
              <Textarea
                value={formMoU.purpose}
                onChange={(e) => setFormMoU({ ...formMoU, purpose: e.target.value })}
                className="rounded-xl border-border/40 bg-muted/20 min-h-[60px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Expected Benefits</Label>
              <Textarea
                value={formMoU.benefits}
                onChange={(e) => setFormMoU({ ...formMoU, benefits: e.target.value })}
                className="rounded-xl border-border/40 bg-muted/20 min-h-[40px]"
              />
            </div>

            <Button type="submit" className="w-full mt-4 h-12 rounded-2xl bg-secondary text-secondary-foreground shadow-glow-secondary font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]">
              Establish Partnership
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminDashboard;
