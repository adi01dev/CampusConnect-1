import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Cloud, Upload, Download, Folder, File, HardDrive, Search, Grid, List, MoreVertical } from "lucide-react";
import { useState } from "react";

const FileStorage = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");

  const storageStats = {
    used: 3.2,
    total: 10,
    percentage: 32,
  };

  const folders = [
    { id: "1", name: "Academic Documents", files: 24, size: "1.2 GB", lastModified: "2024-03-10", icon: "📚" },
    { id: "2", name: "Project Files", files: 18, size: "2.1 GB", lastModified: "2024-03-08", icon: "📁" },
    { id: "3", name: "Certificates", files: 8, size: "45 MB", lastModified: "2024-03-05", icon: "🏆" },
    { id: "4", name: "Images", files: 35, size: "850 MB", lastModified: "2024-03-03", icon: "🖼️" },
    { id: "5", name: "Videos", files: 12, size: "4.2 GB", lastModified: "2024-02-28", icon: "🎥" },
    { id: "6", name: "Presentations", files: 15, size: "680 MB", lastModified: "2024-02-25", icon: "📊" },
  ];

  const recentFiles = [
    { id: "1", name: "Machine Learning Assignment.pdf", size: "2.5 MB", type: "PDF", modified: "2024-03-10", shared: true },
    { id: "2", name: "Database Design Project.docx", size: "1.8 MB", type: "DOCX", modified: "2024-03-09", shared: false },
    { id: "3", name: "Presentation Final.pptx", size: "15.2 MB", type: "PPTX", modified: "2024-03-08", shared: true },
    { id: "4", name: "Research Paper Draft.pdf", size: "3.1 MB", type: "PDF", modified: "2024-03-07", shared: false },
    { id: "5", name: "Code Implementation.zip", size: "8.7 MB", type: "ZIP", modified: "2024-03-06", shared: true },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case "PDF": return "📄";
      case "DOCX": return "📝";
      case "PPTX": return "📊";
      case "ZIP": return "📦";
      case "XLSX": return "📈";
      default: return "📄";
    }
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFiles = recentFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Cloud className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">File Storage</h1>
              <p className="text-muted-foreground">Manage your cloud storage and files</p>
            </div>
          </div>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>

        {/* Storage Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Storage Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Used Storage</span>
                  <span className="font-bold">{storageStats.used} GB of {storageStats.total} GB</span>
                </div>
                <Progress value={storageStats.percentage} className="h-2" />
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-500">{storageStats.used} GB</p>
                    <p className="text-sm text-muted-foreground">Used</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">{storageStats.total - storageStats.used} GB</p>
                    <p className="text-sm text-muted-foreground">Available</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{storageStats.total} GB</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and View Controls */}
        <Card className="glassmorphism">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files and folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Folders */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Folders
              </CardTitle>
              <CardDescription>Organize your files in folders</CardDescription>
            </CardHeader>
            <CardContent>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFolders.map((folder, index) => (
                    <motion.div
                      key={folder.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="p-4 border rounded-lg bg-card/50 text-center cursor-pointer"
                    >
                      <div className="text-4xl mb-2">{folder.icon}</div>
                      <h3 className="font-semibold text-sm mb-1">{folder.name}</h3>
                      <p className="text-xs text-muted-foreground">{folder.files} files</p>
                      <p className="text-xs text-muted-foreground">{folder.size}</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFolders.map((folder, index) => (
                    <motion.div
                      key={folder.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-3 border rounded-lg bg-card/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{folder.icon}</span>
                        <div>
                          <h3 className="font-semibold">{folder.name}</h3>
                          <p className="text-sm text-muted-foreground">{folder.files} files • {folder.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{folder.lastModified}</span>
                        <Button size="sm" variant="outline">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Files */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5" />
                Recent Files
              </CardTitle>
              <CardDescription>Recently accessed and modified files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredFiles.map((file, index) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-3 border rounded-lg bg-card/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div>
                        <h3 className="font-semibold">{file.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{file.size}</span>
                          <span>Modified: {file.modified}</span>
                          {file.shared && (
                            <Badge variant="outline" className="text-xs">
                              Shared
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FileStorage;