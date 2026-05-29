import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  X, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BookOpen,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'event';
  timestamp: string;
  read: boolean;
  icon?: React.ReactNode;
}

interface NotificationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: Notification[];
}

export const NotificationPopup = ({ 
  isOpen, 
  onClose, 
  notifications = defaultNotifications 
}: NotificationPopupProps) => {
  const [localNotifications, setLocalNotifications] = useState(notifications);

  const markAsRead = (id: string) => {
    setLocalNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setLocalNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = localNotifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20">
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <Card className="relative w-96 max-h-[80vh] bg-card border shadow-xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-96">
          <div className="p-2">
            {localNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="space-y-2">
                {localNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={() => markAsRead(notification.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => {
              // Navigate to notifications page
              onClose();
            }}
          >
            View All Notifications
          </Button>
        </div>
      </Card>
    </div>
  );
};

const NotificationItem = ({ 
  notification, 
  onClick 
}: { 
  notification: Notification;
  onClick: () => void;
}) => {
  const getIcon = () => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case 'event':
        return <Calendar className="w-4 h-4 text-primary" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50",
        notification.read ? "bg-transparent" : "bg-primary/5 border-primary/20"
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between">
            <h4 className={cn(
              "text-sm font-medium",
              !notification.read && "text-primary"
            )}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            {notification.message}
          </p>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {notification.timestamp}
          </div>
        </div>
      </div>
    </div>
  );
};

const defaultNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Assignment Posted',
    message: 'Dr. Priya Sharma posted a new assignment for Data Structures',
    type: 'info',
    timestamp: '2 minutes ago',
    read: false,
    icon: <BookOpen className="w-4 h-4 text-primary" />
  },
  {
    id: '2',
    title: 'Fee Payment Reminder',
    message: 'Your semester fee of ₹45,000 is due on 15th January 2024',
    type: 'warning',
    timestamp: '1 hour ago',
    read: false,
    icon: <AlertTriangle className="w-4 h-4 text-warning" />
  },
  {
    id: '3',
    title: 'Attendance Updated',
    message: 'Your attendance has been marked for Computer Networks lecture',
    type: 'success',
    timestamp: '3 hours ago',
    read: true,
    icon: <CheckCircle className="w-4 h-4 text-success" />
  },
  {
    id: '4',
    title: 'Parent-Teacher Meeting',
    message: 'Scheduled for 20th January 2024 at 2:00 PM with Prof. Rajesh Kumar',
    type: 'event',
    timestamp: '1 day ago',
    read: false,
    icon: <Users className="w-4 h-4 text-primary" />
  },
  {
    id: '5',
    title: 'Library Book Due',
    message: 'Return "Advanced Algorithms" by 18th January 2024',
    type: 'warning',
    timestamp: '2 days ago',
    read: true,
    icon: <BookOpen className="w-4 h-4 text-warning" />
  }
];