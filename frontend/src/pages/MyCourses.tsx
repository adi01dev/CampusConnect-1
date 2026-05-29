import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Calendar,
  FileText,
  Video,
  Download,
  Upload as UploadIcon,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Play,
  Award,
  Target,
  TrendingUp,
  Image,
  Eye,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const BACKEND_URL = API_BASE.replace('/api', '');

const MyCourses = () => {

  const [courses, setCourses] = useState<any[]>([]);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
  const [quickActions, setQuickActions] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/student/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setCourses(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };

    // Fetch recent materials for study materials section
    const fetchRecentMaterials = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/materials/recent`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          // Map to match the UI expectations, handling potential missing fields with defaults
          setRecentMaterials(data.map((item: any) => ({
            ...item,
            size: item.fileSize ? formatBytes(item.fileSize) : '0 B',
            downloads: item.downloads || 0,
            uploadedAtFormatted: new Date(item.uploadedAt).toLocaleString()
          })));
        }
      } catch (err) {
        console.error("Failed to fetch recent materials", err);
      }
    };

    const fetchQuickActions = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setQuickActions(data.quickActions);
        }
      } catch (err) {
        console.error("Failed to fetch quick actions", err);
      }
    };

    fetchCourses();
    fetchRecentMaterials();
    fetchQuickActions();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

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

  const handleView = async (id: string, url: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${API_BASE}/materials/${id}/view`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      setRecentMaterials(prev => prev.map(item =>
        item._id === id ? { ...item, views: (item.views || 0) + 1 } : item
      ));

      const cleanUrl = url.replace(/^\/+/, '');
      const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}/${cleanUrl}`;
      window.open(fullUrl, '_blank');
    } catch (err) {
      console.error("View error", err);
    }
  };

  const handleDownload = async (id: string, url: string, filename: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const downloadUrl = `${API_BASE}/materials/${id}/download`;

      const response = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      setRecentMaterials(prev => prev.map(item =>
        item._id === id ? { ...item, downloads: (item.downloads || 0) + 1 } : item
      ));

      toast({ title: "Success", description: "Download started" });
    } catch (err) {
      console.error("Download error", err);
      toast({ title: "Error", description: "Failed to download file", variant: "destructive" });
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <BreadcrumbNav />

      {/* Header */}
      <motion.div
        className="flex justify-between items-start"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Courses
          </h1>
          <p className="text-muted-foreground">
            Manage your enrolled courses, track progress, and access learning
            materials
          </p>
        </div>
      </motion.div>


      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Study Materials - Replaces Recent Activity */}
        <div className="xl:col-span-3"> {/* Expanded to full width since courses list is gone */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="glass-effect border-0 shadow-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Recent Study Materials
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/upload-materials')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMaterials.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center">No recent materials</p>
                  ) : (
                    recentMaterials.slice(0, 3).map((material, index) => (
                      <motion.div
                        key={index}
                        className="p-4 border rounded-lg glass-card hover:bg-accent/50 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getFileIcon(material.fileType)}
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-sm">{material.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <Badge variant="outline" className="text-xs">{material.courseCode}</Badge>
                                  <Badge variant="secondary" className="text-xs">{material.fileType}</Badge>
                                </div>
                              </div>
                              <div className="flex gap-1 relative z-20">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 bg-primary/5 hover:bg-primary hover:text-white transition-all shadow-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleView(material._id, material.fileUrl);
                                  }}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 bg-secondary/5 hover:bg-secondary hover:text-white transition-all shadow-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(material._id, material.fileUrl, material.title);
                                  }}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                              <div>
                                <p><span className="font-medium">Size:</span> {material.size}</p>
                                <p><span className="font-medium">Downloads:</span> {material.downloads}</p>
                              </div>
                              <div>
                                <p><span className="font-medium">Uploaded by:</span> {material.uploadedBy}</p>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{material.uploadedAtFormatted}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="glass-effect border-0 shadow-card hover:shadow-elegant transition-all cursor-pointer hover-lift">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-primary p-3 rounded-full w-fit mx-auto mb-4">
                <Play className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {quickActions?.liveClass?.isLive ? "Live Now!" : "Next Live Class"}
              </h3>
              <p className={`text-sm mb-4 ${quickActions?.liveClass?.isLive ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
                {quickActions?.liveClass ? (
                  <>
                    {quickActions.liveClass.title}
                    <br />
                    <span className="text-xs font-normal opacity-80">{quickActions.liveClass.time}</span>
                  </>
                ) : (
                  "No upcoming live classes"
                )}
              </p>
              <Button
                variant={quickActions?.liveClass?.isLive ? "default" : "outline"}
                className={`w-full ${quickActions?.liveClass?.isLive ? 'bg-red-600 hover:bg-red-700' : ''}`}
                onClick={() => {
                  if (quickActions?.liveClass?.isLive && quickActions?.liveClass?.link && quickActions.liveClass.link !== "#") {
                    window.open(quickActions.liveClass.link, '_blank');
                  } else {
                    navigate('/class-schedule');
                  }
                }}
              >
                <Video className="w-4 h-4 mr-2" />
                {quickActions?.liveClass?.isLive ? "Join Now" : "View Schedule"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="glass-effect border-0 shadow-card hover:shadow-elegant transition-all cursor-pointer hover-lift" onClick={() => navigate('/student/assignments?tab=pending')}>
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-secondary p-3 rounded-full w-fit mx-auto mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Submit Assignment
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {quickActions?.assignmentsPending || 0} assignments pending submission
              </p>
              <Button variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); navigate('/student/assignments?tab=pending'); }}>
                <UploadIcon className="w-4 h-4 mr-2" />
                Upload Work
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="glass-effect border-0 shadow-card hover:shadow-elegant transition-all cursor-pointer hover-lift" onClick={() => navigate('/academic-goals')}>
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-hero p-3 rounded-full w-fit mx-auto mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Academic Goals
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {quickActions?.activeGoals || 0} active targets
              </p>
              <Button variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); navigate('/academic-goals'); }}>
                <Award className="w-4 h-4 mr-2" />
                View Goals
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MyCourses;
