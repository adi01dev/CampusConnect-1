import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BreadcrumbNav } from "@/components/ui/breadcrumb-nav";
import { Brain, BookOpen, Trophy, TrendingUp, Star, Target, Lightbulb, Users, Clock, ChevronRight } from "lucide-react";

const AIRecommendations = () => {
  const courseRecommendations = [
    {
      id: "1",
      title: "Advanced Machine Learning",
      category: "Computer Science",
      match: 95,
      reason: "Based on your excellent performance in Data Structures and AI Fundamentals",
      difficulty: "Advanced",
      duration: "4 months",
      instructor: "Dr. Priya Sharma",
      prerequisites: ["Python Programming", "Statistics"],
    },
    {
      id: "2",
      title: "Digital Marketing Analytics",
      category: "Business",
      match: 88,
      reason: "Complements your interest in data analysis and business applications",
      difficulty: "Intermediate",
      duration: "3 months",
      instructor: "Prof. Rajesh Kumar",
      prerequisites: ["Marketing Basics"],
    },
    {
      id: "3",
      title: "Cloud Computing Architecture",
      category: "Technology",
      match: 82,
      reason: "High demand skill that aligns with your technical background",
      difficulty: "Intermediate",
      duration: "3.5 months",
      instructor: "Dr. Anita Desai",
      prerequisites: ["Network Fundamentals"],
    },
  ];

  const careerPaths = [
    {
      id: "1",
      title: "Data Scientist",
      match: 92,
      description: "Analyze complex data to help organizations make informed decisions",
      skills: ["Python", "Machine Learning", "Statistics", "SQL"],
      averageSalary: "₹12-18 LPA",
      growth: "High",
    },
    {
      id: "2",
      title: "Full Stack Developer",
      match: 87,
      description: "Build complete web applications from frontend to backend",
      skills: ["React", "Node.js", "Database Design", "DevOps"],
      averageSalary: "₹8-15 LPA",
      growth: "Very High",
    },
    {
      id: "3",
      title: "Product Manager",
      match: 78,
      description: "Lead product development and strategy for tech companies",
      skills: ["Analytics", "Strategy", "Communication", "Leadership"],
      averageSalary: "₹15-25 LPA",
      growth: "High",
    },
  ];

  const studyRecommendations = [
    {
      type: "Focus Area",
      title: "Strengthen Mathematics Foundation",
      description: "Based on recent performance, additional practice in calculus would benefit your ML courses",
      priority: "high",
      timeEstimate: "2-3 hours/week",
    },
    {
      type: "Study Method",
      title: "Join Study Groups",
      description: "Students with similar learning patterns show 23% better performance in group studies",
      priority: "medium",
      timeEstimate: "1 hour/week",
    },
    {
      type: "Resource",
      title: "Practice Coding Daily",
      description: "Regular coding practice will improve your problem-solving speed by 40%",
      priority: "high",
      timeEstimate: "30 min/day",
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-red-200 bg-red-50";
      case "medium": return "border-yellow-200 bg-yellow-50";
      case "low": return "border-green-200 bg-green-50";
      default: return "border-gray-200 bg-gray-50";
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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Recommendations</h1>
            <p className="text-muted-foreground">Personalized suggestions to enhance your academic journey</p>
          </div>
        </div>

        {/* Course Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Recommended Courses
              </CardTitle>
              <CardDescription>Courses tailored to your interests and academic performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courseRecommendations.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 border rounded-lg bg-card/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.category}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-bold text-lg">{course.match}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Match</p>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3 text-muted-foreground">{course.reason}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getDifficultyColor(course.difficulty)}>
                        {course.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {course.duration}
                      </Badge>
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {course.instructor}
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Prerequisites:</p>
                      <div className="flex gap-1 flex-wrap">
                        {course.prerequisites.map((prereq, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {prereq}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Progress value={course.match} className="mb-3" />
                    
                    <div className="flex gap-2">
                      <Button size="sm">
                        Enroll Now
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">Learn More</Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Career Path Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Career Path Recommendations
              </CardTitle>
              <CardDescription>Career options based on your skills and interests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {careerPaths.map((career, index) => (
                  <motion.div
                    key={career.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="p-4 border rounded-lg bg-card/50"
                  >
                    <div className="text-center mb-3">
                      <h3 className="font-semibold text-lg">{career.title}</h3>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold">{career.match}%</span>
                        <span className="text-sm text-muted-foreground">Match</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{career.description}</p>
                    
                    <div className="space-y-2 mb-3">
                      <div>
                        <p className="text-sm font-medium">Key Skills:</p>
                        <div className="flex gap-1 flex-wrap mt-1">
                          {career.skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Salary Range:</span>
                        <span className="font-medium">{career.averageSalary}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span>Growth Potential:</span>
                        <Badge variant="outline" className="text-green-600">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {career.growth}
                        </Badge>
                      </div>
                    </div>
                    
                    <Button size="sm" className="w-full">
                      Explore Path
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Study Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Study Recommendations
              </CardTitle>
              <CardDescription>Personalized tips to improve your academic performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studyRecommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border rounded-lg ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {rec.type}
                        </Badge>
                        <h3 className="font-semibold">{rec.title}</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {rec.timeEstimate}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                    <Button size="sm" variant="outline">
                      Get Started
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AIRecommendations;