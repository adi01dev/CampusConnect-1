import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";

const FacultySchedule = () => {
  const [currentWeek, setCurrentWeek] = useState(0);

  const schedule = [
    {
      day: "Monday",
      classes: [
        { time: "9:00 - 10:00", subject: "Data Structures", room: "CS-101", class: "CS 3rd Year", type: "Lecture" },
        { time: "11:00 - 12:00", subject: "Algorithms", room: "CS-102", class: "CS 3rd Year", type: "Lab" },
        { time: "14:00 - 15:00", subject: "Database Systems", room: "CS-103", class: "CS 4th Year", type: "Lecture" },
      ],
    },
    {
      day: "Tuesday",
      classes: [
        { time: "10:00 - 11:00", subject: "Data Structures", room: "CS-101", class: "CS 3rd Year", type: "Lab" },
        { time: "15:00 - 16:00", subject: "Algorithms", room: "CS-102", class: "CS 3rd Year", type: "Lecture" },
      ],
    },
    {
      day: "Wednesday",
      classes: [
        { time: "9:00 - 10:00", subject: "Database Systems", room: "CS-103", class: "CS 4th Year", type: "Lab" },
        { time: "11:00 - 12:00", subject: "Data structures", room: "CS-101", class: "CS 3rd Year", type: "Tutorial" },
        { time: "14:00 - 15:00", subject: "Algorithms", room: "CS-102", class: "CS 3rd Year", type: "Lecture" },
      ],
    },
    {
      day: "Thursday",
      classes: [
        { time: "10:00 - 11:00", subject: "Database Systems", room: "CS-103", class: "CS 4th Year", type: "Lecture" },
        { time: "14:00 - 15:00", subject: "Data Structures", room: "CS-101", class: "CS 3rd Year", type: "Lecture" },
      ],
    },
    {
      day: "Friday",
      classes: [
        { time: "9:00 - 10:00", subject: "Algorithms", room: "CS-102", class: "CS 3rd Year", type: "Lab" },
        { time: "11:00 - 12:00", subject: "Database Systems", room: "CS-103", class: "CS 4th Year", type: "Tutorial" },
      ],
    },
  ];

  const stats = [
    { label: "Total Classes", value: "18", color: "text-blue-600" },
    { label: "Lectures", value: "8", color: "text-green-600" },
    { label: "Labs", value: "6", color: "text-purple-600" },
    { label: "Tutorials", value: "4", color: "text-orange-600" },
  ];

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Lecture: "default",
      Lab: "secondary",
      Tutorial: "outline",
    };
    return colors[type] || "default";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              My Schedule
            </h1>
            <p className="text-muted-foreground mt-1">View and manage your teaching schedule</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Export Schedule
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground">This week</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Week Navigation */}
        <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Weekly Schedule
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentWeek(currentWeek - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-4">
                  {currentWeek === 0 ? "Current Week" : `Week ${currentWeek > 0 ? "+" : ""}${currentWeek}`}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentWeek(currentWeek + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {schedule.map((day, dayIndex) => (
                <div key={dayIndex} className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {day.day}
                  </h3>
                  <div className="grid gap-3">
                    {day.classes.map((classItem, classIndex) => (
                      <div
                        key={classIndex}
                        className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border/50"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-base">{classItem.subject}</h4>
                              <Badge variant={getTypeColor(classItem.type) as any}>
                                {classItem.type}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {classItem.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {classItem.room}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {classItem.class}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              Attendance
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Important dates and meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">Faculty Meeting</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Monthly department meeting - Conference Hall
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      March 15, 2024 at 3:00 PM
                    </p>
                  </div>
                  <Badge>Upcoming</Badge>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">Mid-Term Exam</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Data Structures - CS 3rd Year
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      March 20, 2024 at 10:00 AM
                    </p>
                  </div>
                  <Badge variant="secondary">Scheduled</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultySchedule;
