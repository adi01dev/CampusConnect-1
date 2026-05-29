import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Bot, Send, MessageSquare, Sparkles, BookOpen, Calculator, Calendar, Users, Mic, Image } from "lucide-react";
import { useState } from "react";
import { processFacultyMessage } from "@/lib/nluAgent";

const AIAssistant = () => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    { icon: BookOpen, label: "Help with Assignments", action: "assignment_help" },
    { icon: Calculator, label: "Calculate GPA", action: "gpa_calc" },
    { icon: Calendar, label: "Schedule Reminder", action: "schedule" },
    { icon: Users, label: "Find Study Groups", action: "study_groups" },
  ];

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [history, setHistory] = useState<any[]>([
    {
      id: 1,
      type: "assistant",
      message: user.role === "Faculty"
        ? "Hello! I am your Faculty NLU Agent. I can help you orchestrate your classroom tasks quickly. Try telling me to upload an assignment, start a QR attendance session, upload notes, or respond to student queries."
        : "Hello! I'm your AI assistant. I can help you with academic queries, schedule management, fee calculations, and much more. How can I assist you today?",
      timestamp: "10:30 AM"
    }
  ]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = {
      id: Date.now(),
      type: "user",
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setHistory((prev) => [...prev, userMsg]);
    const currentMsg = message;
    setMessage("");
    setIsTyping(true);

    try {
      if (user.role === "Faculty") {
        const response = await processFacultyMessage(currentMsg, user);
        setHistory((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: "assistant",
            message: response.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        // Fallback simple simulation for non-faculty
        setTimeout(() => {
          setIsTyping(false);
          setHistory((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              type: "assistant",
              message: "I received your message. As a student, you can view study notes, class schedules, ask queries, and explore academic goals.",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 1500);
        return;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

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
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Assistant</h1>
              <p className="text-muted-foreground">Your intelligent academic companion</p>
            </div>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <Sparkles className="mr-1 h-3 w-3" />
            Online
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks I can help you with</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.action}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setMessage(action.label)}
                    >
                      <action.icon className="mr-2 h-4 w-4" />
                      {action.label}
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* AI Capabilities */}
            <Card className="glassmorphism mt-6">
              <CardHeader>
                <CardTitle>What I Can Do</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Answer academic questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Calculate grades and GPA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Schedule management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Fee calculations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Study recommendations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Assignment help</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="glassmorphism h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat with AI Assistant
                </CardTitle>
              </CardHeader>
              
              {/* Chat Messages */}
              <CardContent className="flex-1 overflow-y-auto space-y-4">
                {history.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      chat.type === 'user' 
                        ? 'bg-primary text-primary-foreground animate-fade-in-up' 
                        : 'bg-muted border border-border/20 markdown-chat-bubble'
                    }`}>
                      {chat.type === 'assistant' ? (
                        <div 
                          className="text-sm space-y-1" 
                          dangerouslySetInnerHTML={{ 
                            __html: chat.message
                              .replace(/\n/g, "<br/>")
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(/\*(.*?)\*/g, "<em>$1</em>")
                              .replace(/`([^`]+)`/g, "<code class='bg-muted-foreground/10 px-1 py-0.5 rounded'>$1</code>")
                          }} 
                        />
                      ) : (
                        <p className="text-sm">{chat.message}</p>
                      )}
                      <p className="text-xs opacity-70 mt-1">{chat.timestamp}</p>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
              
              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Ask me anything about your academics, schedule, or institute..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[60px] pr-20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <div className="absolute right-2 bottom-2 flex gap-1">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Image className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIAssistant;