import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit' | 'view';
  user?: any;
  onSuccess?: () => void;
}

export function UserDialog({ open, onOpenChange, mode, user, onSuccess }: UserDialogProps) {
  const { toast } = useToast();
  const token = localStorage.getItem("accessToken");

  // Local state for available academic subjects
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);

  // Form state structure matching backend IUser model
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password?: string;
    role: string;
    department: string;
    semester: string;
    subjects: string[];
    designation: string;
    phone: string;
  }>({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    department: '',
    semester: '',
    subjects: [],
    designation: '',
    phone: '',
  });

  // Load available subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/subjects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAvailableSubjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load subjects", err);
      }
    };
    if (open) {
      fetchSubjects();
    }
  }, [open, token]);

  // Synchronize form state with selected user
  useEffect(() => {
    if (open) {
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '', // reset password field when editing
          role: user.role || 'Student',
          department: user.department || '',
          semester: user.semester || '',
          subjects: user.subjects || [],
          designation: user.designation || '',
          phone: user.phone || '',
        });
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'Student',
          department: '',
          semester: '',
          subjects: [],
          designation: '',
          phone: '',
        });
      }
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = mode === 'edit' ? 'PUT' : 'POST';
    const url = mode === 'edit' 
      ? `${API_BASE}/admin/users/${user._id}`
      : `${API_BASE}/admin/users`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast({
          title: mode === 'add' ? 'User Provisioned' : 'Identity Updated',
          description: `${formData.name} has been ${mode === 'add' ? 'created' : 'updated'} successfully.`,
        });
        if (onSuccess) onSuccess();
        onOpenChange(false);
      } else {
        const data = await res.json();
        toast({
          title: 'Operation Failed',
          description: data.message || 'An error occurred while saving user data.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Network Error',
        description: err.message || 'Could not connect to the system server.',
        variant: 'destructive',
      });
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl border-0 shadow-2xl glass-effect p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-primary">
            {mode === 'add' && 'Add New User'}
            {mode === 'edit' && 'Edit User'}
            {mode === 'view' && 'View User Details'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' && 'Create a new user account for the institution.'}
            {mode === 'edit' && 'Update user information and settings.'}
            {mode === 'view' && 'Detailed system record for this user.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 text-sm">
            <div className="grid gap-2">
              <Label htmlFor="name" className="font-bold text-xs uppercase tracking-wider text-muted-foreground ml-1">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                disabled={isReadOnly}
                className="rounded-xl border-border/40 bg-muted/20"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email" className="font-bold text-xs uppercase tracking-wider text-muted-foreground ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@college.edu.in"
                disabled={isReadOnly}
                className="rounded-xl border-border/40 bg-muted/20"
                required
              />
            </div>

            {mode === 'add' && (
              <div className="grid gap-2">
                <Label htmlFor="pass" className="font-bold text-xs uppercase tracking-wider text-muted-foreground ml-1">Initial Password</Label>
                <Input
                  id="pass"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter temporary password"
                  className="rounded-xl border-border/40 bg-muted/20"
                  required
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="phone" className="font-bold text-xs uppercase tracking-wider text-muted-foreground ml-1">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                disabled={isReadOnly}
                className="rounded-xl border-border/40 bg-muted/20"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role" className="font-bold text-xs uppercase tracking-wider text-muted-foreground ml-1">System Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={isReadOnly}
              >
                <SelectTrigger className="rounded-xl border-border/40 bg-muted/20 font-semibold">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department" className="font-bold text-xs uppercase tracking-wider text-muted-foreground ml-1">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Computer Science"
                disabled={isReadOnly}
                className="rounded-xl border-border/40 bg-muted/20"
                required
              />
            </div>

            {formData.role === 'Student' && (
              <div className="grid gap-2">
                <Label htmlFor="semester" className="font-bold text-xs uppercase tracking-wider text-muted-foreground ml-1">Academic Semester</Label>
                <Input
                  id="semester"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  placeholder="e.g. 5"
                  disabled={isReadOnly}
                  className="rounded-xl border-border/40 bg-muted/20"
                  required
                />
              </div>
            )}

            {formData.role === 'Faculty' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="designation" className="font-bold text-xs uppercase tracking-wider text-muted-foreground ml-1">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Assistant Professor / HOD / Principal"
                    disabled={isReadOnly}
                    className="rounded-xl border-border/40 bg-muted/20"
                  />
                </div>

                <div className="grid gap-2 border-t border-border/20 pt-4">
                  <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground ml-1">Assigned Subjects</Label>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.subjects && formData.subjects.length > 0 ? (
                      formData.subjects.map((sub: string) => (
                        <Badge key={sub} variant="secondary" className="flex items-center gap-1.5 px-3 py-1 bg-secondary/15 text-secondary border-secondary/20 hover:bg-secondary/20 rounded-lg transition-colors text-[11px] font-semibold">
                          <span>{sub}</span>
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  subjects: prev.subjects.filter(s => s !== sub)
                                }));
                              }}
                              className="hover:text-destructive transition-colors text-[10px] font-bold"
                            >
                              ✕
                            </button>
                          )}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic ml-1">No subjects assigned yet.</span>
                    )}
                  </div>

                  {!isReadOnly && (
                    <select
                      className="flex h-10 w-full rounded-xl border border-border/40 bg-muted/20 px-3 py-2 text-sm focus-visible:outline-none font-semibold"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val && !formData.subjects.includes(val)) {
                          setFormData(prev => ({
                            ...prev,
                            subjects: [...prev.subjects, val]
                          }));
                        }
                        e.target.value = "";
                      }}
                    >
                      <option value="">Assign new subject...</option>
                      {availableSubjects
                        .filter((sub: any) => !formData.subjects.includes(sub.name))
                        .map((sub: any) => (
                          <option key={sub._id} value={sub.name}>
                            {sub.name} ({sub.code})
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>
            {!isReadOnly && (
              <Button type="submit" className="bg-gradient-primary text-white shadow-glow rounded-xl font-bold uppercase text-xs tracking-wider">
                {mode === 'add' ? 'Add User' : 'Save Changes'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
