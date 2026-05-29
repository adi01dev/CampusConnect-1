import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  User,
  Building,
  ChevronRight,
  Bell,
  MessageSquare,
  BarChart3,
  QrCode,
  Upload,
  Download,
  DollarSign,
  UserCheck,
  Brain,
  HelpCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const BACKEND_URL = API_BASE.replace('/api', '');

interface User {
  email: string;
  role: string;
  name: string;
  profileImage?: string;
}

interface SidebarProps {
  user: User;
}

export const Sidebar = ({ user }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('campusConnectUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    toast({
      title: "Logged out successfully",
      description: "See you soon!",
    });
    navigate('/login');
  };

  const getNavigationItems = () => {
    const baseItems = [
      {
        icon: LayoutDashboard,
        label: 'Dashboard',
        path: `/dashboard/${(user.role || '').toLowerCase()}`,
        badge: null
      },
      {
        icon: User,
        label: 'Profile',
        path: `/profile`,
        badge: null
      },
    ];

    const roleSpecificItems: Record<string, any[]> = {
      'Principal': [
        { icon: BarChart3, label: 'Analytics & Reports', path: '/analytics', badge: 'New' },
        { icon: Users, label: 'Manage All Roles', path: '/manage-users', badge: null },
        { icon: Building, label: 'System Logs', path: '/system-logs', badge: null },
        { icon: FileText, label: 'Academic Performance', path: '/academic-performance', badge: null },
        { icon: Settings, label: 'Institute Settings', path: '/institute-settings', badge: null },
      ],
      'HOD': [
        { icon: Users, label: 'Department Staff', path: '/department-staff', badge: null },
        { icon: BookOpen, label: 'Subject Assignment', path: '/subject-assignment', badge: null },
        { icon: GraduationCap, label: 'Student Management', path: '/student-management', badge: '24' },
        { icon: BarChart3, label: 'Department Analytics', path: '/department-analytics', badge: null },
        { icon: Calendar, label: 'Academic Calendar', path: '/academic-calendar', badge: null },
      ],
      'Faculty': [
        { icon: Upload, label: 'Upload Materials', path: '/upload-materials', badge: null },
        { icon: QrCode, label: 'QR Attendance', path: '/qr-attendance', badge: 'Live' },
        { icon: Brain, label: 'AI Predictions', path: '/ai-predictions', badge: 'Beta' },
        { icon: MessageSquare, label: 'Student Queries', path: '/student-queries', badge: '5' },
        { icon: FileText, label: 'Assignments', path: '/assignments', badge: null },
        { icon: Calendar, label: 'Schedule', path: '/faculty-schedule', badge: null },
      ],
      'Student': [
        { icon: BookOpen, label: 'My Courses', path: '/my-courses', badge: null },
        { icon: Calendar, label: 'Class Schedule', path: '/class-schedule', badge: null },
        { icon: UserCheck, label: 'My Attendance', path: '/my-attendance', badge: null },
        {
          icon: FileText, label: 'Assignments', path: "/student/assignments",
          badge: '3 Due'
        },
        { icon: CreditCard, label: 'Fee Payment', path: '/fee-payment', badge: 'Due' },
        { icon: MessageSquare, label: 'MoU Requests', path: '/mou-requests', badge: null },
        { icon: Brain, label: 'AI Recommendations', path: '/ai-recommendations', badge: 'New' },
      ],
      'Admin': [
        { icon: BookOpen, label: 'Subject Assignment', path: '/subject-assignment', badge: 'New' },
        { icon: Upload, label: 'Document Management', path: '/document-management', badge: null },
        { icon: Download, label: 'File Storage', path: '/file-storage', badge: null },
        { icon: Users, label: 'User Records', path: '/user-records', badge: null },
        { icon: Building, label: 'System Management', path: '/system-management', badge: null },
        { icon: Bell, label: 'Notifications', path: '/admin-notifications', badge: '12' },
      ],
      'Accountant': [
        { icon: DollarSign, label: 'Fee Management', path: '/fee-management', badge: null },
        { icon: CreditCard, label: 'Payment History', path: '/payment-history', badge: null },
        { icon: FileText, label: 'Generate Receipts', path: '/generate-receipts', badge: null },
        { icon: BarChart3, label: 'Financial Reports', path: '/financial-reports', badge: null },
        { icon: Bell, label: 'Payment Reminders', path: '/payment-reminders', badge: '8' },
      ]
    };

    return [...baseItems, ...roleSpecificItems[user.role] || []];
  };

  const navigationItems = getNavigationItems();

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      'Principal': 'text-primary',
      'HOD': 'text-secondary',
      'Faculty': 'text-success',
      'Student': 'text-warning',
      'Admin': 'text-muted-foreground',
      'Accountant': 'text-destructive'
    };
    return colors[role as keyof typeof colors] || 'text-foreground';
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      'Principal': 'bg-primary/10 text-primary',
      'HOD': 'bg-secondary/10 text-secondary',
      'Faculty': 'bg-success/10 text-success',
      'Student': 'bg-warning/10 text-warning',
      'Admin': 'bg-muted text-muted-foreground',
      'Accountant': 'bg-destructive/10 text-destructive'
    };
    return colors[role as keyof typeof colors] || 'bg-muted text-foreground';
  };

  return (
    <div className="h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-primary p-2 rounded-lg shadow-card">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">CampusConnect</h2>
            <p className="text-xs text-sidebar-foreground/60">ERP System</p>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-sidebar-accent/30 rounded-lg p-3 border border-sidebar-border/50">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              {user.profileImage && (
                <AvatarImage
                  src={user.profileImage.startsWith('http') ? user.profileImage : `${BACKEND_URL}${user.profileImage}`}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-blue-600 text-white font-semibold">
                {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sidebar-foreground truncate">{user.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs px-2 py-0 ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-2">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`
                flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${isActiveLink(item.path)
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm border border-sidebar-border/50'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${isActiveLink(item.path) ? getRoleColor(user.role) : ''}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>

              <div className="flex items-center gap-2">
                {item.badge && (
                  <Badge
                    variant={item.badge === 'New' || item.badge === 'Beta' || item.badge === 'Live' ? 'secondary' : 'destructive'}
                    className="text-xs px-1.5 py-0"
                  >
                    {item.badge}
                  </Badge>
                )}
                {isActiveLink(item.path) && (
                  <ChevronRight className="w-3 h-3 text-sidebar-foreground/50" />
                )}
              </div>
            </Link>
          ))}
        </nav>

        <Separator className="my-6" />

        {/* AI Assistant */}
        <div className="space-y-2">
          <Link
            to="/ai-assistant"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <Brain className="w-4 h-4" />
            <span className="font-medium text-sm">AI Assistant</span>
            <Badge variant="secondary" className="text-xs px-1.5 py-0 ml-auto">AI</Badge>
          </Link>

          <Link
            to="/help"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="font-medium text-sm">Help & Support</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="space-y-2">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          >
            <Settings className="w-4 h-4" />
            <span className="font-medium text-sm">Settings</span>
          </Link>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 px-3 py-2 h-auto text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium text-sm">Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );
};