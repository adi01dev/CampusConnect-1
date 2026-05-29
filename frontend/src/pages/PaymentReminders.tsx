import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Calendar, IndianRupee, Users, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

const PaymentReminders = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const pendingPayments = [
    {
      id: 1,
      studentId: "STU001",
      studentName: "Rahul Sharma",
      email: "rahul.s@college.edu",
      amount: 45000,
      dueDate: "2024-03-15",
      type: "Tuition Fee",
      daysOverdue: 0,
      remindersSent: 1,
      lastReminder: "2024-03-10",
    },
    {
      id: 2,
      studentId: "STU002",
      studentName: "Priya Patel",
      email: "priya.p@college.edu",
      amount: 50000,
      dueDate: "2024-03-10",
      type: "Tuition Fee",
      daysOverdue: 5,
      remindersSent: 2,
      lastReminder: "2024-03-12",
    },
    {
      id: 3,
      studentId: "STU003",
      studentName: "Amit Kumar",
      email: "amit.k@college.edu",
      amount: 5000,
      dueDate: "2024-03-20",
      type: "Library Fee",
      daysOverdue: 0,
      remindersSent: 0,
      lastReminder: null,
    },
  ];

  const stats = [
    { label: "Pending Payments", value: "156", icon: Clock, color: "text-orange-600" },
    { label: "Total Amount Due", value: "₹78,50,000", icon: IndianRupee, color: "text-blue-600" },
    { label: "Overdue Payments", value: "42", icon: AlertCircle, color: "text-red-600" },
    { label: "Reminders Sent", value: "289", icon: Send, color: "text-green-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Payment Reminders
            </h1>
            <p className="text-muted-foreground mt-1">Send automated payment reminders to students</p>
          </div>
          <Button className="gap-2">
            <Bell className="h-4 w-4" />
            Configure Auto-Reminders
          </Button>
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

        {/* Send Bulk Reminder */}
        <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Send Bulk Reminder
            </CardTitle>
            <CardDescription>Send payment reminders to multiple students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Recipient Group</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pending Payments</SelectItem>
                    <SelectItem value="overdue">Overdue Only</SelectItem>
                    <SelectItem value="department">By Department</SelectItem>
                    <SelectItem value="year">By Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reminder Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gentle">Gentle Reminder</SelectItem>
                    <SelectItem value="urgent">Urgent Notice</SelectItem>
                    <SelectItem value="final">Final Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Send Via</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email Only</SelectItem>
                    <SelectItem value="sms">SMS Only</SelectItem>
                    <SelectItem value="both">Email & SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button className="gap-2">
                <Send className="h-4 w-4" />
                Send Reminders Now
              </Button>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Schedule for Later
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Payments List */}
        <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Pending Payments
                </CardTitle>
                <CardDescription>Students with pending fee payments</CardDescription>
              </div>
              <Input
                placeholder="Search students..."
                className="w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Student ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Reminders</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{payment.studentId}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{payment.studentName}</p>
                          <p className="text-xs text-muted-foreground">{payment.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{payment.type}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 font-semibold">
                          <IndianRupee className="h-3 w-3" />
                          {payment.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">{new Date(payment.dueDate).toLocaleDateString('en-IN')}</span>
                      </td>
                      <td className="py-3 px-4">
                        {payment.daysOverdue > 0 ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {payment.daysOverdue} days overdue
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <p className="font-medium">{payment.remindersSent} sent</p>
                          {payment.lastReminder && (
                            <p className="text-xs text-muted-foreground">
                              Last: {new Date(payment.lastReminder).toLocaleDateString('en-IN')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Send className="h-3 w-3" />
                          Send Reminder
                        </Button>
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

export default PaymentReminders;
