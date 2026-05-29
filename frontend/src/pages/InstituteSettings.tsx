import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Settings, Building2, Users, Bell, Shield, Database, Palette, Globe } from "lucide-react";
import { useState } from "react";

const InstituteSettings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: false,
    passwordExpiry: true,
    ipRestriction: false,
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
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Institute Settings</h1>
              <p className="text-muted-foreground">Configure your institution's system preferences</p>
            </div>
          </div>
          <Button>Save All Changes</Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Institute Information
                  </CardTitle>
                  <CardDescription>Basic information about your institution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="institute-name">Institute Name</Label>
                      <Input defaultValue="Indian Institute of Technology" />
                    </div>
                    <div>
                      <Label htmlFor="institute-code">Institute Code</Label>
                      <Input defaultValue="IIT001" />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Contact Email</Label>
                      <Input defaultValue="admin@iit.ac.in" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Contact Phone</Label>
                      <Input defaultValue="+91 11 2659 1234" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea 
                      defaultValue="Hauz Khas, New Delhi - 110016, India"
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="established">Established Year</Label>
                      <Input defaultValue="1961" />
                    </div>
                    <div>
                      <Label htmlFor="affiliation">Affiliation</Label>
                      <Input defaultValue="UGC, AICTE" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Academic Settings */}
          <TabsContent value="academic">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle>Academic Configuration</CardTitle>
                  <CardDescription>Configure academic year, grading system, and policies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="academic-year">Current Academic Year</Label>
                      <Input defaultValue="2023-2024" />
                    </div>
                    <div>
                      <Label htmlFor="semester">Current Semester</Label>
                      <Input defaultValue="Spring 2024" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="grading-system">Grading System</Label>
                      <Input defaultValue="10-Point CGPA" />
                    </div>
                    <div>
                      <Label htmlFor="passing-marks">Minimum Passing Marks</Label>
                      <Input defaultValue="40%" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="attendance-req">Minimum Attendance Required</Label>
                      <Input defaultValue="75%" />
                    </div>
                    <div>
                      <Label htmlFor="max-subjects">Maximum Subjects per Semester</Label>
                      <Input defaultValue="8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Configure how you want to receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications(prev => ({...prev, email: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive important alerts via SMS</p>
                    </div>
                    <Switch 
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications(prev => ({...prev, sms: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Browser and mobile push notifications</p>
                    </div>
                    <Switch 
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications(prev => ({...prev, push: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">Updates about new features and events</p>
                    </div>
                    <Switch 
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications(prev => ({...prev, marketing: checked}))}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Configuration
                  </CardTitle>
                  <CardDescription>Manage security settings and access controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
                    </div>
                    <Switch 
                      checked={security.twoFactor}
                      onCheckedChange={(checked) => setSecurity(prev => ({...prev, twoFactor: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Automatic Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">Auto-logout after 30 minutes of inactivity</p>
                    </div>
                    <Switch 
                      checked={security.sessionTimeout}
                      onCheckedChange={(checked) => setSecurity(prev => ({...prev, sessionTimeout: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Password Expiry</Label>
                      <p className="text-sm text-muted-foreground">Force password change every 90 days</p>
                    </div>
                    <Switch 
                      checked={security.passwordExpiry}
                      onCheckedChange={(checked) => setSecurity(prev => ({...prev, passwordExpiry: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">IP Address Restriction</Label>
                      <p className="text-sm text-muted-foreground">Restrict access to specific IP ranges</p>
                    </div>
                    <Switch 
                      checked={security.ipRestriction}
                      onCheckedChange={(checked) => setSecurity(prev => ({...prev, ipRestriction: checked}))}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Theme & Appearance
                  </CardTitle>
                  <CardDescription>Customize the look and feel of your system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="theme">System Theme</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="p-4 border rounded-lg text-center cursor-pointer hover:bg-muted">
                        <div className="w-full h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded mb-2"></div>
                        <span className="text-sm">Light</span>
                      </div>
                      <div className="p-4 border rounded-lg text-center cursor-pointer hover:bg-muted bg-muted">
                        <div className="w-full h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded mb-2"></div>
                        <span className="text-sm">Dark</span>
                      </div>
                      <div className="p-4 border rounded-lg text-center cursor-pointer hover:bg-muted">
                        <div className="w-full h-12 bg-gradient-to-br from-blue-400 to-gray-700 rounded mb-2"></div>
                        <span className="text-sm">Auto</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="logo">Institute Logo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <Button variant="outline">Upload New Logo</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Integrations Settings */}
          <TabsContent value="integrations">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    External Integrations
                  </CardTitle>
                  <CardDescription>Connect with external services and APIs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Google Workspace</h4>
                      <p className="text-sm text-muted-foreground">Sync with Gmail, Calendar, and Drive</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Microsoft 365</h4>
                      <p className="text-sm text-muted-foreground">Integration with Office suite and Teams</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Payment Gateway</h4>
                      <p className="text-sm text-muted-foreground">Razorpay, PayU, and other payment processors</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">SMS Service</h4>
                      <p className="text-sm text-muted-foreground">Bulk SMS notifications and alerts</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default InstituteSettings;