import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Send, Users, Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useState } from "react";

const AdminNotifications = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");

  const notifications = [
    {
      id: 1,
      title: "Mid-Term Exam Schedule",
      message: "Mid-term examinations will commence from March 15th, 2024.",
      recipient: "All Students",
      date: "2024-03-01",
      status: "Sent",
      priority: "High",
    },
    {
      id: 2,
      title: "Faculty Meeting",
      message: "Monthly faculty meeting scheduled for March 10th at 3 PM in Conference Hall.",
      recipient: "All Faculty",
      date: "2024-03-05",
      status: "Scheduled",
      priority: "Medium",
    },
    {
      id: 3,
      title: "Fee Payment Reminder",
      message: "Last date for semester fee payment is March 20th, 2024.",
      recipient: "All Students",
      date: "2024-02-28",
      status: "Sent",
      priority: "High",
    },
  ];

  const stats = [
    { label: "Total Sent", value: "156", icon: Send, color: "text-blue-600" },
    { label: "Scheduled", value: "8", icon: Clock, color: "text-orange-600" },
    { label: "Recipients", value: "1,980", icon: Users, color: "text-green-600" },
    { label: "This Month", value: "42", icon: Calendar, color: "text-purple-600" },
  ];

  const handleSendNotification = () => {
    console.log("Sending notification:", { title, message, recipient });
    setTitle("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Admin Notifications
            </h1>
            <p className="text-muted-foreground mt-1">Send and manage institution-wide notifications</p>
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

        <Tabs defaultValue="send" className="space-y-4">
          <TabsList className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
            <TabsTrigger value="send">Send Notification</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>

          <TabsContent value="send">
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Create New Notification
                </CardTitle>
                <CardDescription>Compose and send notifications to users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipients</label>
                  <Select value={recipient} onValueChange={setRecipient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="students">All Students</SelectItem>
                      <SelectItem value="faculty">All Faculty</SelectItem>
                      <SelectItem value="staff">All Staff</SelectItem>
                      <SelectItem value="department">Specific Department</SelectItem>
                      <SelectItem value="year">Specific Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notification Title</label>
                  <Input
                    placeholder="Enter notification title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Enter notification message"
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button className="gap-2" onClick={handleSendNotification}>
                    <Send className="h-4 w-4" />
                    Send Now
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Schedule for Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Notification History
                </CardTitle>
                <CardDescription>Previously sent notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications
                    .filter((n) => n.status === "Sent")
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="space-y-1">
                            <h4 className="font-semibold">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                          </div>
                          <Badge variant={notification.priority === "High" ? "destructive" : "secondary"}>
                            {notification.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {notification.recipient}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(notification.date).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled">
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Scheduled Notifications
                </CardTitle>
                <CardDescription>Notifications scheduled for future delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications
                    .filter((n) => n.status === "Scheduled")
                    .map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="space-y-1">
                            <h4 className="font-semibold">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                          </div>
                          <Badge variant="outline">{notification.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {notification.recipient}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(notification.date).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminNotifications;
