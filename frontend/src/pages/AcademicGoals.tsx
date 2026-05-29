import { motion } from 'framer-motion';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Target, Plus, Trash2, Calendar, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const AcademicGoals = () => {
    const [goals, setGoals] = useState<any[]>([]);
    const [newGoal, setNewGoal] = useState({ title: '', targetValue: 100, deadline: '' });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    const token = localStorage.getItem('accessToken');

    const fetchGoals = async () => {
        try {
            const res = await fetch(`${API_BASE}/dashboard/goals`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setGoals(await res.json());
        } catch (err) {
            console.error("Failed to fetch goals", err);
        }
    };

    useEffect(() => {
        if (token) fetchGoals();
    }, [token]);

    const handleAddGoal = async () => {
        if (!newGoal.title || !newGoal.deadline) {
            toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/dashboard/goals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newGoal)
            });

            if (res.ok) {
                toast({ title: "Goal Created", description: "Your new target has been set!" });
                setIsDialogOpen(false);
                setNewGoal({ title: '', targetValue: 100, deadline: '' });
                fetchGoals();
            }
        } catch (err) {
            toast({ title: "Error", description: "Failed to create goal", variant: "destructive" });
        }
    };

    const deleteGoal = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/dashboard/goals/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setGoals(prev => prev.filter(g => g._id !== id));
                toast({ title: "Goal Removed", description: "Target deleted successfully" });
            } else {
                toast({ title: "Error", description: "Failed to delete goal", variant: "destructive" });
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Connection error", variant: "destructive" });
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
                        Academic Goals
                    </h1>
                    <p className="text-muted-foreground mt-2">Track your targets and academic milestones</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="glass-card shadow-glow">
                            <Plus className="w-4 h-4 mr-2" />
                            Set New Goal
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Define Your Target</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Goal Title</Label>
                                <Input
                                    placeholder="e.g. Master React, Score 90% in ML"
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Target Percentage / Score</Label>
                                <Input
                                    type="number"
                                    value={newGoal.targetValue}
                                    onChange={(e) => setNewGoal({ ...newGoal, targetValue: parseInt(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Deadline</Label>
                                <Input
                                    type="date"
                                    value={newGoal.deadline}
                                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                />
                            </div>
                            <Button className="w-full" onClick={handleAddGoal}>Launch Goal</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card border-l-4 border-blue-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Targets</p>
                                <p className="text-3xl font-black">{goals.length}</p>
                            </div>
                            <Target className="w-10 h-10 text-blue-500/20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-l-4 border-green-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Completed</p>
                                <p className="text-3xl font-black">0</p>
                            </div>
                            <CheckCircle2 className="w-10 h-10 text-green-500/20" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-l-4 border-orange-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Days to Finals</p>
                                <p className="text-3xl font-black">45</p>
                            </div>
                            <Clock className="w-10 h-10 text-orange-500/20" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {goals.length === 0 ? (
                    <Card className="lg:col-span-2 py-20 bg-muted/5 border-dashed border-2">
                        <div className="text-center space-y-4">
                            <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground/20" />
                            <p className="text-lg font-bold text-muted-foreground">No goals set yet.</p>
                            <p className="text-sm text-muted-foreground">Start by setting your first academic target!</p>
                        </div>
                    </Card>
                ) : goals.map((goal, index) => (
                    <motion.div
                        key={goal._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="group relative overflow-hidden glass-card hover:shadow-elegant transition-all duration-500">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal._id)} className="text-destructive hover:bg-destructive/10">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <CardHeader>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 bg-primary/5">Academic</Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(goal.deadline).toLocaleDateString()}
                                    </span>
                                </div>
                                <CardTitle className="text-xl font-black tracking-tight uppercase group-hover:text-primary transition-colors">
                                    {goal.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-bold text-muted-foreground uppercase tracking-tighter">Progress</span>
                                        <span className="font-black text-primary">{goal.currentValue || 0}% / {goal.targetValue}%</span>
                                    </div>
                                    <Progress value={((goal.currentValue || 0) / goal.targetValue) * 100} className="h-2.5 shadow-inner" />
                                </div>
                                <div className="pt-4 flex items-center justify-between border-t border-border/5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    <span>Status: {goal.status || 'In Progress'}</span>
                                    <div className="h-1.5 w-12 bg-primary/20 rounded-full group-hover:w-20 transition-all duration-700"></div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default AcademicGoals;
