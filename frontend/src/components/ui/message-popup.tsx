import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  X, 
  Send,
  Phone,
  Video,
  MoreVertical,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender: string;
  senderRole: string;
  content: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
}

interface Conversation {
  id: string;
  participant: string;
  participantRole: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: Message[];
}

interface MessagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  conversations?: Conversation[];
}

export const MessagePopup = ({ 
  isOpen, 
  onClose, 
  conversations = defaultConversations 
}: MessagePopupProps) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  const activeConversation = conversations.find(conv => conv.id === selectedConversation);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // Here you would typically send the message to your backend
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20">
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <Card className="relative w-96 h-[500px] bg-card border shadow-xl animate-slide-in-right flex flex-col">
        {selectedConversation ? (
          // Chat View
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedConversation(null)}
                  className="p-1"
                >
                  ←
                </Button>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-sm">
                    {activeConversation?.participant.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-sm">{activeConversation?.participant}</h4>
                  <p className="text-xs text-muted-foreground">{activeConversation?.participantRole}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {activeConversation?.messages.map((message) => (
                  <div 
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.sender === "You" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.sender !== "You" && (
                      <Avatar className="w-6 h-6 mt-2">
                        <AvatarFallback className="bg-muted text-xs">
                          {message.sender.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={cn(
                      "max-w-[70%] p-3 rounded-lg text-sm",
                      message.sender === "You" 
                        ? "bg-primary text-primary-foreground ml-auto" 
                        : "bg-muted"
                    )}>
                      <p>{message.content}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                        <Clock className="w-3 h-3" />
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button size="sm" onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // Conversations List
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Messages</h3>
                {totalUnread > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {totalUnread}
                  </Badge>
                )}
              </div>
              
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Conversations */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No messages</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50"
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                              {conversation.participant.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm truncate">
                                {conversation.participant}
                              </h4>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-xs text-muted-foreground">
                                  {conversation.timestamp}
                                </span>
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="destructive" className="text-xs min-w-[20px] h-5">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-1">
                              {conversation.participantRole}
                            </p>
                            
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
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
                  // Navigate to full messages page
                  onClose();
                }}
              >
                View All Messages
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

const defaultConversations: Conversation[] = [
  {
    id: '1',
    participant: 'Dr. Priya Sharma',
    participantRole: 'Computer Science Professor',
    lastMessage: 'Please submit your assignment by tomorrow evening',
    timestamp: '5m ago',
    unreadCount: 2,
    messages: [
      {
        id: '1-1',
        sender: 'Dr. Priya Sharma',
        senderRole: 'Professor',
        content: 'Hello Arjun, I noticed you missed today\'s lecture. Please check the uploaded notes.',
        timestamp: '2:30 PM',
        read: true
      },
      {
        id: '1-2',
        sender: 'You',
        senderRole: 'Student',
        content: 'Thank you Professor. I was unwell today. I\'ll go through the notes.',
        timestamp: '2:45 PM',
        read: true
      },
      {
        id: '1-3',
        sender: 'Dr. Priya Sharma',
        senderRole: 'Professor',
        content: 'Please submit your assignment by tomorrow evening',
        timestamp: '3:00 PM',
        read: false
      }
    ]
  },
  {
    id: '2',
    participant: 'Sneha Patel',
    participantRole: 'Classmate - CSE',
    lastMessage: 'Can you share the lab notes from yesterday?',
    timestamp: '1h ago',
    unreadCount: 1,
    messages: [
      {
        id: '2-1',
        sender: 'Sneha Patel',
        senderRole: 'Student',
        content: 'Hey! Can you share the lab notes from yesterday?',
        timestamp: '1:00 PM',
        read: false
      }
    ]
  },
  {
    id: '3',
    participant: 'Prof. Rajesh Kumar',
    participantRole: 'HOD - Computer Science',
    lastMessage: 'Your scholarship application has been approved',
    timestamp: '2h ago',
    unreadCount: 0,
    messages: [
      {
        id: '3-1',
        sender: 'Prof. Rajesh Kumar',
        senderRole: 'HOD',
        content: 'Congratulations! Your scholarship application has been approved. Please visit my office for documentation.',
        timestamp: '12:00 PM',
        read: true
      },
      {
        id: '3-2',
        sender: 'You',
        senderRole: 'Student',
        content: 'Thank you so much sir! I\'ll visit your office tomorrow morning.',
        timestamp: '12:15 PM',
        read: true
      }
    ]
  }
];