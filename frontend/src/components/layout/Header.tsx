import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Bell, MessageSquare, Settings, User, Sun, Moon, Monitor, Download, Wifi, WifiOff } from 'lucide-react';

import { toast } from 'sonner';

interface User {
  email: string;
  role: string;
  name: string;
  profileImage?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const BACKEND_URL = API_BASE.replace('/api', '');

interface HeaderProps {
  user: User;
}

export const Header = ({ user }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    const handleConnectivity = (e: any) => {
      setIsOnline(e.detail.online);
    };
    const handleInstallable = (e: any) => {
      setInstallable(e.detail.installable);
    };

    window.addEventListener("pwa-connectivity", handleConnectivity as EventListener);
    window.addEventListener("pwa-installable", handleInstallable as EventListener);

    return () => {
      window.removeEventListener("pwa-connectivity", handleConnectivity as EventListener);
      window.removeEventListener("pwa-installable", handleInstallable as EventListener);
    };
  }, []);

  const triggerInstall = () => {
    window.dispatchEvent(new CustomEvent("pwa-trigger-install"));
  };


  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/')) {
      return `${user.role} Dashboard`;
    }

    const titleMap: Record<string, string> = {
      '/profile': 'My Profile',
      '/settings': 'Settings',
      '/analytics': 'Analytics & Reports',
      '/manage-users': 'User Management',
      '/system-logs': 'System Logs',
      '/department-staff': 'Department Staff',
      '/subject-assignment': 'Subject Assignment',
      '/student-management': 'Student Management',
      '/upload-materials': 'Upload Materials',
      '/qr-attendance': 'QR Code Attendance',
      '/ai-predictions': 'AI Performance Predictions',
      '/student-queries': 'Student Queries',
      '/my-courses': 'My Courses',
      '/class-schedule': 'Class Schedule',
      '/my-attendance': 'My Attendance',
      '/fee-payment': 'Fee Payment',
      '/mou-requests': 'MoU Requests',
      '/ai-recommendations': 'AI Recommendations',
      '/document-management': 'Document Management',
      '/file-storage': 'File Storage',
      '/fee-management': 'Fee Management',
      '/payment-history': 'Payment History',
      '/ai-assistant': 'AI Assistant',
      '/help': 'Help & Support'
    };

    return titleMap[path] || 'CampusConnect';
  };

  const handleLogout = () => {
    localStorage.removeItem('campusConnectUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    toast("Logged out successfully. See you soon!");
    navigate('/login');
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Title & Search */}
        <div className="flex items-center gap-6 flex-1">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{getPageTitle()}</h1>
            <p className="text-sm text-muted-foreground">{getCurrentTime()}</p>
          </div>

          <div className="hidden md:block flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/30 border-0 focus:bg-background transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center gap-4">
          {/* Quick Stats */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Today's Classes</p>
              <p className="text-sm font-semibold">6</p>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Pending Tasks</p>
              <p className="text-sm font-semibold text-warning">3</p>
            </div>
          </div>
          
          {/* PWA Install Button */}
          {installable && (
            <Button
              onClick={triggerInstall}
              size="sm"
              variant="outline"
              className="animate-pulse border-primary/40 text-primary hover:bg-primary/10 gap-1.5 h-9 rounded-xl font-bold text-xs uppercase tracking-wider hidden md:flex"
            >
              <Download className="w-3.5 h-3.5" />
              Install App
            </Button>
          )}

          {/* PWA Connectivity Badge */}
          <Badge
            variant={isOnline ? "default" : "destructive"}
            className="gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center h-7 shadow-sm border border-white/10"
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-green-400" />
                <span>Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 animate-pulse text-orange-200" />
                <span>Offline</span>
              </>
            )}
          </Badge>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3 py-2 hover:bg-primary/10">
                <Avatar className="w-8 h-8">
                  {user.profileImage && (
                    <AvatarImage
                      src={user.profileImage.startsWith('http') ? user.profileImage : `${BACKEND_URL}${user.profileImage}`}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-blue-600 text-white text-sm font-bold">
                    {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate('/profile')} className='cursor-pointer'>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className='cursor-pointer'>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};