import { motion } from 'framer-motion';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Target, BookOpen, Users, Award } from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AIPredictions = () => {
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const performanceTrend = [
    { month: 'Aug', score: 78 },
    { month: 'Sep', score: 82 },
    { month: 'Oct', score: 85 },
    { month: 'Nov', score: 88 },
    { month: 'Dec', score: 91 },
    { month: 'Jan', score: 89 }
  ];

  const predictions = [
    {
      id: 1,
      student: 'Aarav Sharma',
      rollNo: 'CSE2024001',
      subject: 'Data Structures',
      currentScore: 78,
      predictedScore: 85,
      trend: 'improving',
      riskLevel: 'low',
      recommendations: ['Focus on tree algorithms', 'Practice more coding problems'],
      confidence: 92
    },
    {
      id: 2,
      student: 'Priya Patel',
      rollNo: 'CSE2024002',
      subject: 'Machine Learning',
      currentScore: 65,
      predictedScore: 58,
      trend: 'declining',
      riskLevel: 'high',
      recommendations: ['Attend extra tutorials', 'Improve mathematical foundations'],
      confidence: 88
    },
    {
      id: 3,
      student: 'Rohan Gupta',
      rollNo: 'CSE2024003',
      subject: 'Database Systems',
      currentScore: 88,
      predictedScore: 92,
      trend: 'improving',
      riskLevel: 'low',
      recommendations: ['Continue current study pattern', 'Explore advanced topics'],
      confidence: 95
    }
  ];

  const classAnalytics = [
    { subject: 'Data Structures', avgScore: 82, predicted: 85, atRisk: 3 },
    { subject: 'Machine Learning', avgScore: 75, predicted: 78, atRisk: 8 },
    { subject: 'Database Systems', avgScore: 86, predicted: 88, atRisk: 2 },
    { subject: 'Algorithms', avgScore: 79, predicted: 83, atRisk: 5 }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'improving' ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high': return <Badge variant="destructive">High Risk</Badge>;
      case 'medium': return <Badge variant="secondary">Medium Risk</Badge>;
      default: return <Badge variant="default">Low Risk</Badge>;
    }
  };

  return (
    <motion.div 
      className="space-y-6 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <BreadcrumbNav />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            AI Predictions
          </h1>
          <p className="text-muted-foreground mt-2">AI-powered student performance predictions and recommendations</p>
        </div>
        <Button className="glass-card">
          <Brain className="w-4 h-4 mr-2" />
          Generate New Predictions
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Students Analyzed</p>
                  <p className="text-2xl font-bold">2,847</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">At Risk Students</p>
                  <p className="text-2xl font-bold text-red-500">18</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Prediction Accuracy</p>
                  <p className="text-2xl font-bold text-green-500">94.2%</p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Improvements</p>
                  <p className="text-2xl font-bold text-purple-500">156</p>
                </div>
                <Award className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Subject-wise Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="hsl(var(--primary))" />
                  <Bar dataKey="predicted" fill="hsl(var(--secondary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Student Predictions</CardTitle>
            <div className="flex gap-4 items-center">
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="at_risk">At Risk Only</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="ds">Data Structures</SelectItem>
                  <SelectItem value="ml">Machine Learning</SelectItem>
                  <SelectItem value="db">Database Systems</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.map((prediction, index) => (
                <motion.div
                  key={prediction.id}
                  className="p-4 border rounded-lg glass-card hover:bg-accent/50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold">{prediction.student}</h3>
                          <p className="text-sm text-muted-foreground">{prediction.rollNo} • {prediction.subject}</p>
                        </div>
                        {getTrendIcon(prediction.trend)}
                        {getRiskBadge(prediction.riskLevel)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current Score</span>
                            <span className="font-medium">{prediction.currentScore}%</span>
                          </div>
                          <Progress value={prediction.currentScore} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Predicted Score</span>
                            <span className={`font-medium ${prediction.predictedScore > prediction.currentScore ? 'text-green-500' : 'text-red-500'}`}>
                              {prediction.predictedScore}%
                            </span>
                          </div>
                          <Progress value={prediction.predictedScore} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Confidence</span>
                            <span className="font-medium">{prediction.confidence}%</span>
                          </div>
                          <Progress value={prediction.confidence} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">AI Recommendations:</p>
                        <div className="flex flex-wrap gap-1">
                          {prediction.recommendations.map((rec, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {rec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">View Details</Button>
                      <Button size="sm" className="glass-card">Send Alert</Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AIPredictions;