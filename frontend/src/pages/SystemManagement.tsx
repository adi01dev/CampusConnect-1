import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Server, Database, Shield, Settings, Activity, HardDrive, Cpu, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SystemManagement = () => {
  const navigate = useNavigate();

  const systemStats = [
    { label: "Server Uptime", value: "99.9%", icon: Server, status: "Operational" },
    { label: "Database Health", value: "Healthy", icon: Database, status: "Operational" },
    { label: "Security Status", value: "Secure", icon: Shield, status: "Operational" },
    { label: "System Load", value: "45%", icon: Activity, status: "Normal" },
  ];

  const systemServices = [
    { name: "Authentication Service", status: "Running", uptime: "30 days", enabled: true },
    { name: "Email Service", status: "Running", uptime: "28 days", enabled: true },
    { name: "Backup Service", status: "Running", uptime: "25 days", enabled: true },
    { name: "Analytics Service", status: "Running", uptime: "22 days", enabled: true },
    { name: "Notification Service", status: "Running", uptime: "20 days", enabled: true },
  ];

  const resources = [
    { name: "CPU Usage", value: 45, max: 100, unit: "%", icon: Cpu },
    { name: "Memory", value: 6.2, max: 16, unit: "GB", icon: HardDrive },
    { name: "Storage", value: 250, max: 500, unit: "GB", icon: Database },
    { name: "Network", value: 125, max: 1000, unit: "Mbps", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              System Management
            </h1>
            <p className="text-muted-foreground mt-1">Monitor and manage system infrastructure</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/system-logs')}>
              View Logs
            </Button>
            <Button onClick={() => navigate('/institute-settings')}>
              System Settings
            </Button>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {systemStats.map((stat, index) => (
            <Card key={index} className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <stat.icon className="h-5 w-5 text-primary" />
                  <Badge variant="default">{stat.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resource Usage */}
        <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Resource Usage
            </CardTitle>
            <CardDescription>Real-time system resource monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((resource, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <resource.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{resource.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {resource.value}{resource.unit} / {resource.max}{resource.unit}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all duration-300"
                      style={{ width: `${(resource.value / resource.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Services */}
        <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              System Services
            </CardTitle>
            <CardDescription>Manage critical system services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemServices.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{service.name}</h4>
                      <Badge variant={service.status === "Running" ? "default" : "destructive"}>
                        {service.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Uptime: {service.uptime}</p>
                  </div>
                  <Switch checked={service.enabled} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/system-logs')}
          >
            <CardHeader>
              <CardTitle className="text-lg">System Logs</CardTitle>
              <CardDescription>View detailed system activity logs</CardDescription>
            </CardHeader>
          </Card>
          <Card
            className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/analytics')}
          >
            <CardHeader>
              <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
              <CardDescription>View system performance metrics</CardDescription>
            </CardHeader>
          </Card>
          <Card
            className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="text-lg">Backup Management</CardTitle>
              <CardDescription>Configure automated backups</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemManagement;
