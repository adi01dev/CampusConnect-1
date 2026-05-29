import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { FileText, Upload, Download, Search, Filter, Eye, Trash2, Share, FolderOpen, Calendar, User } from "lucide-react";
import { useState } from "react";

const DocumentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const documents = [
    {
      id: "1",
      name: "Academic Transcript - Semester 6.pdf",
      category: "Academic",
      size: "2.5 MB",
      uploadDate: "2024-03-10",
      uploadedBy: "Priya Sharma",
      type: "PDF",
      status: "verified",
    },
    {
      id: "2",
      name: "Fee Receipt - March 2024.pdf",
      category: "Financial",
      size: "0.8 MB",
      uploadDate: "2024-03-08",
      uploadedBy: "Accounts Office",
      type: "PDF",
      status: "approved",
    },
    {
      id: "3",
      name: "Project Report - AI Implementation.docx",
      category: "Projects",
      size: "4.2 MB",
      uploadDate: "2024-03-05",
      uploadedBy: "Rahul Kumar",
      type: "DOCX",
      status: "pending",
    },
    {
      id: "4",
      name: "Internship Certificate - TCS.pdf",
      category: "Certificates",
      size: "1.1 MB",
      uploadDate: "2024-02-28",
      uploadedBy: "HR Department",
      type: "PDF",
      status: "verified",
    },
    {
      id: "5",
      name: "ID Card Application Form.pdf",
      category: "Administrative",
      size: "0.5 MB",
      uploadDate: "2024-02-25",
      uploadedBy: "Admin Office",
      type: "PDF",
      status: "processing",
    },
  ];

  const folders = [
    { name: "Academic Documents", count: 24, icon: "📚" },
    { name: "Financial Records", count: 12, icon: "💰" },
    { name: "Certificates", count: 8, icon: "🏆" },
    { name: "Projects", count: 15, icon: "📋" },
    { name: "Administrative", count: 6, icon: "📄" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-100 text-green-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "processing": return "bg-orange-100 text-orange-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF": return "📄";
      case "DOCX": return "📝";
      case "XLSX": return "📊";
      case "PPTX": return "📊";
      default: return "📄";
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen p-6 space-y-6">
      <BreadcrumbNav />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Document Management</h1>
              <p className="text-muted-foreground">Organize and manage your academic documents</p>
            </div>
          </div>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-5 gap-4"
        >
          {folders.map((folder, index) => (
            <motion.div
              key={folder.name}
              whileHover={{ scale: 1.05 }}
              className="p-4 bg-card/50 rounded-lg border text-center"
            >
              <div className="text-2xl mb-2">{folder.icon}</div>
              <h3 className="font-semibold text-sm">{folder.name}</h3>
              <p className="text-2xl font-bold text-primary">{folder.count}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filter */}
        <Card className="glassmorphism">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search">Search Documents</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by document name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="certificates">Certificates</SelectItem>
                    <SelectItem value="projects">Projects</SelectItem>
                    <SelectItem value="administrative">Administrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
            <CardDescription>Manage your uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredDocuments.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{getFileIcon(doc.type)}</div>
                    <div>
                      <h3 className="font-semibold">{doc.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FolderOpen className="h-3 w-3" />
                          {doc.category}
                        </span>
                        <span>{doc.size}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {doc.uploadDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {doc.uploadedBy}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status.toUpperCase()}
                    </Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {filteredDocuments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No documents found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DocumentManagement;