import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Trophy,
  Clock,
  Edit,
  Camera,
  GraduationCap,
  Users,
  Star,
  TrendingUp
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const Profile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Use state for loading
  const [loading, setLoading] = useState(true);

  // State for form inputs
  const [formData, setFormData] = useState<any>({});
  const [activities, setActivities] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const BACKEND_URL = API_BASE.replace('/api', '');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          // Update local storage to keep sync
          localStorage.setItem('user', JSON.stringify(data));
        }

        // Fetch Activities
        const actRes = await fetch(`${API_BASE}/auth/activities`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (actRes.ok) {
          const actData = await actRes.json();
          setActivities(actData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div>Loading Profile...</div>;
  if (!user) return <div>Please log in</div>;

  // When entering edit mode, populate form data
  const handleEditToggle = () => {
    if (!isEditing) {
      setFormData({
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        dob: user.dob || '',
        bloodGroup: user.bloodGroup || '',
        fatherName: user.fatherName || '',
        motherName: user.motherName || '',
        emergencyContact: user.emergencyContact || '',
        bio: user.bio || '',
        gender: user.gender || '',

        // Role specific
        designation: user.designation || '',
        experience: user.experience || '',
        qualification: user.qualification || '',
        rollNumber: user.rollNumber || '',
        batch: user.batch || '',
        section: user.section || '',
        mentor: user.mentor || '',
        department: user.department || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser((prev: any) => ({ ...prev, ...updatedUser, id: prev?.id || updatedUser._id }));
        localStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser, id: user?.id || updatedUser._id }));
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your personal information has been updated successfully.",
        });
      } else {
        toast({
          variant: 'destructive',
          title: "Update Failed",
          description: "Could not update profile. Please try again."
        });
      }
    } catch (error) {
      console.error("Profile update error", error);
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Something went wrong."
      });
    }
  };

  // Hardcoded semester data for now (could be fetched from API later)
  const SEMESTER_DATA = [
    { semester: '1st Semester', cgpa: 8.2, progress: 82 },
    { semester: '2nd Semester', cgpa: 8.5, progress: 85 },
    { semester: '3rd Semester', cgpa: 8.7, progress: 87 },
    { semester: '4th Semester', cgpa: 8.9, progress: 89 },
    { semester: '5th Semester', cgpa: 9.1, progress: 91 },
    { semester: '6th Semester', cgpa: 8.7, progress: 87 }
  ];

  const calculateCGPA = () => {
    if (SEMESTER_DATA.length === 0) return 'N/A';
    const total = SEMESTER_DATA.reduce((acc, curr) => acc + curr.cgpa, 0);
    return (total / SEMESTER_DATA.length).toFixed(2);
  };

  const getRoleSpecificContent = () => {
    const role = user?.role?.toLowerCase() || '';
    switch (role) {
      case 'student':
        return {
          stats: [
            { label: 'Current CGPA', value: user.cgpa || calculateCGPA(), icon: GraduationCap, color: 'text-success' },
            { label: 'Semester', value: user.semester || 'N/A', icon: Calendar, color: 'text-primary' },
            { label: 'Attendance', value: user.attendance || '0%', icon: Clock, color: 'text-success' },
            { label: 'Subjects', value: '6', icon: BookOpen, color: 'text-primary' } // Calculated or static
          ],
          achievements: user.achievements || [
            { title: 'Joined College', description: 'Started academic journey', date: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' }
          ],
          recentActivities: [ // Placeholder for now or fetch activity logs
            'Logged in successfully',
            'Viewed Dashboard'
          ]
        };
      case 'faculty':
        return {
          stats: [
            { label: 'Teaching Experience', value: user.experience || 'N/A', icon: GraduationCap, color: 'text-primary' },
            { label: 'Subjects Teaching', value: user.subjects?.length?.toString() || '0', icon: BookOpen, color: 'text-primary' },
            { label: 'Student Rating', value: user.rating || 'N/A', icon: Star, color: 'text-success' },
            // Research papers - add to model if needed
            { label: 'Designation', value: user.designation || 'Faculty', icon: Trophy, color: 'text-success' }
          ],
          achievements: user.achievements || [],
          recentActivities: []
        };
      default:
        // Admin or other
        return { stats: [], achievements: [], recentActivities: [] };
    }
  };

  const content = getRoleSpecificContent();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE}/auth/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setUser((prev: any) => ({ ...prev, ...data.user, id: prev?.id || data.user._id }));
        localStorage.setItem('user', JSON.stringify({ ...user, ...data.user, id: user?.id || data.user._id }));
        window.dispatchEvent(new Event('user-updated'));
        toast({
          title: "Success",
          description: "Profile picture updated successfully."
        });
      } else {
        toast({
          variant: 'destructive',
          title: "Error",
          description: "Failed to upload image."
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Something went wrong."
      });
    }
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                {user.profileImage ? (
                  <img
                    src={user.profileImage.startsWith('http') ? user.profileImage : `${BACKEND_URL}${user.profileImage}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <AvatarFallback className="bg-blue-600 text-white text-3xl font-bold">
                    {user.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <Button
                size="icon"
                variant="outline"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{user?.name || 'User'}</h1>
                  <Badge variant="secondary" className="capitalize">
                    {user?.role || 'Guest'}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {isEditing ? (
                      user.isEmailChanged ? (
                        <div className="flex items-center gap-2 text-muted-foreground" title="Email can only be changed once">
                          {user.email} <Badge variant="outline" className="text-xs pointer-events-none">Locked</Badge>
                        </div>
                      ) : (
                        <Input name="email" value={formData.email} onChange={handleInputChange} className="h-8" />
                      )
                    ) : (
                      user.email
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {isEditing ? (
                      <Input name="phone" value={formData.phone} onChange={handleInputChange} className="h-8" placeholder="Phone Number" />
                    ) : (
                      user.phone || 'N/A'
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {isEditing ? (
                      <Input name="address" value={formData.address} onChange={handleInputChange} className="h-8" placeholder="Address" />
                    ) : (
                      user.address ? user.address.split(',')[0] : 'Location N/A'
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={isEditing ? handleSaveProfile : handleEditToggle}>
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </Button>
                <Button variant="outline">
                  View Public Profile
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-muted/50`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>



          {/* Quick Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date of Birth</p>
                    {isEditing ? (
                      <Input name="dob" value={formData.dob} onChange={handleInputChange} placeholder="YYYY-MM-DD" />
                    ) : (
                      <p className="font-medium">{user.dob || 'Not Set'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Blood Group</p>
                    {isEditing ? (
                      <Input name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} placeholder="e.g. O+" />
                    ) : (
                      <p className="font-medium">{user.bloodGroup || 'Not Set'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Father's Name</p>
                    {isEditing ? (
                      <Input name="fatherName" value={formData.fatherName} onChange={handleInputChange} />
                    ) : (
                      <p className="font-medium">{user.fatherName || 'Not Set'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mother's Name</p>
                    {isEditing ? (
                      <Input name="motherName" value={formData.motherName} onChange={handleInputChange} />
                    ) : (
                      <p className="font-medium">{user.motherName || 'Not Set'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Emergency Contact</p>
                    {isEditing ? (
                      <Input name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} />
                    ) : (
                      <p className="font-medium">{user.emergencyContact || 'Not Set'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Address</p>
                    {isEditing ? (
                      <Textarea name="address" value={formData.address} onChange={handleInputChange} className="h-20" />
                    ) : (
                      <p className="font-medium">{user.address || 'Not Set'}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bio</p>
                    {isEditing ? (
                      <Textarea name="bio" value={formData.bio} onChange={handleInputChange} className="h-20 col-span-2" />
                    ) : (
                      <p className="font-medium col-span-2">{user.bio || 'No bio added'}</p>
                    )}
                  </div>
                  {/* Editable Contact Info (Phone) - also rendered in header but useful here too */}
                  {isEditing && (
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <Input name="phone" value={formData.phone} onChange={handleInputChange} />
                    </div>
                  )}
                  {isEditing && (
                    <div>
                      <p className="text-muted-foreground">Gender</p>
                      <Input name="gender" value={formData.gender} onChange={handleInputChange} placeholder="Male/Female/Other" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">ID / Employee Code</p>
                    <p className="font-medium">{user.studentId || user.role === 'Student' ? user.studentId : user._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Role</p>
                    <p className="font-medium">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Department</p>
                    {isEditing ? (
                      <Input name="department" value={formData.department} onChange={handleInputChange} />
                    ) : (
                      <p className="font-medium">{user.department || 'N/A'}</p>
                    )}
                  </div>

                  {user.role === 'Student' ? (
                    <>
                      <div>
                        <p className="text-muted-foreground">Roll Number</p>
                        {isEditing ? (
                          <Input name="rollNumber" value={formData.rollNumber} onChange={handleInputChange} />
                        ) : (
                          <p className="font-medium">{user.rollNumber || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground">Batch</p>
                        {isEditing ? (
                          <Input name="batch" value={formData.batch} onChange={handleInputChange} />
                        ) : (
                          <p className="font-medium">{user.batch || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground">Section</p>
                        {isEditing ? (
                          <Input name="section" value={formData.section} onChange={handleInputChange} />
                        ) : (
                          <p className="font-medium">{user.section || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mentor</p>
                        {isEditing ? (
                          <Input name="mentor" value={formData.mentor} onChange={handleInputChange} />
                        ) : (
                          <p className="font-medium">{user.mentor || 'N/A'}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-muted-foreground">Designation</p>
                        {isEditing ? (
                          <Input name="designation" value={formData.designation} onChange={handleInputChange} />
                        ) : (
                          <p className="font-medium">{user.designation || 'Faculty'}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground">Qualification</p>
                        {isEditing ? (
                          <Input name="qualification" value={formData.qualification} onChange={handleInputChange} />
                        ) : (
                          <p className="font-medium">{user.qualification || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground">Experience</p>
                        {isEditing ? (
                          <Input name="experience" value={formData.experience} onChange={handleInputChange} placeholder="e.g. 5 Years" />
                        ) : (
                          <p className="font-medium">{user.experience || 'N/A'}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          {user.role.toLowerCase() === 'student' && (
            <Card>
              <CardHeader>
                <CardTitle>Academic Performance</CardTitle>
                <CardDescription>Your semester-wise CGPA progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {SEMESTER_DATA.map((sem, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-24 text-sm font-medium">{sem.semester}</div>
                      <div className="flex-1">
                        <Progress value={sem.progress} className="h-2" />
                      </div>
                      <div className="w-16 text-right font-medium">{sem.cgpa}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-6">
            {content.achievements.map((achievement, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-success/10">
                      <Trophy className="w-6 h-6 text-success" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-muted-foreground mb-2">{achievement.description}</p>
                      <Badge variant="outline">{achievement.date}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Your latest activities and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm font-medium">{activity.action}</span>
                      <span className="text-sm text-muted-foreground flex-1">{activity.description}</span>
                      <Badge variant="outline" className="ml-auto">
                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">No recent activities</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your profile preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={handleEditToggle}>
                <User className="w-4 h-4 mr-2" />
                Edit Personal Information
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={handleEditToggle}>
                <Mail className="w-4 h-4 mr-2" />
                Change Email Address
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => fileInputRef.current?.click()}>
                <Camera className="w-4 h-4 mr-2" />
                Upload Profile Picture
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;