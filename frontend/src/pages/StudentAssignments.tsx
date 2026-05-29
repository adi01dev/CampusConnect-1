import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Clock, CheckCircle, AlertCircle, Search, Calendar, X, RefreshCw } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { saveOfflineSubmission, getOfflineSubmissions } from "@/lib/offlineStore";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const BACKEND_URL = API_BASE.replace('/api', '');

const StudentAssignments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get active tab from URL query param
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get('tab') || 'all';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [submissionDialog, setSubmissionDialog] = useState(false);
  const [submittingAssignment, setSubmittingAssignment] = useState<any | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [token] = useState(localStorage.getItem("accessToken"));
  const [offlineSubmissions, setOfflineSubmissions] = useState<any[]>([]);

  const refreshOfflineSubmissions = async () => {
    try {
      const records = await getOfflineSubmissions();
      setOfflineSubmissions(records);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshOfflineSubmissions();
    const handleSync = () => {
      refreshOfflineSubmissions();
      fetchAssignments();
    };
    window.addEventListener("pwa-sync-status", handleSync);
    window.addEventListener("pwa-data-synced", handleSync);
    return () => {
      window.removeEventListener("pwa-sync-status", handleSync);
      window.removeEventListener("pwa-data-synced", handleSync);
    };
  }, []);


  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${API_BASE}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const mapped = data.map((a: any) => ({
          id: a._id,
          title: a.title,
          subject: a.subject,
          dueDate: a.dueDate,
          // Backend now provides these fields (sanitized for student)
          status: a.status || "pending",
          marks: a.totalMarks,
          facultyName: a.faculty?.name || "Unknown Faculty",
          submittedOn: a.submittedOn,
          grade: a.grade,
          feedback: a.feedback,
          submissionText: a.mySubmission?.submissionText,
          submissionFile: a.mySubmission?.fileUrl,
          ...a
        }));
        // TODO: Logic to check if *this* student submitted needs `submissions` array check.
        // Assuming API returns `submissions` populated, we can optimize.
        // For now, mapping simplified.
        setAssignments(mapped);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) fetchAssignments();
  }, [token]);

  const handleSubmitAssignment = async () => {
    if (!submittingAssignment) return;

    setUploading(true);

    // PWA Offline Check and Buffer
    if (!navigator.onLine) {
      try {
        let fileData: string | null = null;
        let fileName: string | null = null;
        let fileType: string | null = null;

        if (selectedFile) {
          fileName = selectedFile.name;
          fileType = selectedFile.type;
          
          const reader = new FileReader();
          fileData = await new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const result = reader.result as string;
              const base64 = result.split(",")[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
        }

        await saveOfflineSubmission({
          assignmentId: submittingAssignment.id,
          submissionText,
          fileName,
          fileType,
          fileData,
          token: token || "",
          timestamp: Date.now()
        });

        toast({
          title: "Offline Submission Saved",
          description: "No internet detected. Coursework saved locally and will auto-sync when online."
        });

        setSubmissionDialog(false);
        setSubmittingAssignment(null);
        setSubmissionText("");
        setSelectedFile(null);
        refreshOfflineSubmissions();
      } catch (err) {
        console.error(err);
        toast({ title: "Failed to Queue Offline", description: "Could not cache coursework files", variant: "destructive" });
      } finally {
        setUploading(false);
      }
      return;
    }

    try {
      const formData = new FormData();
      if (submissionText) formData.append("submissionText", submissionText);
      if (selectedFile) formData.append("file", selectedFile);

      const res = await fetch(`${API_BASE}/assignments/${submittingAssignment.id}/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData // Content-Type handled automatically
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Success", description: "Assignment submitted successfully" });
        fetchAssignments(); // Refresh
        setSubmissionDialog(false);
        setSubmittingAssignment(null);
        setSubmissionText("");
        setSelectedFile(null);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Submission failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const pendingAssignments = assignments.filter(a => a.status === "pending");
  const submittedAssignments = assignments.filter(a => a.status === "submitted");
  const gradedAssignments = assignments.filter(a => a.status === "graded");
  const allSubmittedAssignments = assignments.filter(a => a.status === "submitted" || a.status === "graded");

  // Re-use existing filters...
  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- UI Helpers ---
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      pending: { variant: "outline", icon: Clock },
      submitted: { variant: "secondary", icon: Upload },
      graded: { variant: "default", icon: CheckCircle },
      overdue: { variant: "destructive", icon: AlertCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 100MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const openSubmissionDialog = (assignment: any) => {
    setSubmittingAssignment(assignment);
    setSubmissionDialog(true);
  };

  const handleDownloadMySubmission = async (assignment: any) => {
    try {
      if (!assignment.mySubmission) return;
      const response = await fetch(`${API_BASE}/assignments/${assignment.id}/submissions/${assignment.mySubmission.studentId}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', 'my_submission.pdf');
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              My Assignments
            </h1>
            <p className="text-muted-foreground mt-1">View and submit your course assignments</p>
          </div>
          <Button onClick={() => navigate('/my-courses')} variant="outline">
            View Courses
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="flex-1 backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
            </CardContent>
          </Card>
          <Card className="flex-1 backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingAssignments.length}</div>
            </CardContent>
          </Card>
          <Card className="flex-1 backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{submittedAssignments.length}</div>
            </CardContent>
          </Card>
          <Card className="flex-1 backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Graded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{gradedAssignments.length}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search assignments by title or subject..."
          className="pl-10 backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Assignments Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
          <TabsTrigger value="all">All Assignments</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(assignment.status)}
                    {offlineSubmissions.some(sub => sub.assignmentId === assignment.id) && (
                      <Badge className="gap-1 animate-pulse bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Sync Pending
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(assignment.dueDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Marks</p>
                    <p className="font-medium">{assignment.marks || assignment.totalMarks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Submitted On</p>
                    <p className="font-medium">
                      {assignment.submittedOn ? new Date(assignment.submittedOn).toLocaleDateString('en-IN') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Grade</p>
                    <p className="font-medium">{assignment.grade || '-'}</p>
                  </div>
                </div>

                <div className="flex justify-start gap-3">
                  {assignment.status === "pending" ? (
                    <Button className="gap-2 px-6" onClick={() => openSubmissionDialog(assignment)}>
                      <Upload className="h-4 w-4" />
                      Submit Assignment
                    </Button>
                  ) : (
                    <Button variant="outline" className="gap-2" disabled>
                      <CheckCircle className="h-4 w-4" />
                      Submitted
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedAssignment(assignment)}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingAssignments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No pending assignments</div>
          ) : (
            pendingAssignments.map((assignment) => (
              <Card key={assignment.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  {/* Reusing the same card structure for consistency, simplified for brevity here since logic is identical */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{assignment.title}</h3>
                        <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getStatusBadge(assignment.status)}
                      {offlineSubmissions.some(sub => sub.assignmentId === assignment.id) && (
                        <Badge className="gap-1 animate-pulse bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Sync Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(assignment.dueDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Marks</p>
                      <p className="font-medium">{assignment.marks || assignment.totalMarks}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Submitted On</p>
                      <p className="font-medium">-</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Grade</p>
                      <p className="font-medium">-</p>
                    </div>
                  </div>
                  <div className="flex justify-start gap-3">
                    <Button className="gap-2 px-6" onClick={() => openSubmissionDialog(assignment)}>
                      <Upload className="h-4 w-4" />
                      Submit Assignment
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedAssignment(assignment)}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          {allSubmittedAssignments.map((assignment) => (
            <Card key={assignment.id} className="border-0 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                {/* Reusing Card Structure */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(assignment.status)}
                    {offlineSubmissions.some(sub => sub.assignmentId === assignment.id) && (
                      <Badge className="gap-1 animate-pulse bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Sync Pending
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Due Date</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(assignment.dueDate).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Marks</p>
                    <p className="font-medium">{assignment.marks || assignment.totalMarks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Submitted On</p>
                    <p className="font-medium">
                      {assignment.submittedOn ? new Date(assignment.submittedOn).toLocaleDateString('en-IN') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Grade</p>
                    <p className="font-medium">{assignment.grade || '-'}</p>
                  </div>
                </div>
                <div className="flex justify-start gap-3">
                  <Button variant="outline" onClick={() => setSelectedAssignment(assignment)}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>


      </Tabs>

      {/* Submission Dialog */}
      <Dialog open={submissionDialog} onOpenChange={setSubmissionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Submit Assignment
            </DialogTitle>
            <DialogDescription>
              {submittingAssignment?.title} - {submittingAssignment?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="submission-text">Submission Notes (Optional)</Label>
              <Textarea
                id="submission-text"
                placeholder="Add any notes or comments about your submission..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload File</Label>
              <div className="flex gap-2 cursor-pointer">
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                  className="flex-1 cursor-pointer"
                />
                {selectedFile && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Accepted formats: PDF, DOC, DOCX, TXT, ZIP, RAR (Max 100MB)
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Assignment Details</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Due Date:</span>
                  <span className="ml-2 font-medium">
                    {submittingAssignment && new Date(submittingAssignment.dueDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Marks:</span>
                  <span className="ml-2 font-medium">{submittingAssignment?.marks}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSubmissionDialog(false);
                  setSubmissionText("");
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAssignment}
                disabled={uploading || (!submissionText && !selectedFile)}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Submitting..." : "Submit Assignment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment Details Dialog */}
      <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {selectedAssignment?.title}
            </DialogTitle>
            <DialogDescription>{selectedAssignment?.subject}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">{selectedAssignment && getStatusBadge(selectedAssignment.status)}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                <p className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {selectedAssignment && new Date(selectedAssignment.dueDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Marks</p>
                <p className="mt-1 text-lg font-semibold">{selectedAssignment?.marks}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Grade</p>
                <p className="mt-1 text-lg font-semibold">{selectedAssignment?.grade || 'Not graded yet'}</p>
              </div>
            </div>

            {selectedAssignment?.submittedOn && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Submitted On</p>
                <p className="mt-1">
                  {new Date(selectedAssignment.submittedOn).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Assignment Description</p>
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <p className="text-sm">
                    {selectedAssignment?.instructions || "No instructions provided."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {selectedAssignment?.status === "graded" && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Feedback</p>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <p className="text-sm">
                      {selectedAssignment?.feedback || "No feedback provided."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedAssignment?.submissionText && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">My Submission Notes</p>
                <Card className="bg-muted/30 border-primary/10">
                  <CardContent className="pt-4">
                    <p className="text-sm italic text-foreground">"{selectedAssignment.submissionText}"</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedAssignment?.submissionFile && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Submitted File</p>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-4 p-4 h-auto rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all group"
                  onClick={() => handleDownloadMySubmission(selectedAssignment)}
                >
                  <div className="bg-primary/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">Download My Submission</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mt-1">Download to your device</p>
                  </div>
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              {selectedAssignment?.status === "pending" && (
                <Button
                  className="gap-2"
                  onClick={() => {
                    openSubmissionDialog(selectedAssignment);
                    setSelectedAssignment(null);
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Submit Assignment
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedAssignment(null)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>

  );
};

export default StudentAssignments;