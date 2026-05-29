import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bot, Send, X, Sparkles, Brain, Minus, Trash2, 
  ArrowRight, Calendar, FileText, ClipboardList, ShieldAlert, Award
} from "lucide-react";
import api from "@/lib/api";

interface Message {
  id: string;
  sender: "assistant" | "user";
  text: string;
  timestamp: Date;
  intent?: string;
  redirectUrl?: string;
  actionLabel?: string;
}

export const FloatingBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load active user details from local storage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || "Student";
  const name = user.name || "User";

  // Helper for generating initial role-based welcome message
  const getWelcomeMessage = (): Message => {
    let welcomeText = "";
    if (role === "Student") {
      welcomeText = `Hello **${name}**! I am your CampusConnect Student Copilot. I can help you check assignments, mark attendance, view your class schedule, or access study notes.`;
    } else if (role === "Faculty") {
      welcomeText = `Hello Professor **${name}**! I am your Faculty Copilot. Ask me to help you upload study notes, launch a dynamic QR attendance session, manage assignments, or review your teaching schedule.`;
    } else {
      welcomeText = `Hello **${name}**! I am the Admin Operations Assistant. I can guide you through user record administration, financial reports, or inspecting system logs.`;
    }

    return {
      id: "welcome",
      sender: "assistant",
      text: welcomeText,
      timestamp: new Date()
    };
  };

  // 🔄 Fetch chat log history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      setIsLoadingHistory(true);
      try {
        const res = await api.get<any[]>("/chatbot/history", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data && res.data.length > 0) {
          const formatted: Message[] = res.data.map((msg, index) => ({
            id: msg._id || String(index),
            sender: msg.sender,
            text: msg.text,
            timestamp: new Date(msg.timestamp),
            intent: msg.intent,
            redirectUrl: msg.redirectUrl,
            actionLabel: msg.actionLabel
          }));
          setMessages(formatted);
        } else {
          setMessages([getWelcomeMessage()]);
        }
      } catch (err) {
        console.error("Error loading chat history:", err);
        setMessages([getWelcomeMessage()]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [role, name]);

  // Auto scroll to bottom when messages list or typing state changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // 📝 Suggestions based on User Roles
  const getSuggestions = () => {
    if (role === "Student") {
      return [
        { label: "Show assignments", icon: ClipboardList },
        { label: "How to mark attendance?", icon: Award },
        { label: "Show today's schedule", icon: Calendar },
        { label: "View course notes", icon: FileText }
      ];
    } else if (role === "Faculty") {
      return [
        { label: "Manage assignments", icon: ClipboardList },
        { label: "Take attendance", icon: Award },
        { label: "My teaching schedule", icon: Calendar },
        { label: "How to upload notes?", icon: FileText }
      ];
    } else {
      return [
        { label: "Manage users", icon: ClipboardList },
        { label: "View financial reports", icon: FileText },
        { label: "Show academic calendar", icon: Calendar },
        { label: "System logs", icon: ShieldAlert }
      ];
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || prompt;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setPrompt("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.post("/chatbot/message", { message: textToSend }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      const data = res.data;
      const assistantMsg: Message = {
        id: data._id || String(Date.now() + 1),
        sender: "assistant",
        text: data.text,
        timestamp: new Date(data.timestamp),
        intent: data.intent,
        redirectUrl: data.redirectUrl,
        actionLabel: data.actionLabel
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: String(Date.now() + 2),
        sender: "assistant",
        text: "I am having trouble communicating with the API. Please ensure the backend is active and your internet connection is stable.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // 🗑️ Clear conversation history
  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear your chat history?")) {
      try {
        const token = localStorage.getItem("accessToken");
        await api.delete("/chatbot/history", {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setMessages([getWelcomeMessage()]);
      } catch (err) {
        console.error("Error clearing chat history:", err);
      }
    }
  };

  // Format timestamps neatly
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="mb-4 w-96 shadow-elegant"
          >
            <Card className="glass-effect h-[540px] flex flex-col border border-primary/20 bg-background/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
              {/* Header */}
              <CardHeader className="p-4 border-b border-border/40 bg-gradient-to-r from-primary/10 to-primary/5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-black text-foreground flex items-center gap-1.5">
                      <span>CampusConnect Copilot</span>
                    </CardTitle>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
                      <span className="text-[10px] text-muted-foreground font-semibold">Gemini AI Enabled</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 items-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    title="Clear history"
                    className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    onClick={handleClearHistory}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {/* Chat Content */}
              <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-muted">
                {isLoadingHistory ? (
                  <div className="h-full flex items-center justify-center flex-col text-muted-foreground text-xs space-y-2">
                    <Brain className="h-8 w-8 text-primary/40 animate-spin" />
                    <span>Retrieving safe database connection...</span>
                  </div>
                ) : (
                  messages.map((chat) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          chat.sender === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-muted/60 text-foreground border border-border/20 rounded-tl-none'
                        }`}
                      >
                        {chat.sender === 'assistant' ? (
                          <div className="space-y-3">
                            <div 
                              className="space-y-1.5 markdown-chat-bubble" 
                              dangerouslySetInnerHTML={{ 
                                __html: chat.text
                                  .replace(/\n/g, "<br/>")
                                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                  .replace(/\*(.*?)\*/g, "<em>$1</em>")
                                  .replace(/`([^`]+)`/g, "<code class='bg-muted px-1 py-0.5 rounded text-primary font-mono text-[10px]'>$1</code>")
                              }} 
                            />
                            
                            {/* Render Dynamic Nav Action Button */}
                            {chat.redirectUrl && (
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate(chat.redirectUrl!);
                                  }}
                                  className="w-full mt-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-semibold h-8"
                                >
                                  <span>{chat.actionLabel || "Navigate Page"}</span>
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          <p>{chat.text}</p>
                        )}
                        <p className="text-[9px] opacity-60 mt-1.5 text-right">{formatTime(chat.timestamp)}</p>
                      </div>
                    </motion.div>
                  ))
                )}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted/60 border border-border/20 p-3.5 rounded-2xl rounded-tl-none">
                      <div className="flex space-x-1.5 items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Suggestions Panel */}
              {messages.length <= 2 && (
                <div className="px-4 py-2 border-t border-border/20 bg-muted/20">
                  <p className="text-[10px] text-muted-foreground font-semibold mb-2">Try asking me:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {getSuggestions().map((sug, i) => {
                      const SugIcon = sug.icon;
                      return (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleSendMessage(sug.label)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-border bg-background hover:bg-primary/5 hover:border-primary/30 text-[10px] text-muted-foreground hover:text-primary transition-all duration-200"
                        >
                          <SugIcon className="h-3 w-3" />
                          <span>{sug.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Text Input Footer */}
              <div className="p-3 border-t border-border/40 bg-background/50 flex gap-2 items-end">
                <Textarea
                  placeholder={`Ask anything to your ERP Copilot...`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[44px] max-h-[88px] text-[11px] resize-none pr-10 focus-visible:ring-primary border-border/40 bg-background/50 rounded-xl py-2.5"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={() => handleSendMessage()}
                  disabled={!prompt.trim() || isTyping}
                  className="bg-primary text-primary-foreground shadow-sm rounded-xl h-10 w-10 flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg relative group border border-white/10"
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Sparkles className="w-6 h-6 animate-pulse" />
        )}
      </motion.button>
    </div>
  );
};
