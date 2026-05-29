import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, MessageSquare, Phone, Mail, Search, BookOpen, Video, FileText } from "lucide-react";
import { useState } from "react";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "Go to Settings > Profile > Change Password. You'll need to enter your current password and then your new password twice for confirmation.",
      category: "Account",
    },
    {
      question: "How can I view my attendance records?",
      answer: "Navigate to My Attendance from the sidebar. You can view your attendance by subject, date range, and download detailed reports.",
      category: "Attendance",
    },
    {
      question: "Where can I submit my assignments?",
      answer: "Go to My Assignments, select the assignment you want to submit, and click the Submit button. You can upload files or provide text submissions based on the assignment type.",
      category: "Assignments",
    },
    {
      question: "How do I pay my fees online?",
      answer: "Visit Fee Payment from the menu, select the fee type, verify the amount, and proceed to payment gateway. Multiple payment options are available including UPI, cards, and net banking.",
      category: "Fees",
    },
    {
      question: "How can I contact my faculty?",
      answer: "Faculty contact information is available in Department Staff section. You can also use the Student Queries feature to send messages directly.",
      category: "Communication",
    },
    {
      question: "Where can I download study materials?",
      answer: "Study materials are available in My Courses section. Select your course and navigate to the Materials tab to download resources uploaded by your faculty.",
      category: "Academics",
    },
  ];

  const resources = [
    {
      title: "User Guide",
      description: "Comprehensive guide to using the platform",
      icon: BookOpen,
      link: "#",
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video demonstrations",
      icon: Video,
      link: "#",
    },
    {
      title: "Documentation",
      description: "Detailed technical documentation",
      icon: FileText,
      link: "#",
    },
  ];

  const contactMethods = [
    {
      title: "Email Support",
      description: "support@college.edu",
      icon: Mail,
      action: "Send Email",
    },
    {
      title: "Phone Support",
      description: "+91 1800-XXX-XXXX",
      icon: Phone,
      action: "Call Now",
    },
    {
      title: "Live Chat",
      description: "Available 9 AM - 6 PM IST",
      icon: MessageSquare,
      action: "Start Chat",
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Help & Support
          </h1>
          <p className="text-muted-foreground">
            Find answers to common questions and get assistance
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help articles, guides, or FAQs..."
              className="pl-10 h-12 backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactMethods.map((method, index) => (
            <Card
              key={index}
              className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <method.icon className="h-8 w-8 text-primary" />
                  <Badge variant="outline">Available</Badge>
                </div>
                <CardTitle className="text-lg mt-4">{method.title}</CardTitle>
                <CardDescription>{method.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  {method.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions and answers about using the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{faq.category}</Badge>
                      <span>{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Resources */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resources.map((resource, index) => (
            <Card
              key={index}
              className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <CardHeader>
                <resource.icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Access Resource
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit Ticket */}
        <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Submit a Support Ticket
            </CardTitle>
            <CardDescription>
              Can't find what you're looking for? Send us a detailed message
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Name</label>
                  <Input placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="Enter your email" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input placeholder="Brief description of your issue" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Describe your issue in detail..."
                  rows={6}
                />
              </div>
              <Button className="w-full md:w-auto gap-2">
                <MessageSquare className="h-4 w-4" />
                Submit Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Help;
