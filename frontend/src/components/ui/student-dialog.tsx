import { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit' | 'view' | 'profile';
  student?: any;
}

export function StudentDialog({ open, onOpenChange, mode, student }: StudentDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: student?.name || '',
    rollNo: student?.rollNo || '',
    email: student?.email || '',
    phone: student?.phone || '',
    class: student?.class || '',
    department: student?.department || '',
    address: student?.address || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: mode === 'add' ? 'Student Added' : 'Student Updated',
      description: `${formData.name} has been ${mode === 'add' ? 'added' : 'updated'} successfully.`,
    });
    onOpenChange(false);
  };

  const isReadOnly = mode === 'view' || mode === 'profile';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' && 'Add New Student'}
            {mode === 'edit' && 'Edit Student'}
            {mode === 'view' && 'View Student Details'}
            {mode === 'profile' && 'Student Profile'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' && 'Register a new student in the institution.'}
            {mode === 'edit' && 'Update student information and records.'}
            {mode === 'view' && 'View detailed information about this student.'}
            {mode === 'profile' && 'Complete student profile and academic records.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  disabled={isReadOnly}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rollNo">Roll Number</Label>
                <Input
                  id="rollNo"
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  placeholder="CSE2024001"
                  disabled={isReadOnly}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@college.edu.in"
                  disabled={isReadOnly}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  disabled={isReadOnly}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="class">Class</Label>
                <Input
                  id="class"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  placeholder="BE CSE - Semester 3"
                  disabled={isReadOnly}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                  disabled={isReadOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Mechanical">Mechanical</SelectItem>
                    <SelectItem value="Civil">Civil</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="City, State"
                disabled={isReadOnly}
                required
              />
            </div>
            {mode === 'profile' && student && (
              <div className="border-t pt-4 mt-2 space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-primary">Academic Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-xl border border-border/40">
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold">OVERALL ATTENDANCE</p>
                    <p className="font-black text-xl text-foreground">
                      {student.attendance?.overall !== undefined ? student.attendance.overall : student.attendance}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-semibold">ASSIGNMENTS STATUS</p>
                    <p className="font-black text-xl text-foreground">
                      {student.assignments?.submitted !== undefined ? `${student.assignments.submitted}/${student.assignments.total}` : 'N/A'}
                    </p>
                  </div>
                </div>

                {student.attendance?.subjectwise && Object.keys(student.attendance.subjectwise).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject-wise Attendance</p>
                    <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                      {Object.entries(student.attendance.subjectwise).map(([subj, data]: [string, any]) => (
                        <div key={subj} className="flex justify-between items-center text-xs py-1 border-b border-border/10">
                          <span className="font-medium text-muted-foreground truncate max-w-[200px]">{subj}</span>
                          <span className={`font-bold ${data.percentage >= 75 ? 'text-green-600' : 'text-red-500'}`}>
                            {data.attended}/{data.total} ({data.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {student.assignments?.list && student.assignments.list.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assignments Submissions</p>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                      {student.assignments.list.map((asg: any) => (
                        <div key={asg.assignmentId} className="p-2 border border-border/40 rounded-lg text-xs bg-muted/10 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-foreground truncate max-w-[220px]">{asg.title}</span>
                            <Badge variant={asg.submitted ? 'default' : 'destructive'} className="text-[9px] px-1.5 py-0 uppercase">
                              {asg.submitted ? 'Submitted' : 'Pending'}
                            </Badge>
                          </div>
                          {asg.submitted && (
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>Grade: {asg.grade !== null ? `${asg.grade}/${asg.totalMarks}` : 'Not graded'}</span>
                              {asg.feedback && <span className="italic">"{asg.feedback}"</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>
            {!isReadOnly && (
              <Button type="submit" variant="gradient">
                {mode === 'add' ? 'Add Student' : 'Save Changes'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
