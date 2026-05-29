import { motion } from 'framer-motion';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Image, Video, Download, Eye, Trash2, Calendar, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const BACKEND_URL = API_BASE_URL.replace('/api', '');

const UploadMaterials = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploads, setUploads] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>(''); // Store role
  const [subjects, setSubjects] = useState<string[]>(['Data Structures', 'Machine Learning', 'Digital Electronics', 'Algorithms', 'Database Systems']);
  const { toast } = useToast();

  const [stats, setStats] = useState({
    totalMaterials: 0,
    thisWeek: 0,
    totalDownloads: 0,
    totalViews: 0,
    storageUsed: 0
  });

  useEffect(() => {
    fetchUserRole();
    fetchMaterials();
    fetchStats();
    fetchSubjects();
  }, []);

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role); // Assuming 'role' field exists
      }
    } catch (err) {
      console.error("Failed to fetch user role", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/admin/subjects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSubjects(data.map((s: any) => s.name));
        }
      }
    } catch (err) {
      console.error("Failed to fetch subjects", err);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/materials/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/materials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUploads(prev => {
          const currentIds = new Set(prev.map(u => u.id));
          const newUploads = data.map((item: any) => ({
            id: item._id,
            name: item.title,
            subject: item.courseCode,
            type: item.fileType,
            size: formatBytes(item.fileSize || 0),
            uploadedBy: item.uploadedBy,
            uploadedAt: new Date(item.uploadedAt).toLocaleString(),
            downloads: item.downloads || 0,
            views: item.views || 0,
            fileUrl: item.fileUrl
          }));
          return newUploads;
        });
      }
    } catch (err) {
      console.error("Failed to fetch materials", err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleView = async (id: string, url: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE_URL}/materials/${id}/view`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      setUploads(prev => prev.map(item =>
        item.id === id ? { ...item, views: (item.views || 0) + 1 } : item
      ));
      fetchStats();

      const cleanUrl = url.replace(/^\/+/, '');
      const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}/${cleanUrl}`;
      console.log("Viewing material at:", fullUrl);
      window.open(fullUrl, '_blank');
    } catch (err) {
      console.error("View error", err);
    }
  };

  const handleDownload = async (id: string, url: string, filename: string) => {
    try {
      const token = localStorage.getItem('accessToken');

      // 1. Trigger the actual download via the robust GET endpoint
      // This will automatically increment count on backend and send the file
      const downloadUrl = `${API_BASE_URL}/materials/${id}/download`;

      const response = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Download failed");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      // Update local state and stats
      setUploads(prev => prev.map(item =>
        item.id === id ? { ...item, downloads: (item.downloads || 0) + 1 } : item
      ));
      fetchStats();

      toast({ title: "Success", description: "Download started" });
    } catch (err) {
      console.error("Download error", err);
      toast({ title: "Error", description: "Failed to download file", variant: "destructive" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedSubject || !title) {
      // toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      alert("Please fill required fields");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', selectedSubject);
    formData.append('type', selectedType);
    formData.append('title', title);
    formData.append('description', description);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/materials/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        alert("Material uploaded successfully!");
        setFile(null);
        setTitle('');
        setDescription('');
        fetchMaterials(); // Refresh list
        fetchStats(); // Refresh stats
      } else {
        const err = await res.json();
        alert(`Upload failed: ${err.message}`);
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Upload failed. See console.");
    }
  };

  const materialTypes = ['Notes', 'Assignment', 'Video Lecture', 'Presentation', 'Diagram', 'Lab Manual'];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'image':
        return <Image className="w-5 h-5 text-green-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
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
            {userRole === 'Student' ? 'Study Materials' : 'Manage Materials'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {userRole === 'Student'
              ? 'Access study materials, assignments, and resources shared by your faculty'
              : 'Share study materials, assignments, and resources with students'}
          </p>
        </div>
      </div>

      {/* Stats Cards - Removed as per request */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {userRole && userRole !== 'Student' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Upload New Material</CardTitle>
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
                  <Label htmlFor="type">Material Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter material title" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description (optional)" rows={3} />
                </div>

                <div className="space-y-2">
                  <Label>File Upload</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      {file ? file.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOC, PPT, MP4, PNG, JPG (Max 100MB)</p>
                  </div>
                </div>

                <Button className="w-full glass-card" onClick={handleUpload} disabled={!file}>
                  <Upload className="w-4 h-4 mr-2" />
                  {file ? 'Upload Material' : 'Select File'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          className={userRole === 'Student' ? "lg:col-span-3" : "lg:col-span-2"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>{userRole === 'Student' ? 'Available Materials' : 'Recent Uploads'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {uploads.length === 0 ? (
                  <div className="col-span-full text-center py-20 opacity-40">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-bold text-lg">No materials shared yet</p>
                    <p className="text-sm">Be the first to upload quality resources!</p>
                  </div>
                ) : uploads.map((file, index) => (
                  <motion.div
                    key={file.id}
                    className="group relative bg-gradient-card rounded-3xl border border-border/40 hover-lift hover-border overflow-hidden transition-all duration-500 shadow-soft"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className={`p-4 rounded-2xl bg-gradient-secondary shadow-glow group-hover:scale-110 transition-transform duration-500`}>
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl bg-primary/5 hover:bg-primary hover:text-white transition-all shadow-sm relative z-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleView(file.id, file.fileUrl);
                            }}
                          >
                            <Eye className="w-5 h-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl bg-secondary/5 hover:bg-secondary hover:text-white transition-all shadow-sm relative z-20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(file.id, file.fileUrl, file.name);
                            }}
                          >
                            <Download className="w-5 h-5" />
                          </Button>
                          {userRole && userRole !== 'Student' && (
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-destructive/5 hover:bg-destructive hover:text-white transition-all shadow-sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-lg font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight">{file.name}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] font-black uppercase border-primary/20 bg-primary/5 text-primary tracking-widest">{file.subject}</Badge>
                          <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">{file.type}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/10">
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase text-muted-foreground tracking-tighter">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {file.views || 0} Views
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3" /> {file.downloads || 0} Saves
                          </div>
                          <div className="font-medium opacity-60 ml-2 border-l pl-2 border-border/20">{file.size}</div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/60 italic">
                          <Clock className="w-3 h-3" />
                          {file.uploadedAt}
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/5 py-3 px-6 text-[10px] font-bold text-muted-foreground flex items-center justify-between border-t border-border/5">
                      <span className="flex items-center gap-1 opacity-70">
                        <ChevronRight className="w-3 h-3" /> Uploaded by {file.uploadedBy}
                      </span>
                      <div className="h-1 w-12 bg-primary/20 rounded-full group-hover:w-20 transition-all duration-700"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UploadMaterials;