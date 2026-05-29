import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Calendar as CalendarIcon, Clock, BookOpen, Users, MapPin, Bell, Download, Plus } from "lucide-react";
import { useState } from "react";

const AcademicCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const upcomingEvents = [
    {
      id: 1,
      title: "Mid-Term Examinations",
      date: "2024-04-15",
      time: "09:00 AM",
      type: "exam",
      location: "Main Examination Hall",
      description: "Mid-semester examinations for all subjects"
    },
    {
      id: 2,
      title: "Project Submission Deadline",
      date: "2024-04-20",
      time: "11:59 PM",
      type: "deadline",
      location: "Online Portal",
      description: "Final project submission for Software Engineering"
    },
    {
      id: 3,
      title: "Guest Lecture - AI in Healthcare",
      date: "2024-04-25",
      time: "02:00 PM",
      type: "lecture",
      location: "Auditorium A",
      description: "Special lecture by Dr. Priya Sharma from AIIMS"
    },
    {
      id: 4,
      title: "Career Fair",
      date: "2024-05-02",
      time: "10:00 AM",
      type: "event",
      location: "Campus Ground",
      description: "Annual career fair with 50+ companies"
    },
    {
      id: 5,
      title: "Summer Break Begins",
      date: "2024-05-15",
      time: "All Day",
      type: "holiday",
      location: "Campus Wide",
      description: "Summer vacation starts"
    }
  ];

  const academicSchedule = [
    {
      semester: "Spring 2024",
      startDate: "2024-01-15",
      endDate: "2024-05-15",
      events: [
        { name: "Classes Begin", date: "2024-01-15" },
        { name: "Add/Drop Period", date: "2024-01-22" },
        { name: "Mid-Term Exams", date: "2024-04-15" },
        { name: "Final Exams", date: "2024-05-01" },
        { name: "Results Declaration", date: "2024-05-15" }
      ]
    }
  ];

  const holidays = [
    { name: "Republic Day", date: "2024-01-26" },
    { name: "Holi", date: "2024-03-25" },
    { name: "Ram Navami", date: "2024-04-17" },
    { name: "Good Friday", date: "2024-03-29" },
    { name: "Independence Day", date: "2024-08-15" },
    { name: "Gandhi Jayanti", date: "2024-10-02" },
    { name: "Diwali", date: "2024-11-01" }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "exam": return "text-red-600 border-red-200 bg-red-50";
      case "deadline": return "text-orange-600 border-orange-200 bg-orange-50";
      case "lecture": return "text-blue-600 border-blue-200 bg-blue-50";
      case "event": return "text-green-600 border-green-200 bg-green-50";
      case "holiday": return "text-purple-600 border-purple-200 bg-purple-50";
      default: return "text-gray-600 border-gray-200 bg-gray-50";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "exam": return <BookOpen className="h-4 w-4" />;
      case "deadline": return <Clock className="h-4 w-4" />;
      case "lecture": return <Users className="h-4 w-4" />;
      case "event": return <CalendarIcon className="h-4 w-4" />;
      case "holiday": return <CalendarIcon className="h-4 w-4" />;
      default: return <CalendarIcon className="h-4 w-4" />;
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
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Academic Calendar</h1>
              <p className="text-muted-foreground">Stay updated with important academic dates and events</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Set Reminder
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export Calendar
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Widget */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Select a date to view events</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="glassmorphism mt-6">
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Exams</span>
                  <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">2</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Deadlines</span>
                  <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">3</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Events</span>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">5</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Holidays</span>
                  <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">2</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                <TabsTrigger value="schedule">Academic Schedule</TabsTrigger>
                <TabsTrigger value="holidays">Holidays</TabsTrigger>
              </TabsList>

              {/* Upcoming Events */}
              <TabsContent value="upcoming">
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>Important dates and deadlines</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingEvents.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                          className="p-4 border rounded-lg bg-card/50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">{event.title}</h3>
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            </div>
                            <Badge className={getEventTypeColor(event.type)}>
                              {getEventIcon(event.type)}
                              {event.type.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-3 w-3" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline">
                              <Bell className="mr-2 h-3 w-3" />
                              Set Reminder
                            </Button>
                            <Button size="sm" variant="outline">View Details</Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Academic Schedule */}
              <TabsContent value="schedule">
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle>Academic Schedule</CardTitle>
                    <CardDescription>Semester timeline and important academic dates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {academicSchedule.map((semester, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-4"
                      >
                        <div className="border-l-4 border-primary pl-4">
                          <h3 className="font-semibold text-lg">{semester.semester}</h3>
                          <p className="text-sm text-muted-foreground">
                            {semester.startDate} to {semester.endDate}
                          </p>
                        </div>
                        
                        <div className="space-y-3 ml-6">
                          {semester.events.map((event, eventIndex) => (
                            <motion.div
                              key={eventIndex}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: eventIndex * 0.1 }}
                              className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                            >
                              <div>
                                <h4 className="font-medium">{event.name}</h4>
                              </div>
                              <span className="text-sm text-muted-foreground">{event.date}</span>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Holidays */}
              <TabsContent value="holidays">
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle>National & Festival Holidays</CardTitle>
                    <CardDescription>Official holidays when the institute is closed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {holidays.map((holiday, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                          className="p-4 border rounded-lg bg-card/50 text-center"
                        >
                          <div className="text-2xl mb-2">🎉</div>
                          <h3 className="font-semibold">{holiday.name}</h3>
                          <p className="text-sm text-muted-foreground">{holiday.date}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AcademicCalendar;