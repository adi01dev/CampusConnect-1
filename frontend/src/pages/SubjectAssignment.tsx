import { motion } from 'framer-motion';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Plus, BookOpen, User, Clock, Calendar, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const SubjectAssignment = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  
  // States
  const [subjects, setSubjects] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog States
  const [addOpen, setAddOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  
  // Add Subject Form State
  const [addForm, setAddForm] = useState({
    name: '',
    code: '',
    department: 'Computer Science',
    credits: '3',
    semester: 'Semester 1'
  });

  const token = localStorage.getItem("accessToken");

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Subjects
      const subRes = await fetch(`${API_BASE}/admin/subjects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const subData = await subRes.json();
      setSubjects(Array.isArray(subData) ? subData : []);

      // 2. Fetch Users to get Faculty list
      const userRes = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = await userRes.json();
      if (Array.isArray(userData)) {
        setFaculties(userData.filter((u: any) => u.role === 'Faculty'));
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch data from database", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.code) {
      toast({ title: "Validation Error", description: "Name and code are required", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: addForm.name,
          code: addForm.code,
          department: addForm.department,
          credits: Number(addForm.credits),
          semester: addForm.semester
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Success", description: `Subject "${addForm.name}" created successfully` });
        setAddOpen(false);
        setAddForm({
          name: '',
          code: '',
          department: 'Computer Science',
          credits: '3',
          semester: 'Semester 1'
        });
        fetchData();
      } else {
        toast({ title: "Error", description: data.message || "Failed to create subject", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/subjects/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast({ title: "Deleted", description: "Subject has been deleted" });
        fetchData();
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.message || "Failed to delete subject", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleAssignFaculty = async () => {
    if (!selectedFacultyId || !selectedSubject) return;

    const facultyMember = faculties.find(f => f._id === selectedFacultyId);
    if (!facultyMember) return;

    const currentSubjects = facultyMember.subjects || [];
    if (currentSubjects.includes(selectedSubject.name)) {
      toast({ title: "Info", description: "Subject is already assigned to this faculty member" });
      setAssignOpen(false);
      return;
    }

    const updatedSubjects = [...currentSubjects, selectedSubject.name];

    try {
      const res = await fetch(`${API_BASE}/admin/users/${selectedFacultyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...facultyMember,
          subjects: updatedSubjects
        })
      });
      if (res.ok) {
        toast({ title: "Success", description: `Assigned "${selectedSubject.name}" to ${facultyMember.name}` });
        setAssignOpen(false);
        setSelectedFacultyId('');
        fetchData();
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.message || "Failed to assign subject", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Find which faculty is assigned to a subject
  const getAssignedFaculty = (subjectName: string) => {
    const assigned = faculties.filter(f => f.subjects?.includes(subjectName));
    return assigned.map(f => f.name).join(', ') || 'Unassigned';
  };

  const filteredSubjects = subjects.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          sub.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSemester = selectedSemester === 'all' || 
                            sub.semester?.toLowerCase().replace(/\s+/g, '') === selectedSemester.toLowerCase().replace(/\s+/g, '');
    return matchesSearch && matchesSemester;
  });

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
            Subject Assignment
          </h1>
          <p className="text-muted-foreground mt-2">Manage college subjects and assign them dynamically to faculty</p>
        </div>
        <Button className="glass-card" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Subject
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Subjects</p>
                <p className="text-2xl font-bold">{subjects.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Faculty</p>
                <p className="text-2xl font-bold text-green-500">{faculties.length}</p>
              </div>
              <User className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Loads</p>
                <p className="text-2xl font-bold text-orange-500">
                  {faculties.reduce((acc, f) => acc + (f.subjects?.length || 0), 0)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Load</p>
                <p className="text-2xl font-bold">
                  {faculties.length > 0 ? (faculties.reduce((acc, f) => acc + (f.subjects?.length || 0), 0) / faculties.length).toFixed(1) : 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Subjects Registry</CardTitle>
              <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subjects by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    <SelectItem value="Semester 1">Semester 1</SelectItem>
                    <SelectItem value="Semester 2">Semester 2</SelectItem>
                    <SelectItem value="Semester 3">Semester 3</SelectItem>
                    <SelectItem value="Semester 4">Semester 4</SelectItem>
                    <SelectItem value="Semester 5">Semester 5</SelectItem>
                    <SelectItem value="Semester 6">Semester 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading subjects...</p>
                ) : filteredSubjects.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No subjects found in the database.</p>
                ) : (
                  filteredSubjects.map((subject, index) => {
                    const assignedFaculty = getAssignedFaculty(subject.name);
                    return (
                      <motion.div
                        key={subject._id}
                        className="p-4 border rounded-lg glass-card hover:bg-accent/50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{subject.name}</h3>
                              <Badge variant="outline">{subject.code}</Badge>
                              <Badge variant={assignedFaculty !== 'Unassigned' ? 'default' : 'secondary'}>
                                {assignedFaculty !== 'Unassigned' ? 'Assigned' : 'Pending'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div>
                                <p><span className="font-medium">Faculty:</span> {assignedFaculty}</p>
                                <p><span className="font-medium">Department:</span> {subject.department}</p>
                              </div>
                              <div>
                                <p><span className="font-medium">Semester:</span> {subject.semester || 'N/A'}</p>
                                <p><span className="font-medium">Credits:</span> {subject.credits || 3}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="glass-card" 
                              onClick={() => {
                                setSelectedSubject(subject);
                                setAssignOpen(true);
                              }}
                            >
                              Assign
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteSubject(subject._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Faculty Workload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faculties.length === 0 ? (
                  <p className="text-center text-sm py-4 text-muted-foreground">No faculty members found.</p>
                ) : (
                  faculties.map((faculty, index) => (
                    <motion.div
                      key={faculty._id}
                      className="flex items-center gap-3 p-3 border rounded-lg glass-card"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${faculty.name}`} />
                        <AvatarFallback className="text-xs">{faculty.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{faculty.name}</p>
                        <p className="text-xs text-muted-foreground">{faculty.department || 'General'}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {faculty.subjects?.length || 0} subjects
                      </Badge>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Subject Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subName">Subject Name</Label>
              <Input 
                id="subName" 
                placeholder="e.g. Theory of Computation" 
                value={addForm.name} 
                onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subCode">Subject Code</Label>
              <Input 
                id="subCode" 
                placeholder="e.g. CSE304" 
                value={addForm.code} 
                onChange={e => setAddForm({ ...addForm, code: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subDept">Department</Label>
              <Select 
                value={addForm.department} 
                onValueChange={val => setAddForm({ ...addForm, department: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Mechanical">Mechanical</SelectItem>
                  <SelectItem value="Civil">Civil</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subCredits">Credits</Label>
                <Input 
                  id="subCredits" 
                  type="number"
                  placeholder="3" 
                  value={addForm.credits} 
                  onChange={e => setAddForm({ ...addForm, credits: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subSem">Semester</Label>
                <Select 
                  value={addForm.semester} 
                  onValueChange={val => setAddForm({ ...addForm, semester: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semester 1">Semester 1</SelectItem>
                    <SelectItem value="Semester 2">Semester 2</SelectItem>
                    <SelectItem value="Semester 3">Semester 3</SelectItem>
                    <SelectItem value="Semester 4">Semester 4</SelectItem>
                    <SelectItem value="Semester 5">Semester 5</SelectItem>
                    <SelectItem value="Semester 6">Semester 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit">Create Subject</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Subject Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Subject to Faculty</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select a faculty member to teach <strong className="text-foreground">{selectedSubject?.name}</strong> ({selectedSubject?.code}).
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="facSelect">Choose Faculty Coordinator</Label>
              <Select value={selectedFacultyId} onValueChange={setSelectedFacultyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty member..." />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((f) => (
                    <SelectItem key={f._id} value={f._id}>
                      {f.name} ({f.department || 'General'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
              <Button type="button" onClick={handleAssignFaculty} disabled={!selectedFacultyId}>Assign Workload</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default SubjectAssignment;