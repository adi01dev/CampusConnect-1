import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone,
  Mail,
  Lock,
  Eye,
  Download,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyDigest: true,
    assignmentReminders: true,
    attendanceAlerts: true,
    
    // Privacy
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    
    // Appearance
    theme: 'system',
    language: 'english',
    fontSize: 'medium',
    animations: true,
    
    // Academic
    defaultCalendarView: 'month',
    startOfWeek: 'monday',
    timeFormat: '12hour',
    
    // Security
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30min'
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved.",
    });
  };

  const exportData = () => {
    toast({
      title: "Data Export Started",
      description: "Your data export will be available for download in a few minutes.",
    });
  };

  const deleteAccount = () => {
    toast({
      title: "Account Deletion",
      description: "Please contact admin to delete your account.",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription>
                Choose how you want to be notified about important updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in browser
                    </p>
                  </div>
                  <Switch 
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive important alerts via SMS
                    </p>
                  </div>
                  <Switch 
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Weekly summary of your activities
                    </p>
                  </div>
                  <Switch 
                    checked={settings.weeklyDigest}
                    onCheckedChange={(checked) => updateSetting('weeklyDigest', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Assignment Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Reminders for upcoming assignments
                    </p>
                  </div>
                  <Switch 
                    checked={settings.assignmentReminders}
                    onCheckedChange={(checked) => updateSetting('assignmentReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Attendance Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Alerts for low attendance
                    </p>
                  </div>
                  <Switch 
                    checked={settings.attendanceAlerts}
                    onCheckedChange={(checked) => updateSetting('attendanceAlerts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle>Privacy Settings</CardTitle>
              </div>
              <CardDescription>
                Control who can see your information and contact you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose who can view your profile
                  </p>
                  <Select value={settings.profileVisibility} onValueChange={(value) => updateSetting('profileVisibility', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public (Everyone)</SelectItem>
                      <SelectItem value="institute">Institute Only</SelectItem>
                      <SelectItem value="department">Department Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Show Email Address</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your email visible to others
                    </p>
                  </div>
                  <Switch 
                    checked={settings.showEmail}
                    onCheckedChange={(checked) => updateSetting('showEmail', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Show Phone Number</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your phone number visible to others
                    </p>
                  </div>
                  <Switch 
                    checked={settings.showPhone}
                    onCheckedChange={(checked) => updateSetting('showPhone', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Allow Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Let others send you messages
                    </p>
                  </div>
                  <Switch 
                    checked={settings.allowMessages}
                    onCheckedChange={(checked) => updateSetting('allowMessages', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                <CardTitle>Appearance & Display</CardTitle>
              </div>
              <CardDescription>
                Customize how CampusConnect looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose your preferred color scheme
                  </p>
                  <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base">Language</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Select your preferred language
                  </p>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                      <SelectItem value="marathi">मराठी (Marathi)</SelectItem>
                      <SelectItem value="gujarati">ગુજરાતી (Gujarati)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base">Font Size</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Adjust text size for better readability
                  </p>
                  <Select value={settings.fontSize} onValueChange={(value) => updateSetting('fontSize', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable smooth animations and transitions
                    </p>
                  </div>
                  <Switch 
                    checked={settings.animations}
                    onCheckedChange={(checked) => updateSetting('animations', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                <CardTitle>Academic Preferences</CardTitle>
              </div>
              <CardDescription>
                Configure your academic calendar and display options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Default Calendar View</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    How you prefer to view your calendar
                  </p>
                  <Select value={settings.defaultCalendarView} onValueChange={(value) => updateSetting('defaultCalendarView', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day View</SelectItem>
                      <SelectItem value="week">Week View</SelectItem>
                      <SelectItem value="month">Month View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base">Start of Week</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    First day of the week in calendar
                  </p>
                  <Select value={settings.startOfWeek} onValueChange={(value) => updateSetting('startOfWeek', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base">Time Format</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Display time in 12-hour or 24-hour format
                  </p>
                  <Select value={settings.timeFormat} onValueChange={(value) => updateSetting('timeFormat', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12hour">12-hour (2:30 PM)</SelectItem>
                      <SelectItem value="24hour">24-hour (14:30)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                <CardTitle>Security Settings</CardTitle>
              </div>
              <CardDescription>
                Protect your account with advanced security features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch 
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Login Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified of new login attempts
                    </p>
                  </div>
                  <Switch 
                    checked={settings.loginAlerts}
                    onCheckedChange={(checked) => updateSetting('loginAlerts', checked)}
                  />
                </div>

                <div>
                  <Label className="text-base">Session Timeout</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Automatically log out after inactivity
                  </p>
                  <Select value={settings.sessionTimeout} onValueChange={(value) => updateSetting('sessionTimeout', value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15min">15 minutes</SelectItem>
                      <SelectItem value="30min">30 minutes</SelectItem>
                      <SelectItem value="1hour">1 hour</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Button variant="outline" className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  
                  <Button variant="outline" className="w-full" onClick={exportData}>
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
              </div>
              <CardDescription>
                Actions that cannot be undone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={deleteAccount}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;