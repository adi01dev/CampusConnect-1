import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Award, BookOpen, Target, Users, Calendar, Download, Filter } from "lucide-react";

const AcademicPerformance = () => {
  const semesterData = [
    { semester: "Sem 1", cgpa: 8.2, credits: 22 },
    { semester: "Sem 2", cgpa: 8.5, credits: 24 },
    { semester: "Sem 3", cgpa: 8.8, credits: 23 },
    { semester: "Sem 4", cgpa: 9.1, credits: 25 },
    { semester: "Sem 5", cgpa: 8.9, credits: 24 },
    { semester: "Sem 6", cgpa: 9.2, credits: 23 },
  ];

  const subjectPerformance = [
    { subject: "Data Structures", grade: "A+", credits: 4, points: 40 },
    { subject: "Computer Networks", grade: "A", credits: 3, points: 27 },
    { subject: "Database Systems", grade: "A+", credits: 4, points: 40 },
    { subject: "Software Engineering", grade: "A", credits: 3, points: 27 },
    { subject: "Machine Learning", grade: "A+", credits: 4, points: 40 },
    { subject: "Web Development", grade: "A", credits: 3, points: 27 },
  ];

  const skillAssessment = [
    { skill: "Programming", score: 92, color: "#3b82f6" },
    { skill: "Problem Solving", score: 88, color: "#10b981" },
    { skill: "Communication", score: 85, color: "#f59e0b" },
    { skill: "Teamwork", score: 90, color: "#8b5cf6" },
    { skill: "Leadership", score: 82, color: "#ef4444" },
  ];

  const achievements = [
    { title: "Dean's List", description: "Academic Excellence", date: "Spring 2024", type: "academic" },
    { title: "Best Project Award", description: "Machine Learning Project", date: "March 2024", type: "project" },
    { title: "Coding Competition", description: "1st Place - TechFest", date: "February 2024", type: "competition" },
    { title: "Research Publication", description: "IEEE Conference Paper", date: "January 2024", type: "research" },
  ];

  const currentCGPA = 9.0;
  const totalCredits = 145;
  const completedCredits = 120;
  const progressPercentage = (completedCredits / totalCredits) * 100;

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
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Academic Performance</h1>
              <p className="text-muted-foreground">Track your academic progress and achievements</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Performance Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="glassmorphism">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Current CGPA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{currentCGPA}</div>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +0.3 from last semester
                </p>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Credits Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedCredits}</div>
                <Progress value={progressPercentage} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  {completedCredits} of {totalCredits} credits
                </p>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Current Rank</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3rd</div>
                <p className="text-sm text-muted-foreground">out of 120 students</p>
              </CardContent>
            </Card>

            <Card className="glassmorphism">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{achievements.length}</div>
                <p className="text-sm text-muted-foreground">this academic year</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle>CGPA Trend</CardTitle>
                  <CardDescription>Your academic performance over semesters</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={semesterData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semester" />
                      <YAxis domain={[7, 10]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="cgpa" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle>Credit Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={semesterData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semester" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="credits" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle>Performance Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-green-800">Consistent Improvement</p>
                        <p className="text-sm text-green-600">CGPA increased by 1.0 points</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-blue-800">Strong in Core Subjects</p>
                        <p className="text-sm text-blue-600">95% A grades in major subjects</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-purple-800">Top 5% Student</p>
                        <p className="text-sm text-purple-600">Consistent high performance</p>
                      </div>
                      <Award className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle>Current Semester Performance</CardTitle>
                  <CardDescription>Detailed breakdown of subject-wise performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjectPerformance.map((subject, index) => (
                      <motion.div
                        key={subject.subject}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border rounded-lg bg-card/50"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{subject.subject}</h3>
                          <p className="text-sm text-muted-foreground">{subject.credits} Credits</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">{subject.points} Points</p>
                            <p className="text-sm text-muted-foreground">Grade Points</p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={subject.grade.includes('+') ? 'text-green-600 border-green-200 bg-green-50' : 'text-blue-600 border-blue-200 bg-blue-50'}
                          >
                            {subject.grade}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle>Skill Assessment</CardTitle>
                  <CardDescription>Based on projects, assignments, and peer evaluations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {skillAssessment.map((skill, index) => (
                      <motion.div
                        key={skill.skill}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">{skill.skill}</span>
                          <span className="text-sm text-muted-foreground">{skill.score}%</span>
                        </div>
                        <Progress value={skill.score} className="h-2" />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Academic Achievements
                  </CardTitle>
                  <CardDescription>Your notable accomplishments and recognitions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-4 p-4 border rounded-lg bg-card/50"
                      >
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{achievement.date}</p>
                          <Badge variant="outline" className="text-xs">
                            {achievement.type}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AcademicPerformance;