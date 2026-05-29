import { motion } from 'framer-motion';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserPlus, Mail, Phone, MapPin, GraduationCap, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const DepartmentStaff = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [token] = useState(localStorage.getItem('accessToken'));

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch(`${API_BASE}/assignments/sync-map`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          // Transform data if needed
          const mapped = data.map((u: any) => ({
            id: u._id,
            name: u.name,
            designation: u.role, // or add designation field
            department: u.department,
            email: u.email,
            phone: "N/A", // Not in User model
            subjects: u.subjects || [],
            experience: "N/A",
            qualification: "N/A",
            status: "active"
          }));
          setStaffMembers(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch staff", err);
      }
    };
    if (token) fetchStaff();
  }, [token]);

  const departments = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];

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
            Department Staff
          </h1>
          <p className="text-muted-foreground mt-2">Manage faculty members and staff across departments</p>
        </div>
        <Button className="glass-card">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New Staff
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
                  <p className="text-sm font-medium text-muted-foreground">Total Faculty</p>
                  <p className="text-2xl font-bold">124</p>
                </div>
                <GraduationCap className="w-8 h-8 text-blue-500" />
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
                  <p className="text-sm font-medium text-muted-foreground">Departments</p>
                  <p className="text-2xl font-bold">5</p>
                </div>
                <BookOpen className="w-8 h-8 text-green-500" />
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
                  <p className="text-sm font-medium text-muted-foreground">Active Today</p>
                  <p className="text-2xl font-bold text-green-500">98</p>
                </div>
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
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
                  <p className="text-sm font-medium text-muted-foreground">On Leave</p>
                  <p className="text-2xl font-bold text-orange-500">8</p>
                </div>
                <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Faculty Members</CardTitle>
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffMembers.map((staff, index) => (
                <motion.div
                  key={staff.id}
                  className="p-4 border rounded-lg glass-card hover:bg-accent/50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${staff.name}`} />
                        <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{staff.name}</h3>
                        <p className="text-sm text-muted-foreground">{staff.designation}</p>
                      </div>
                      <Badge variant={staff.status === 'active' ? 'default' : 'secondary'}>
                        {staff.status === 'active' ? 'Active' : 'On Leave'}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{staff.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground text-xs">{staff.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{staff.phone}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium">Subjects:</p>
                      <div className="flex flex-wrap gap-1">
                        {staff.subjects.slice(0, 2).map((subject) => (
                          <Badge key={subject} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                        {staff.subjects.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{staff.subjects.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Experience: {staff.experience}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          View Profile
                        </Button>
                      </div>
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

export default DepartmentStaff;