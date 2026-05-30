import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import {
  FileText,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Calendar,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface MoU {
  _id?: string;
  organization: string;
  type: string;
  purpose: string;
  duration: string;
  contact: string;
  benefits?: string;
  status?: string;
  submittedDate?: string;
  submittedBy?: string;
}

const MoURequests = () => {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [moUs, setMoUs] = useState<MoU[]>([]);
  const [formData, setFormData] = useState({
    organization: "",
    type: "",
    contact: "",
    duration: "",
    purpose: "",
    benefits: "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isStudent = user.role === "Student";
  const [selectedMoU, setSelectedMoU] = useState<MoU | null>(null);

  // 🔹 Fetch MoUs from backend
  const fetchMoUs = async () => {
    try {
      const res = await api.get("/mou");
      const data = Array.isArray(res.data) ? res.data : [];
      setMoUs(data);
    } catch (err) {
      console.error("Error fetching MoUs:", err);
      setMoUs([]);
    }
  };

  useEffect(() => {
    fetchMoUs();
  }, []);

  // 🔹 Submit new MoU request
  const handleSubmit = async () => {
    if (!formData.organization || !formData.type || !formData.purpose) {
      return toast("Please fill all fields");
    }
    try {
      await api.post("/mou", {
        ...formData,
        submittedBy: user.name || "Unknown User",
      });
      toast("✅ MoU Request Submitted Successfully!");
      setFormData({
        organization: "",
        type: "",
        contact: "",
        duration: "",
        purpose: "",
        benefits: "",
      });
      setShowNewRequest(false);
      fetchMoUs();
    } catch (err) {
      console.error("Error submitting MoU:", err);
    }
  };

  // 🔹 UI helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 border-green-200 bg-green-50";
      case "pending":
        return "text-orange-600 border-orange-200 bg-orange-50";
      case "under_review":
        return "text-blue-600 border-blue-200 bg-blue-50";
      case "rejected":
        return "text-red-600 border-red-200 bg-red-50";
      default:
        return "text-gray-600 border-gray-200 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "under_review":
        return <FileText className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <BreadcrumbNav />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* ---------- Header ---------- */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {isStudent ? "Signed Memorandums of Understanding" : "MoU Requests"}
              </h1>
              <p className="text-muted-foreground">
                {isStudent 
                  ? "Explore our institution's signed partnerships and collaborations" 
                  : "Manage Memorandum of Understanding requests and collaborations"}
              </p>
            </div>
          </div>
          {!isStudent && (
            <Button onClick={() => setShowNewRequest(!showNewRequest)}>
              <Plus className="mr-2 h-4 w-4" />
              New MoU Request
            </Button>
          )}
        </div>

        {/* ---------- New Request Form ---------- */}
        {showNewRequest && !isStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Submit New MoU Request</CardTitle>
                <CardDescription>
                  Fill out the details for your partnership request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Organization Name</Label>
                    <Input
                      value={formData.organization}
                      onChange={(e) =>
                        setFormData({ ...formData, organization: e.target.value })
                      }
                      placeholder="Enter organization name"
                    />
                  </div>
                  <div>
                    <Label>MoU Type</Label>
                    <Select
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Industry Partnership">
                          Industry Partnership
                        </SelectItem>
                        <SelectItem value="Academic Collaboration">
                          Academic Collaboration
                        </SelectItem>
                        <SelectItem value="Technology Partnership">
                          Technology Partnership
                        </SelectItem>
                        <SelectItem value="Research Collaboration">
                          Research Collaboration
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Email</Label>
                    <Input
                      value={formData.contact}
                      onChange={(e) =>
                        setFormData({ ...formData, contact: e.target.value })
                      }
                      placeholder="contact@organization.com"
                    />
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Select
                      onValueChange={(value) =>
                        setFormData({ ...formData, duration: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 year">1 Year</SelectItem>
                        <SelectItem value="2 years">2 Years</SelectItem>
                        <SelectItem value="3 years">3 Years</SelectItem>
                        <SelectItem value="5 years">5 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Purpose & Objectives</Label>
                  <Textarea
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData({ ...formData, purpose: e.target.value })
                    }
                    placeholder="Describe the purpose and goals of this MoU..."
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label>Expected Benefits</Label>
                  <Textarea
                    value={formData.benefits}
                    onChange={(e) =>
                      setFormData({ ...formData, benefits: e.target.value })
                    }
                    placeholder="Outline mutual benefits..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSubmit}>Submit Request</Button>
                  <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ---------- MoU Overview Cards ---------- */}
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isStudent ? "MoU Summary" : "MoU Status Overview"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isStudent ? (
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-4 bg-green-50/50 rounded-lg border border-green-200/50"
                >
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {moUs.filter((m) => m.status === "approved").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Partnerships</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-center p-4 bg-blue-50/50 rounded-lg border border-blue-200/50"
                >
                  <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {moUs.filter((m) => m.status === "approved").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Signed MoUs</p>
                </motion.div>
              </div>
            ) : (
              <div className="grid md:grid-cols-4 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-green-50/50 rounded-lg border border-green-200/50"
                >
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {moUs.filter((m) => m.status === "approved").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Approved</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-orange-50/50 rounded-lg border border-orange-200/50"
                >
                  <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">
                    {moUs.filter((m) => m.status === "pending").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-blue-50/50 rounded-lg border border-blue-200/50"
                >
                  <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">
                    {moUs.filter((m) => m.status === "under_review").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Under Review</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 bg-gray-50/50 rounded-lg border border-gray-200/50"
                >
                  <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-600">{moUs.length}</p>
                  <p className="text-sm text-muted-foreground">Total MoUs</p>
                </motion.div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ---------- All MoUs List ---------- */}
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle>{isStudent ? "Active Partnership Registry" : "All MoU Requests"}</CardTitle>
            <CardDescription>
              {isStudent ? "Browse active academic and industry agreements" : "Track and manage all partnership requests"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const displayedMoUs = isStudent ? moUs.filter(m => m.status === "approved") : moUs;
              return Array.isArray(displayedMoUs) && displayedMoUs.length > 0 ? (
                displayedMoUs.map((mou, index) => (
                  <motion.div
                    key={mou._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedMoU(mou)}
                    className="p-4 border rounded-lg bg-card/50 hover:shadow-md transition cursor-pointer hover:border-primary/40 hover:bg-muted/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{mou.organization}</h3>
                        <p className="text-sm text-muted-foreground">{mou.type}</p>
                      </div>
                      {isStudent ? (
                        <Badge className="text-green-600 border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4 mr-1 inline-block" />
                          ACTIVE
                        </Badge>
                      ) : (
                        <Badge className={getStatusColor(mou.status || "pending")}>
                          {getStatusIcon(mou.status || "pending")}
                          {mou.status?.replace("_", " ").toUpperCase() || "PENDING"}
                        </Badge>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Purpose:</strong> {mou.purpose}</p>
                        <p><strong>Duration:</strong> {mou.duration}</p>
                      </div>
                      <div>
                        <p><strong>Contact:</strong> {mou.contact}</p>
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <strong>Signed/Submitted:</strong>{" "}
                          {new Date(mou.submittedDate || "").toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No MoUs found.</p>
              );
            })()}
          </CardContent>
        </Card>

        {/* ---------- Detailed MoU Info Dialog ---------- */}
        <Dialog open={selectedMoU !== null} onOpenChange={(open) => !open && setSelectedMoU(null)}>
          <DialogContent className="max-w-2xl bg-background border rounded-2xl shadow-lg p-6 overflow-y-auto max-h-[90vh]">
            {selectedMoU && (
              <>
                <DialogHeader className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle className="text-2xl font-bold text-foreground">
                        {selectedMoU.organization}
                      </DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground mt-1">
                        {selectedMoU.type}
                      </DialogDescription>
                    </div>
                    <Badge className="text-green-600 border border-green-200 bg-green-50 self-start">
                      <CheckCircle className="h-4 w-4 mr-1 inline-block" />
                      ACTIVE AGREEMENT
                    </Badge>
                  </div>
                </DialogHeader>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Purpose & Objectives
                    </h4>
                    <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg border leading-relaxed">
                      {selectedMoU.purpose}
                    </p>
                  </div>

                  {selectedMoU.benefits && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Mutual Expected Benefits
                      </h4>
                      <p className="text-sm text-foreground bg-muted/30 p-3 rounded-lg border leading-relaxed">
                        {selectedMoU.benefits}
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted/20 p-4 rounded-xl border space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Collaboration Period
                      </h4>
                      <div className="text-sm">
                        <p><strong>Duration:</strong> {selectedMoU.duration}</p>
                        <p className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
                          <Calendar className="h-3.5 w-3.5" />
                          Signed: {new Date(selectedMoU.submittedDate || "").toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="bg-muted/20 p-4 rounded-xl border space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Contact & Coordinator
                      </h4>
                      <div className="text-sm">
                        <p><strong>Email:</strong> {selectedMoU.contact}</p>
                        <p className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
                          <Users className="h-3.5 w-3.5" />
                          Coordinator: {selectedMoU.submittedBy || "Institutional Representative"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default MoURequests;
