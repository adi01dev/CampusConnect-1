import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Receipt, Search, Download, Calendar, Filter, CreditCard, CheckCircle, Clock, XCircle } from "lucide-react";
import { useState } from "react";

const PaymentHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const payments = [
    {
      id: "PAY001",
      date: "2024-03-15",
      description: "Semester Fee - Computer Science",
      amount: 75000,
      status: "completed",
      method: "UPI",
      transactionId: "TXN123456789",
      receiptUrl: "#"
    },
    {
      id: "PAY002", 
      date: "2024-02-20",
      description: "Library Fee",
      amount: 2500,
      status: "completed",
      method: "Credit Card",
      transactionId: "TXN987654321",
      receiptUrl: "#"
    },
    {
      id: "PAY003",
      date: "2024-02-15",
      description: "Examination Fee",
      amount: 1500,
      status: "pending",
      method: "Net Banking",
      transactionId: "TXN555666777",
      receiptUrl: "#"
    },
    {
      id: "PAY004",
      date: "2024-01-10",
      description: "Late Fee Penalty",
      amount: 500,
      status: "failed",
      method: "UPI",
      transactionId: "TXN111222333",
      receiptUrl: "#"
    },
    {
      id: "PAY005",
      date: "2023-12-20",
      description: "Hostel Fee - Block A",
      amount: 25000,
      status: "completed",
      method: "NEFT",
      transactionId: "TXN444555666",
      receiptUrl: "#"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 border-green-200 bg-green-50";
      case "pending": return "text-orange-600 border-orange-200 bg-orange-50";
      case "failed": return "text-red-600 border-red-200 bg-red-50";
      default: return "text-gray-600 border-gray-200 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "failed": return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);

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
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Payment History</h1>
              <p className="text-muted-foreground">Track all your fee payments and transactions</p>
            </div>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Payment Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">₹{pendingAmount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{payments.length}</p>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <Card className="glassmorphism">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payment List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All your payment transactions and receipts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPayments.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 border rounded-lg bg-card/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{payment.description}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {payment.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">₹{payment.amount.toLocaleString()}</p>
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusIcon(payment.status)}
                          {payment.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Payment ID:</strong> {payment.id}</p>
                        <p><strong>Transaction ID:</strong> {payment.transactionId}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-2">
                          <CreditCard className="h-3 w-3" />
                          <strong>Method:</strong> {payment.method}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Receipt className="mr-2 h-3 w-3" />
                        Download Receipt
                      </Button>
                      {payment.status === "failed" && (
                        <Button size="sm">Retry Payment</Button>
                      )}
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

export default PaymentHistory;