import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Calendar, Users, CheckCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const BACKEND_URL = API_BASE.replace('/api', '');

const Assignments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjectsList] = useState<string[]>([
    'Data Structures',
    'Machine Learning',
    'Database Systems',
    'Algorithms',
    'Software Engineering'
  ]);
  const token = localStorage.getItem("accessToken");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subject: "Data Structures",
    dueDate: "",
    totalMarks: "",
    instructions: ""
  });

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${API_BASE}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setAssignments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchAssignments();
  }, [token]);

  const handleCreate = async () => {
    if (!formData.title || !formData.subject || !formData.dueDate || !formData.totalMarks) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        ...formData,
        totalMarks: Number(formData.totalMarks)
      };

      const res = await fetch(`${API_BASE}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Success", description: "Assignment created" });
        setShowCreateForm(false);
        setFormData({ title: "", subject: "Data Structures", dueDate: "", totalMarks: "", instructions: "" }); // Reset form
        fetchAssignments();
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to create assignment", variant: "destructive" });
    }
  };

  const totalSubmissions = assignments.reduce((acc, a) => acc + (a.submissions?.length || 0), 0);
  const pendingGrading = assignments.reduce((acc, a) => acc + (a.submissions?.filter((s: any) => s.grade === undefined || s.grade === null).length || 0), 0);

  const stats = [
    { label: "Active Assignments", value: assignments.length.toString(), icon: FileText, color: "text-blue-600" },
    { label: "Total Submissions", value: totalSubmissions.toString(), icon: CheckCircle, color: "text-green-600" },
    { label: "Pending Grading", value: pendingGrading.toString(), icon: Clock, color: "text-orange-600" },
    { label: "Total Students", value: "N/A", icon: Users, color: "text-purple-600" },
  ];

  const [viewSubmissions, setViewSubmissions] = useState<any | null>(null);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  /* Grading State */
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const [gradeInput, setGradeInput] = useState("");
  const [feedbackInput, setFeedbackInput] = useState("");

  const handleGradeClick = (submission: any) => {
    setGradingSubmission(submission);
    setGradeInput(submission.grade || "");
    setFeedbackInput(submission.feedback || "");
  };

  const submitGrade = async () => {
    if (!gradingSubmission || !viewSubmissions) return;

    try {
      const res = await fetch(`${API_BASE}/assignments/${viewSubmissions._id}/submissions/${gradingSubmission.studentId}/grade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ grade: gradeInput, feedback: feedbackInput })
      });

      if (res.ok) {
        toast({ title: "Success", description: "Grade updated" });
        setGradingSubmission(null);
        // Refresh submissions list
        handleViewSubmissions(viewSubmissions);
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to submit grade", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/assignments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast({ title: "Success", description: "Assignment deleted" });
        setDeleteConfirmation(null);
        fetchAssignments();
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete assignment", variant: "destructive" });
    }
  };

  const handleViewSubmissions = async (assignment: any) => {
    setViewSubmissions(assignment);
    try {
      const res = await fetch(`${API_BASE}/assignments/${assignment._id}/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSubmissionsList(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadSubmission = async (studentId: string, studentName: string) => {
    if (!viewSubmissions) return;
    try {
      const response = await fetch(`${API_BASE}/assignments/${viewSubmissions._id}/submissions/${studentId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `${studentName}_assignment.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      toast({ title: "Success", description: "Download started" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to download submission", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Assignments
            </h1>
            <p className="text-muted-foreground mt-1">Create and manage course assignments</p>
          </div>
          <div className="flex gap-3">
            <Button className="gap-2" onClick={() => setShowCreateForm(!showCreateForm)}>
              <Plus className="h-4 w-4" />
              Create Assignment
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
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

        {/* Create Assignment Form */}
        {showCreateForm && (
          <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Create New Assignment
              </CardTitle>
              <CardDescription>Design a new assignment for your students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Assignment Title</label>
                  <Input
                    placeholder="Enter assignment title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select
                    value={formData.subject}
                    onValueChange={val => setFormData({ ...formData, subject: val })}
                  >
                    <SelectTrigger className="w-full bg-background border-input text-foreground">
                      <SelectValue placeholder="Select subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectsList.map((s) => {
                        const name = typeof s === 'string' ? s : s.name;
                        const id = typeof s === 'string' ? s : (s._id || s.id);
                        return (
                          <SelectItem key={id} value={name}>
                            {name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Marks</label>
                  <Input
                    type="number"
                    placeholder="Enter total marks"
                    value={formData.totalMarks}
                    onChange={e => setFormData({ ...formData, totalMarks: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Instructions</label>
                  <Textarea
                    placeholder="Enter assignment instructions and requirements"
                    rows={6}
                    value={formData.instructions}
                    onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={handleCreate}>Create Assignment</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assignments List */}
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <Card key={assignment._id} className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-xl">{assignment.title}</h3>
                      <Badge variant="default" className="bg-blue-600">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(assignment.dueDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Marks</p>
                    <p className="font-medium">{assignment.totalMarks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Submissions</p>
                    <p className="font-medium">{assignment.submissions?.length || 0}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleViewSubmissions(assignment)}>
                    View Submissions
                  </Button>
                  <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteConfirmation(assignment._id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View Submissions Dialog */}
        {viewSubmissions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto bg-background/95 border-border">
              <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-background/95 z-10 border-b">
                <div>
                  <CardTitle>Submissions: {viewSubmissions.title}</CardTitle>
                  <CardDescription>Total Submissions: {submissionsList.length}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setViewSubmissions(null)}>
                  <span className="text-xl">×</span>
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                {submissionsList.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">No submissions yet</div>
                ) : (
                  <div className="space-y-4">
                    {submissionsList.map((sub, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {sub.studentName?.charAt(0) || "S"}
                          </div>
                          <div>
                            <p className="font-medium">{sub.studentName}</p>
                            <p className="text-sm text-muted-foreground">
                              Submitted: {new Date(sub.submittedAt).toLocaleString()}
                            </p>
                            {sub.grade !== undefined && sub.grade !== null && (
                              <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800 border-green-200">
                                Grade: {sub.grade}/{viewSubmissions.totalMarks}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {sub.fileUrl && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const cleanUrl = sub.fileUrl.replace(/^\/+/, '');
                                  const fullUrl = sub.fileUrl.startsWith('http') ? sub.fileUrl : `${BACKEND_URL}/${cleanUrl}`;
                                  window.open(fullUrl, '_blank');
                                }}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-primary hover:bg-primary/5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadSubmission(sub.studentId, sub.studentName);
                                }}
                              >
                                Download
                              </Button>
                            </>
                          )}
                          <Button size="sm" onClick={() => handleGradeClick(sub)}>
                            {sub.grade ? "Edit Grade" : "Grade"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Grading Dialog */}
        {gradingSubmission && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md bg-background border-border shadow-lg">
              <CardHeader>
                <CardTitle>Grade Submission</CardTitle>
                <CardDescription>Grading for {gradingSubmission.studentName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Grade (Calculated out of {viewSubmissions?.totalMarks})</label>
                  <Input
                    type="number"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    max={viewSubmissions?.totalMarks}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Feedback (Optional)</label>
                  <Textarea
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Good work..."
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => setGradingSubmission(null)}>Cancel</Button>
                  <Button onClick={submitGrade}>Save Grade</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md bg-background border-border">
              <CardHeader>
                <CardTitle>Delete Assignment?</CardTitle>
                <CardDescription>This action cannot be undone. All student submissions will be lost.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => handleDelete(deleteConfirmation)}>Delete</Button>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
};

export default Assignments;
