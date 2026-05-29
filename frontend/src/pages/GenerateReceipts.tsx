import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Receipt, Download, Printer, Search, FileText, Calendar, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const GenerateReceipts = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const receipts = [
    {
      id: "RCP-2024-001",
      studentId: "STU001",
      studentName: "Rahul Sharma",
      amount: 45000,
      type: "Tuition Fee",
      date: "2024-03-01",
      semester: "Spring 2024",
      status: "Generated",
    },
    {
      id: "RCP-2024-002",
      studentId: "STU002",
      studentName: "Priya Patel",
      amount: 45000,
      type: "Tuition Fee",
      date: "2024-03-02",
      semester: "Spring 2024",
      status: "Generated",
    },
    {
      id: "RCP-2024-003",
      studentId: "STU003",
      studentName: "Amit Kumar",
      amount: 5000,
      type: "Library Fee",
      date: "2024-03-03",
      semester: "Spring 2024",
      status: "Generated",
    },
  ];

  const stats = [
    { label: "Total Receipts", value: "256", color: "text-blue-600" },
    { label: "This Month", value: "42", color: "text-green-600" },
    { label: "Total Amount", value: "₹11,50,000", color: "text-purple-600" },
    { label: "Pending", value: "8", color: "text-orange-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Generate Receipts
            </h1>
            <p className="text-muted-foreground mt-1">Create and manage fee payment receipts</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/payment-history')}>
              Payment History
            </Button>
            <Button onClick={() => navigate('/fee-management')}>
              Fee Management
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Generate New Receipt */}
        <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Generate New Receipt
            </CardTitle>
            <CardDescription>Create a new fee payment receipt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Student ID</label>
                <Input placeholder="Enter student ID" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Student Name</label>
                <Input placeholder="Enter student name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuition">Tuition Fee</SelectItem>
                    <SelectItem value="library">Library Fee</SelectItem>
                    <SelectItem value="exam">Exam Fee</SelectItem>
                    <SelectItem value="hostel">Hostel Fee</SelectItem>
                    <SelectItem value="transport">Transport Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount (₹)</label>
                <Input type="number" placeholder="Enter amount" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Date</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Semester</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spring-2024">Spring 2024</SelectItem>
                    <SelectItem value="fall-2023">Fall 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button className="gap-2">
                <Receipt className="h-4 w-4" />
                Generate Receipt
              </Button>
              <Button variant="outline" className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Receipts */}
        <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Receipts
                </CardTitle>
                <CardDescription>Recently generated payment receipts</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search receipts..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Receipt ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Student</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Semester</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt) => (
                    <tr key={receipt.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{receipt.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{receipt.studentName}</p>
                          <p className="text-sm text-muted-foreground">{receipt.studentId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{receipt.type}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 font-semibold">
                          <IndianRupee className="h-3 w-3" />
                          {receipt.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {new Date(receipt.date).toLocaleDateString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 px-4">{receipt.semester}</td>
                      <td className="py-3 px-4">
                        <Badge variant="default">{receipt.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="gap-1">
                            <Download className="h-3 w-3" />
                            Download
                          </Button>
                          <Button size="sm" variant="ghost" className="gap-1">
                            <Printer className="h-3 w-3" />
                            Print
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenerateReceipts;
