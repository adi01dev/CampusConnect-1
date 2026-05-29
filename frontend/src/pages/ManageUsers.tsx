import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { UserDialog } from '@/components/ui/user-dialog';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Shield,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Mail,
  Phone
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const ManageUsers = () => {
  const { toast } = useToast();
  const token = localStorage.getItem("accessToken");

  // Data State
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ title: "Failed to fetch users", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete user ${name}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast({ title: "User deleted", description: `${name} has been removed successfully.` });
        fetchUsers();
      } else {
        const data = await res.json();
        toast({ title: "Delete failed", description: data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Dynamic Statistics
  const studentsCount = users.filter(u => u.role === 'Student').length;
  const facultyCount = users.filter(u => u.role === 'Faculty').length;
  const adminCount = users.filter(u => u.role === 'Admin').length;
  const totalCount = users.length;

  const userStats = [
    { title: 'Total Users', value: totalCount.toLocaleString(), icon: Users, color: 'text-primary' },
    { title: 'Students Count', value: studentsCount.toLocaleString(), icon: CheckCircle, color: 'text-success' },
    { title: 'Faculty Members', value: facultyCount.toLocaleString(), icon: Clock, color: 'text-secondary' },
    { title: 'Admin Staff', value: adminCount.toLocaleString(), icon: Shield, color: 'text-warning' },
  ];

  // Filtering Logic
  const filteredUsers = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (!searchQuery) return true;
    const term = searchQuery.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term) ||
      u.department?.toLowerCase().includes(term)
    );
  });

  const roleColors: Record<string, string> = {
    Admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    Faculty: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Student: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <BreadcrumbNav />
      
      {/* Header */}
      <motion.div 
        className="flex justify-between items-start"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">
            Manage all system users, roles, and subject assignments across the institution
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Users
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="gradient"
            onClick={() => {
              setDialogMode('add');
              setSelectedUser(null);
              setDialogOpen(true);
            }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {userStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="glass-effect border-0 shadow-card hover:shadow-elegant transition-all duration-300 hover-lift">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-primary">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="glass-effect border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search users by name, email, department, or role..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={roleFilter === null ? "default" : "outline"} 
                  onClick={() => setRoleFilter(null)}
                >
                  All Roles
                </Button>
                <Button 
                  variant={roleFilter === "Student" ? "default" : "outline"} 
                  onClick={() => setRoleFilter("Student")}
                >
                  Students
                </Button>
                <Button 
                  variant={roleFilter === "Faculty" ? "default" : "outline"} 
                  onClick={() => setRoleFilter("Faculty")}
                >
                  Faculty
                </Button>
                <Button 
                  variant={roleFilter === "Admin" ? "default" : "outline"} 
                  onClick={() => setRoleFilter("Admin")}
                >
                  Admins
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* User List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="glass-effect border-0 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              All Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground italic">No platform users found matching current filters.</div>
              ) : filteredUsers.map((user, index) => (
                <motion.div 
                  key={user._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-lg">
                        {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                      </span>
                    </div>
                    
                    {/* User Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground truncate">{user.name}</h4>
                        <Badge 
                          className={roleColors[user.role] || 'bg-blue-100 text-blue-800'}
                        >
                          {user.role}
                        </Badge>
                        {user.isMoUCoordinator && (
                          <Badge variant="outline" className="border-green-500 bg-green-500/10 text-green-700 text-[10px]">
                            MoU Coordinator
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 min-w-0">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{user.phone || 'No phone recorded'}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        Department: {user.department || 'General'}
                        {user.role === 'Student' && user.semester && ` • Semester ${user.semester}`}
                        {user.role === 'Faculty' && user.designation && ` • ${user.designation}`}
                      </p>

                      {user.role === 'Faculty' && user.subjects && user.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {user.subjects.map((sub: string) => (
                            <Badge key={sub} variant="secondary" className="text-[10px] px-1.5 py-0 bg-secondary/15 text-secondary border-0">{sub}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setDialogMode('view');
                        setSelectedUser(user);
                        setDialogOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setDialogMode('edit');
                        setSelectedUser(user);
                        setDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover-lift text-destructive"
                      onClick={() => handleDelete(user._id, user.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        user={selectedUser}
        onSuccess={fetchUsers}
      />
    </motion.div>
  );
};

export default ManageUsers;