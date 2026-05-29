# Complete Backend Architecture & Implementation Plan
## CampusConnect ERP System

---

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Architecture](#api-architecture)
5. [Authentication & Authorization](#authentication--authorization)
6. [Backend Folder Structure](#backend-folder-structure)
7. [Data Flow Diagrams](#data-flow-diagrams)
8. [Security Implementation](#security-implementation)
9. [Deployment Guide](#deployment-guide)

---

## 1. System Overview

### Core Modules
- **User Management**: Multi-role user system (Student, Faculty, HOD, Principal, Admin, Accountant)
- **Academic Management**: Courses, schedules, assignments, attendance
- **Fee Management**: Payment processing, receipts, reminders
- **Analytics & AI**: Performance tracking, predictions, recommendations
- **Document Management**: File storage, MoU requests
- **Communication**: Notifications, announcements, queries

---

## 2. Technology Stack

### Backend Framework
```
- Runtime: Node.js (v18+)
- Framework: Express.js
- Language: TypeScript
- ORM: Prisma / TypeORM
```

### Database
```
- Primary DB: PostgreSQL (Supabase)
- Cache: Redis (optional for sessions)
- Storage: Supabase Storage (files/documents)
```

### Authentication
```
- JWT Tokens (Access + Refresh)
- Supabase Auth
- Role-based Access Control (RBAC)
```

### AI/ML Services
```
- Python FastAPI (separate microservice)
- Libraries: scikit-learn, pandas, numpy
- Models: Performance prediction, recommendation engine
```

---

## 3. Database Schema

### 3.1 Core Tables

#### **users** (Managed by Supabase Auth)
```sql
-- Base authentication handled by auth.users
-- Custom profile data in profiles table
```

#### **profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  emergency_contact VARCHAR(20),
  blood_group VARCHAR(5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **user_roles**
```sql
CREATE TYPE app_role AS ENUM (
  'student', 
  'faculty', 
  'hod', 
  'principal', 
  'admin', 
  'accountant'
);

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  department_id UUID REFERENCES departments(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
```

#### **departments**
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  hod_id UUID REFERENCES auth.users(id),
  description TEXT,
  established_date DATE,
  building VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **students**
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  enrollment_number VARCHAR(50) UNIQUE NOT NULL,
  roll_number VARCHAR(50) UNIQUE,
  department_id UUID REFERENCES departments(id) NOT NULL,
  batch_year INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  section VARCHAR(10),
  admission_date DATE NOT NULL,
  current_cgpa DECIMAL(4,2),
  status VARCHAR(20) DEFAULT 'active', -- active, suspended, graduated, dropout
  parent_name VARCHAR(200),
  parent_phone VARCHAR(20),
  parent_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_students_batch ON students(batch_year, semester);
```

#### **faculty**
```sql
CREATE TABLE faculty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  department_id UUID REFERENCES departments(id) NOT NULL,
  designation VARCHAR(100),
  qualification VARCHAR(200),
  specialization TEXT,
  joining_date DATE NOT NULL,
  experience_years INTEGER,
  office_room VARCHAR(50),
  office_hours TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_faculty_user_id ON faculty(user_id);
CREATE INDEX idx_faculty_department ON faculty(department_id);
```

### 3.2 Academic Tables

#### **courses**
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  department_id UUID REFERENCES departments(id) NOT NULL,
  credits INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  course_type VARCHAR(50), -- core, elective, lab
  description TEXT,
  prerequisites TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **course_assignments**
```sql
CREATE TABLE course_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  faculty_id UUID REFERENCES faculty(id) NOT NULL,
  academic_year INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  section VARCHAR(10),
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(course_id, faculty_id, academic_year, semester, section)
);
```

#### **enrollments**
```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) NOT NULL,
  academic_year INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  enrollment_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active', -- active, dropped, completed
  grade VARCHAR(5),
  grade_points DECIMAL(4,2),
  UNIQUE(student_id, course_id, academic_year, semester)
);

CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
```

#### **class_schedules**
```sql
CREATE TABLE class_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_assignment_id UUID REFERENCES course_assignments(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(50),
  building VARCHAR(100),
  schedule_type VARCHAR(20), -- lecture, lab, tutorial
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **attendance**
```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  course_assignment_id UUID REFERENCES course_assignments(id) NOT NULL,
  attendance_date DATE NOT NULL,
  session_type VARCHAR(20), -- lecture, lab, tutorial
  status VARCHAR(20) NOT NULL, -- present, absent, late, excused
  marked_by UUID REFERENCES auth.users(id),
  marked_at TIMESTAMP DEFAULT NOW(),
  qr_code VARCHAR(255),
  qr_scanned_at TIMESTAMP,
  remarks TEXT,
  UNIQUE(student_id, course_assignment_id, attendance_date, session_type)
);

CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_course ON attendance(course_assignment_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
```

#### **assignments**
```sql
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_assignment_id UUID REFERENCES course_assignments(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMP NOT NULL,
  total_marks INTEGER NOT NULL,
  assignment_type VARCHAR(50), -- homework, project, quiz
  file_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **assignment_submissions**
```sql
CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  submission_date TIMESTAMP DEFAULT NOW(),
  file_url TEXT,
  comments TEXT,
  marks_obtained INTEGER,
  feedback TEXT,
  graded_by UUID REFERENCES auth.users(id),
  graded_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'submitted', -- submitted, graded, late
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_submissions_student ON assignment_submissions(student_id);
```

### 3.3 Fee Management Tables

#### **fee_structures**
```sql
CREATE TABLE fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  department_id UUID REFERENCES departments(id),
  semester INTEGER NOT NULL,
  academic_year INTEGER NOT NULL,
  tuition_fee DECIMAL(10,2) NOT NULL,
  lab_fee DECIMAL(10,2) DEFAULT 0,
  library_fee DECIMAL(10,2) DEFAULT 0,
  sports_fee DECIMAL(10,2) DEFAULT 0,
  development_fee DECIMAL(10,2) DEFAULT 0,
  other_fees DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **student_fees**
```sql
CREATE TABLE student_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  fee_structure_id UUID REFERENCES fee_structures(id) NOT NULL,
  academic_year INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  pending_amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, partial, paid, overdue
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, academic_year, semester)
);

CREATE INDEX idx_student_fees_student ON student_fees(student_id);
CREATE INDEX idx_student_fees_status ON student_fees(status);
```

#### **payments**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_fee_id UUID REFERENCES student_fees(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP DEFAULT NOW(),
  payment_method VARCHAR(50), -- cash, card, upi, netbanking, cheque
  transaction_id VARCHAR(255) UNIQUE,
  reference_number VARCHAR(255),
  receipt_number VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'completed', -- pending, completed, failed, refunded
  processed_by UUID REFERENCES auth.users(id),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_status ON payments(status);
```

#### **payment_reminders**
```sql
CREATE TABLE payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_fee_id UUID REFERENCES student_fees(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES students(id) NOT NULL,
  reminder_type VARCHAR(50), -- email, sms, push, whatsapp
  reminder_date TIMESTAMP DEFAULT NOW(),
  message TEXT,
  sent_by UUID REFERENCES auth.users(id),
  delivery_status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, failed
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.4 Document Management Tables

#### **documents**
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(50),
  category VARCHAR(100), -- academic, administrative, circular, certificate
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  department_id UUID REFERENCES departments(id),
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_department ON documents(department_id);
CREATE INDEX idx_documents_uploader ON documents(uploaded_by);
```

#### **mou_requests**
```sql
CREATE TABLE mou_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  organization_name VARCHAR(255) NOT NULL,
  organization_type VARCHAR(100),
  contact_person VARCHAR(200),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  purpose TEXT NOT NULL,
  duration_months INTEGER,
  document_url TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, under_review, approved, rejected
  requested_by UUID REFERENCES auth.users(id) NOT NULL,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  review_comments TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mou_status ON mou_requests(status);
CREATE INDEX idx_mou_requester ON mou_requests(requested_by);
```

### 3.5 Communication Tables

#### **notifications**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50), -- info, warning, success, error, announcement
  category VARCHAR(100), -- academic, fee, attendance, general
  link_url TEXT,
  is_read BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

#### **announcements**
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_roles app_role[],
  target_departments UUID[],
  target_semesters INTEGER[],
  priority VARCHAR(20) DEFAULT 'normal',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_announcements_active ON announcements(is_active);
CREATE INDEX idx_announcements_dates ON announcements(start_date, end_date);
```

#### **student_queries**
```sql
CREATE TABLE student_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  query TEXT NOT NULL,
  category VARCHAR(100), -- academic, fee, administrative, technical
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
  assigned_to UUID REFERENCES auth.users(id),
  response TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_queries_student ON student_queries(student_id);
CREATE INDEX idx_queries_status ON student_queries(status);
CREATE INDEX idx_queries_assigned ON student_queries(assigned_to);
```

### 3.6 Analytics & AI Tables

#### **academic_performance**
```sql
CREATE TABLE academic_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  academic_year INTEGER NOT NULL,
  semester INTEGER NOT NULL,
  sgpa DECIMAL(4,2),
  cgpa DECIMAL(4,2),
  credits_earned INTEGER,
  attendance_percentage DECIMAL(5,2),
  rank_in_class INTEGER,
  total_students INTEGER,
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, academic_year, semester)
);

CREATE INDEX idx_performance_student ON academic_performance(student_id);
CREATE INDEX idx_performance_semester ON academic_performance(academic_year, semester);
```

#### **ai_predictions**
```sql
CREATE TABLE ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  prediction_type VARCHAR(100), -- performance, dropout_risk, career_path
  predicted_value JSONB NOT NULL,
  confidence_score DECIMAL(5,4),
  factors JSONB,
  predicted_at TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP
);

CREATE INDEX idx_predictions_student ON ai_predictions(student_id);
CREATE INDEX idx_predictions_type ON ai_predictions(prediction_type);
```

#### **ai_recommendations**
```sql
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  recommendation_type VARCHAR(100), -- course, study_material, improvement
  title VARCHAR(255) NOT NULL,
  description TEXT,
  recommendation_data JSONB,
  priority INTEGER DEFAULT 5,
  is_actioned BOOLEAN DEFAULT false,
  actioned_at TIMESTAMP,
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_recommendations_student ON ai_recommendations(student_id);
```

### 3.7 Calendar & Events

#### **academic_calendar**
```sql
CREATE TABLE academic_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(100), -- exam, holiday, seminar, sports, cultural
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_roles app_role[],
  target_departments UUID[],
  target_semesters INTEGER[],
  location VARCHAR(255),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_calendar_dates ON academic_calendar(start_date, end_date);
CREATE INDEX idx_calendar_type ON academic_calendar(event_type);
```

### 3.8 System Tables

#### **system_logs**
```sql
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  ip_address INET,
  user_agent TEXT,
  request_method VARCHAR(10),
  request_url TEXT,
  response_status INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logs_user ON system_logs(user_id);
CREATE INDEX idx_logs_action ON system_logs(action);
CREATE INDEX idx_logs_created ON system_logs(created_at);
```

#### **system_settings**
```sql
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  category VARCHAR(100),
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. API Architecture

### 4.1 Base Configuration

```
Base URL: https://your-project.supabase.co
API Version: /api/v1
Content-Type: application/json
Authentication: Bearer Token (JWT)
```

### 4.2 API Endpoints Structure

#### **Authentication Endpoints**
```
POST   /api/v1/auth/register           - User registration
POST   /api/v1/auth/login              - User login
POST   /api/v1/auth/logout             - User logout
POST   /api/v1/auth/refresh            - Refresh access token
POST   /api/v1/auth/forgot-password    - Request password reset
POST   /api/v1/auth/reset-password     - Reset password
GET    /api/v1/auth/me                 - Get current user info
PUT    /api/v1/auth/change-password    - Change password
```

#### **User Management Endpoints**
```
GET    /api/v1/users                   - Get all users (Admin)
GET    /api/v1/users/:id               - Get user by ID
POST   /api/v1/users                   - Create user (Admin)
PUT    /api/v1/users/:id               - Update user
DELETE /api/v1/users/:id               - Delete user (Admin)
GET    /api/v1/users/:id/roles         - Get user roles
POST   /api/v1/users/:id/roles         - Assign role to user
DELETE /api/v1/users/:id/roles/:roleId - Remove role from user
```

#### **Student Management Endpoints**
```
GET    /api/v1/students                - Get all students
GET    /api/v1/students/:id            - Get student details
POST   /api/v1/students                - Create student
PUT    /api/v1/students/:id            - Update student
DELETE /api/v1/students/:id            - Delete student
GET    /api/v1/students/:id/academic   - Get academic records
GET    /api/v1/students/:id/attendance - Get attendance records
GET    /api/v1/students/:id/fees       - Get fee records
GET    /api/v1/students/:id/performance - Get performance data
POST   /api/v1/students/import         - Bulk import students
```

#### **Faculty Management Endpoints**
```
GET    /api/v1/faculty                 - Get all faculty
GET    /api/v1/faculty/:id             - Get faculty details
POST   /api/v1/faculty                 - Create faculty
PUT    /api/v1/faculty/:id             - Update faculty
DELETE /api/v1/faculty/:id             - Delete faculty
GET    /api/v1/faculty/:id/schedule    - Get teaching schedule
GET    /api/v1/faculty/:id/courses     - Get assigned courses
```

#### **Course Management Endpoints**
```
GET    /api/v1/courses                 - Get all courses
GET    /api/v1/courses/:id             - Get course details
POST   /api/v1/courses                 - Create course
PUT    /api/v1/courses/:id             - Update course
DELETE /api/v1/courses/:id             - Delete course
GET    /api/v1/courses/:id/students    - Get enrolled students
POST   /api/v1/courses/:id/assign      - Assign course to faculty
```

#### **Enrollment Endpoints**
```
GET    /api/v1/enrollments             - Get all enrollments
POST   /api/v1/enrollments             - Create enrollment
DELETE /api/v1/enrollments/:id         - Delete enrollment
POST   /api/v1/enrollments/bulk        - Bulk enrollment
```

#### **Schedule Endpoints**
```
GET    /api/v1/schedules               - Get all schedules
GET    /api/v1/schedules/my            - Get my schedule
GET    /api/v1/schedules/student/:id   - Get student schedule
GET    /api/v1/schedules/faculty/:id   - Get faculty schedule
POST   /api/v1/schedules               - Create schedule
PUT    /api/v1/schedules/:id           - Update schedule
DELETE /api/v1/schedules/:id           - Delete schedule
```

#### **Attendance Endpoints**
```
GET    /api/v1/attendance              - Get attendance records
POST   /api/v1/attendance              - Mark attendance
POST   /api/v1/attendance/qr-generate  - Generate QR code
POST   /api/v1/attendance/qr-scan      - Scan QR and mark attendance
GET    /api/v1/attendance/student/:id  - Get student attendance
GET    /api/v1/attendance/course/:id   - Get course attendance
GET    /api/v1/attendance/stats        - Get attendance statistics
POST   /api/v1/attendance/bulk         - Bulk mark attendance
```

#### **Assignment Endpoints**
```
GET    /api/v1/assignments             - Get all assignments
GET    /api/v1/assignments/:id         - Get assignment details
POST   /api/v1/assignments             - Create assignment
PUT    /api/v1/assignments/:id         - Update assignment
DELETE /api/v1/assignments/:id         - Delete assignment
GET    /api/v1/assignments/:id/submissions - Get submissions
POST   /api/v1/assignments/:id/submit  - Submit assignment
PUT    /api/v1/assignments/submissions/:id/grade - Grade submission
```

#### **Fee Management Endpoints**
```
GET    /api/v1/fees/structures         - Get fee structures
POST   /api/v1/fees/structures         - Create fee structure
PUT    /api/v1/fees/structures/:id     - Update fee structure
GET    /api/v1/fees/students           - Get all student fees
GET    /api/v1/fees/students/:id       - Get student fee details
POST   /api/v1/fees/students           - Create student fee record
PUT    /api/v1/fees/students/:id       - Update student fee
GET    /api/v1/fees/pending            - Get pending fees
GET    /api/v1/fees/overdue            - Get overdue fees
```

#### **Payment Endpoints**
```
GET    /api/v1/payments                - Get all payments
GET    /api/v1/payments/:id            - Get payment details
POST   /api/v1/payments                - Process payment
GET    /api/v1/payments/student/:id    - Get student payments
GET    /api/v1/payments/:id/receipt    - Download receipt
POST   /api/v1/payments/verify         - Verify payment
POST   /api/v1/payments/refund         - Process refund
```

#### **Payment Reminder Endpoints**
```
GET    /api/v1/reminders               - Get all reminders
POST   /api/v1/reminders               - Send reminder
POST   /api/v1/reminders/bulk          - Send bulk reminders
GET    /api/v1/reminders/student/:id   - Get student reminders
```

#### **Document Management Endpoints**
```
GET    /api/v1/documents               - Get all documents
GET    /api/v1/documents/:id           - Get document details
POST   /api/v1/documents               - Upload document
PUT    /api/v1/documents/:id           - Update document
DELETE /api/v1/documents/:id           - Delete document
GET    /api/v1/documents/:id/download  - Download document
GET    /api/v1/documents/search        - Search documents
```

#### **MoU Request Endpoints**
```
GET    /api/v1/mou-requests            - Get all MoU requests
GET    /api/v1/mou-requests/:id        - Get MoU details
POST   /api/v1/mou-requests            - Create MoU request
PUT    /api/v1/mou-requests/:id        - Update MoU request
DELETE /api/v1/mou-requests/:id        - Delete MoU request
PUT    /api/v1/mou-requests/:id/review - Review MoU request
```

#### **Notification Endpoints**
```
GET    /api/v1/notifications           - Get my notifications
GET    /api/v1/notifications/unread    - Get unread notifications
PUT    /api/v1/notifications/:id/read  - Mark as read
PUT    /api/v1/notifications/read-all  - Mark all as read
DELETE /api/v1/notifications/:id       - Delete notification
POST   /api/v1/notifications/send      - Send notification (Admin)
```

#### **Announcement Endpoints**
```
GET    /api/v1/announcements           - Get active announcements
GET    /api/v1/announcements/:id       - Get announcement details
POST   /api/v1/announcements           - Create announcement
PUT    /api/v1/announcements/:id       - Update announcement
DELETE /api/v1/announcements/:id       - Delete announcement
```

#### **Query Endpoints**
```
GET    /api/v1/queries                 - Get queries
GET    /api/v1/queries/:id             - Get query details
POST   /api/v1/queries                 - Create query
PUT    /api/v1/queries/:id             - Update query
DELETE /api/v1/queries/:id             - Delete query
PUT    /api/v1/queries/:id/assign      - Assign query
PUT    /api/v1/queries/:id/respond     - Respond to query
```

#### **Analytics Endpoints**
```
GET    /api/v1/analytics/dashboard     - Get dashboard data
GET    /api/v1/analytics/students      - Student analytics
GET    /api/v1/analytics/attendance    - Attendance analytics
GET    /api/v1/analytics/performance   - Performance analytics
GET    /api/v1/analytics/fees          - Fee analytics
GET    /api/v1/analytics/department/:id - Department analytics
```

#### **AI & Predictions Endpoints**
```
GET    /api/v1/ai/predictions          - Get predictions
GET    /api/v1/ai/predictions/:studentId - Get student predictions
POST   /api/v1/ai/predictions/generate - Generate predictions
GET    /api/v1/ai/recommendations      - Get recommendations
GET    /api/v1/ai/recommendations/:studentId - Get student recommendations
POST   /api/v1/ai/chat                 - AI chatbot endpoint
```

#### **Calendar Endpoints**
```
GET    /api/v1/calendar                - Get calendar events
GET    /api/v1/calendar/:id            - Get event details
POST   /api/v1/calendar                - Create event
PUT    /api/v1/calendar/:id            - Update event
DELETE /api/v1/calendar/:id            - Delete event
GET    /api/v1/calendar/my             - Get my calendar
```

#### **Department Endpoints**
```
GET    /api/v1/departments             - Get all departments
GET    /api/v1/departments/:id         - Get department details
POST   /api/v1/departments             - Create department
PUT    /api/v1/departments/:id         - Update department
DELETE /api/v1/departments/:id         - Delete department
GET    /api/v1/departments/:id/staff   - Get department staff
GET    /api/v1/departments/:id/students - Get department students
```

#### **Reports Endpoints**
```
GET    /api/v1/reports/academic        - Academic reports
GET    /api/v1/reports/attendance      - Attendance reports
GET    /api/v1/reports/financial       - Financial reports
GET    /api/v1/reports/student/:id     - Student report
POST   /api/v1/reports/generate        - Generate custom report
GET    /api/v1/reports/download/:id    - Download report
```

#### **System Management Endpoints**
```
GET    /api/v1/system/settings         - Get system settings
PUT    /api/v1/system/settings         - Update system settings
GET    /api/v1/system/logs             - Get system logs
POST   /api/v1/system/backup           - Backup database
GET    /api/v1/system/health           - Health check
GET    /api/v1/system/stats            - System statistics
```

### 4.3 API Response Format

#### Success Response
```json
{
  "success": true,
  "data": {
    // response data
  },
  "message": "Operation successful",
  "timestamp": "2025-10-16T10:30:00Z"
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  },
  "timestamp": "2025-10-16T10:30:00Z"
}
```

#### Paginated Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2025-10-16T10:30:00Z"
}
```

---

## 5. Authentication & Authorization

### 5.1 Authentication Flow

```
1. User Registration
   → POST /api/v1/auth/register
   → Validate input data
   → Check if user exists
   → Hash password
   → Create user in auth.users
   → Create profile record
   → Assign default role
   → Send verification email
   → Return success

2. User Login
   → POST /api/v1/auth/login
   → Validate credentials
   → Check user status
   → Generate JWT access token (15 min)
   → Generate refresh token (7 days)
   → Store refresh token
   → Return tokens + user data

3. Token Refresh
   → POST /api/v1/auth/refresh
   → Validate refresh token
   → Generate new access token
   → Return new access token

4. Protected Route Access
   → Request with Authorization: Bearer <token>
   → Verify token signature
   → Check token expiration
   → Extract user ID
   → Fetch user roles
   → Check route permissions
   → Allow or deny access
```

### 5.2 JWT Token Structure

```javascript
// Access Token Payload
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "roles": ["student", "admin"],
  "iat": 1697461200,
  "exp": 1697462100,
  "type": "access"
}

// Refresh Token Payload
{
  "sub": "user-uuid",
  "iat": 1697461200,
  "exp": 1698066000,
  "type": "refresh"
}
```

### 5.3 Role-Based Access Control (RBAC)

#### Role Hierarchy
```
Principal
  └── HOD
      └── Faculty
          └── Student

Admin (separate hierarchy)
  └── Accountant
```

#### Permission Matrix

| Feature | Student | Faculty | HOD | Principal | Admin | Accountant |
|---------|---------|---------|-----|-----------|-------|------------|
| View own profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit own profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View students | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Add/Edit students | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| View attendance | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Mark attendance | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ |
| View grades | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Enter grades | ✗ | ✓ | ✓ | ✓ | ✗ | ✗ |
| View fees | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Manage fees | ✗ | ✗ | ✗ | ✓ | ✓ | ✓ |
| Process payments | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| View analytics | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage users | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| System settings | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |

### 5.4 RLS (Row Level Security) Policies

#### Example: Students Table
```sql
-- Students can view only their own record
CREATE POLICY "Students can view own record"
ON students FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Faculty/HOD/Principal can view students in their department
CREATE POLICY "Faculty can view department students"
ON students FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN faculty f ON f.user_id = ur.user_id
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('faculty', 'hod', 'principal')
    AND f.department_id = students.department_id
  )
);

-- Admin can view all students
CREATE POLICY "Admin can view all students"
ON students FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

#### Security Definer Function
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;
```

---

## 6. Backend Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Database connection
│   │   ├── supabase.ts          # Supabase client config
│   │   ├── redis.ts             # Redis config (optional)
│   │   ├── jwt.ts               # JWT configuration
│   │   └── environment.ts       # Environment variables
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts   # Authentication middleware
│   │   ├── rbac.middleware.ts   # Role-based access control
│   │   ├── validation.middleware.ts  # Input validation
│   │   ├── error.middleware.ts  # Error handling
│   │   ├── logging.middleware.ts # Request logging
│   │   └── rateLimit.middleware.ts # Rate limiting
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── student.controller.ts
│   │   ├── faculty.controller.ts
│   │   ├── course.controller.ts
│   │   ├── enrollment.controller.ts
│   │   ├── attendance.controller.ts
│   │   ├── assignment.controller.ts
│   │   ├── fee.controller.ts
│   │   ├── payment.controller.ts
│   │   ├── document.controller.ts
│   │   ├── mou.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── announcement.controller.ts
│   │   ├── query.controller.ts
│   │   ├── analytics.controller.ts
│   │   ├── ai.controller.ts
│   │   ├── calendar.controller.ts
│   │   ├── department.controller.ts
│   │   ├── report.controller.ts
│   │   └── system.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── student.service.ts
│   │   ├── faculty.service.ts
│   │   ├── course.service.ts
│   │   ├── enrollment.service.ts
│   │   ├── attendance.service.ts
│   │   ├── assignment.service.ts
│   │   ├── fee.service.ts
│   │   ├── payment.service.ts
│   │   ├── document.service.ts
│   │   ├── mou.service.ts
│   │   ├── notification.service.ts
│   │   ├── announcement.service.ts
│   │   ├── query.service.ts
│   │   ├── analytics.service.ts
│   │   ├── ai.service.ts
│   │   ├── calendar.service.ts
│   │   ├── department.service.ts
│   │   ├── report.service.ts
│   │   ├── email.service.ts
│   │   ├── sms.service.ts
│   │   ├── storage.service.ts
│   │   └── qr.service.ts
│   │
│   ├── models/              # TypeScript interfaces/types
│   │   ├── user.model.ts
│   │   ├── student.model.ts
│   │   ├── faculty.model.ts
│   │   ├── course.model.ts
│   │   ├── enrollment.model.ts
│   │   ├── attendance.model.ts
│   │   ├── assignment.model.ts
│   │   ├── fee.model.ts
│   │   ├── payment.model.ts
│   │   ├── document.model.ts
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── index.ts             # Main router
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── student.routes.ts
│   │   ├── faculty.routes.ts
│   │   ├── course.routes.ts
│   │   ├── enrollment.routes.ts
│   │   ├── attendance.routes.ts
│   │   ├── assignment.routes.ts
│   │   ├── fee.routes.ts
│   │   ├── payment.routes.ts
│   │   ├── document.routes.ts
│   │   ├── mou.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── announcement.routes.ts
│   │   ├── query.routes.ts
│   │   ├── analytics.routes.ts
│   │   ├── ai.routes.ts
│   │   ├── calendar.routes.ts
│   │   ├── department.routes.ts
│   │   ├── report.routes.ts
│   │   └── system.routes.ts
│   │
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── user.validator.ts
│   │   ├── student.validator.ts
│   │   ├── faculty.validator.ts
│   │   ├── course.validator.ts
│   │   ├── enrollment.validator.ts
│   │   ├── attendance.validator.ts
│   │   ├── assignment.validator.ts
│   │   ├── fee.validator.ts
│   │   ├── payment.validator.ts
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── response.util.ts     # Response formatter
│   │   ├── error.util.ts        # Custom error classes
│   │   ├── logger.util.ts       # Logger utility
│   │   ├── pagination.util.ts   # Pagination helper
│   │   ├── dateTime.util.ts     # Date/time utilities
│   │   ├── crypto.util.ts       # Encryption utilities
│   │   ├── file.util.ts         # File handling
│   │   └── constants.ts         # Constants
│   │
│   ├── types/
│   │   ├── express.d.ts         # Express type extensions
│   │   ├── enums.ts             # Enums
│   │   └── interfaces.ts        # Common interfaces
│   │
│   ├── database/
│   │   ├── migrations/          # SQL migration files
│   │   └── seeds/               # Database seed files
│   │
│   └── app.ts                   # Express app setup
│   └── server.ts                # Server entry point
│
├── supabase/
│   ├── functions/               # Edge functions
│   │   ├── ai-chat/
│   │   ├── payment-webhook/
│   │   ├── generate-qr/
│   │   ├── send-notification/
│   │   └── ...
│   │
│   ├── migrations/              # Supabase migrations
│   └── config.toml              # Supabase config
│
├── ai-service/                  # Python AI microservice
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── models/
│   │   │   ├── prediction.py
│   │   │   └── recommendation.py
│   │   ├── services/
│   │   │   ├── ml_service.py
│   │   │   └── data_processor.py
│   │   └── routes/
│   │       ├── prediction.py
│   │       └── recommendation.py
│   │
│   ├── models/                  # ML models
│   │   ├── performance_model.pkl
│   │   └── dropout_model.pkl
│   │
│   ├── requirements.txt
│   └── Dockerfile
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── docker-compose.yml
└── README.md
```

---

## 7. Data Flow Diagrams

### 7.1 Authentication Flow

```
User Registration Flow:
┌─────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ Frontend│─────▶│  Backend │─────▶│ Supabase │─────▶│ Database │
│         │      │          │      │   Auth   │      │          │
└─────────┘      └──────────┘      └──────────┘      └──────────┘
     │                 │                  │                 │
     │  1. Submit Form │                  │                 │
     ├────────────────▶│                  │                 │
     │                 │  2. Validate     │                 │
     │                 │  3. Hash Password│                 │
     │                 │  4. Create User  │                 │
     │                 ├─────────────────▶│                 │
     │                 │                  │  5. Insert User │
     │                 │                  ├────────────────▶│
     │                 │                  │◀────────────────┤
     │                 │  6. Create       │                 │
     │                 │     Profile      │                 │
     │                 ├──────────────────┼────────────────▶│
     │                 │  7. Assign Role  │                 │
     │                 ├──────────────────┼────────────────▶│
     │  8. JWT Token   │                  │                 │
     │◀────────────────┤                  │                 │
     │  9. Redirect    │                  │                 │
     └─────────────────┘                  │                 │

User Login Flow:
┌─────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ Frontend│─────▶│  Backend │─────▶│ Supabase │─────▶│ Database │
└─────────┘      └──────────┘      └──────────┘      └──────────┘
     │                 │                  │                 │
     │  1. Login Form  │                  │                 │
     ├────────────────▶│                  │                 │
     │                 │  2. Validate     │                 │
     │                 │  3. Verify User  │                 │
     │                 ├─────────────────▶│                 │
     │                 │                  │  4. Query User  │
     │                 │                  ├────────────────▶│
     │                 │                  │◀────────────────┤
     │                 │  5. Fetch Roles  │                 │
     │                 ├──────────────────┼────────────────▶│
     │                 │  6. Generate JWT │                 │
     │  7. JWT + Data  │                  │                 │
     │◀────────────────┤                  │                 │
     │  8. Store Token │                  │                 │
     │  9. Redirect    │                  │                 │
     └─────────────────┘                  │                 │
```

### 7.2 Attendance Marking Flow (QR Code)

```
┌─────────┐   ┌──────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐
│ Faculty │   │ Frontend │   │  Backend  │   │ Supabase │   │ Database │
│  Device │   │  Student │   │           │   │          │   │          │
└─────────┘   └──────────┘   └───────────┘   └──────────┘   └──────────┘
     │              │               │              │              │
     │ 1. Start Class               │              │              │
     ├──────────────┼──────────────▶│              │              │
     │              │  2. Generate  │              │              │
     │              │     QR Code   │              │              │
     │              │               ├─────────────▶│              │
     │              │               │  3. Create   │              │
     │              │               │     Session  │              │
     │              │               ├──────────────┼─────────────▶│
     │ 4. Display QR│               │              │              │
     │◀─────────────┤               │              │              │
     │              │               │              │              │
     │              │ 5. Scan QR    │              │              │
     │              ├──────────────▶│              │              │
     │              │               │ 6. Validate  │              │
     │              │               │    Session   │              │
     │              │               ├─────────────▶│              │
     │              │               │              │ 7. Check     │
     │              │               │              │    Student   │
     │              │               │              ├─────────────▶│
     │              │               │              │◀─────────────┤
     │              │               │ 8. Mark      │              │
     │              │               │    Present   │              │
     │              │               ├──────────────┼─────────────▶│
     │              │ 9. Success    │              │              │
     │              │◀──────────────┤              │              │
     │ 10. Update   │               │              │              │
     │     Stats    │               │              │              │
     │◀─────────────┼───────────────┤              │              │
     └──────────────┴───────────────┴──────────────┴──────────────┘
```

### 7.3 Fee Payment Flow

```
┌─────────┐   ┌──────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐
│ Student │   │ Frontend │   │  Backend  │   │ Payment  │   │ Database │
│         │   │          │   │           │   │ Gateway  │   │          │
└─────────┘   └──────────┘   └───────────┘   └──────────┘   └──────────┘
     │              │               │              │              │
     │ 1. View Fees │               │              │              │
     ├─────────────▶│               │              │              │
     │              │ 2. Fetch Fees │              │              │
     │              ├──────────────▶│              │              │
     │              │               │ 3. Query DB  │              │
     │              │               ├──────────────┼─────────────▶│
     │              │               │◀─────────────┼──────────────┤
     │ 4. Display   │               │              │              │
     │◀─────────────┤               │              │              │
     │              │               │              │              │
     │ 5. Pay Now   │               │              │              │
     ├─────────────▶│               │              │              │
     │              │ 6. Initiate   │              │              │
     │              │    Payment    │              │              │
     │              ├──────────────▶│              │              │
     │              │               │ 7. Create    │              │
     │              │               │    Order     │              │
     │              │               ├─────────────▶│              │
     │              │               │◀─────────────┤              │
     │              │ 8. Payment    │              │              │
     │              │    Page       │              │              │
     │◀─────────────┤               │              │              │
     │              │               │              │              │
     │ 9. Enter Card Details        │              │              │
     ├──────────────┼───────────────┼─────────────▶│              │
     │              │               │              │              │
     │              │               │ 10. Webhook  │              │
     │              │               │◀─────────────┤              │
     │              │               │ 11. Verify   │              │
     │              │               │     Payment  │              │
     │              │               ├──────────────┼─────────────▶│
     │              │               │ 12. Update   │              │
     │              │               │     Status   │              │
     │              │               ├──────────────┼─────────────▶│
     │              │ 13. Generate │              │              │
     │              │     Receipt  │              │              │
     │              │               ├──────────────┼─────────────▶│
     │              │ 14. Send     │              │              │
     │              │     Email    │              │              │
     │ 15. Success  │               │              │              │
     │◀─────────────┤               │              │              │
     └──────────────┴───────────────┴──────────────┴──────────────┘
```

### 7.4 AI Prediction Flow

```
┌─────────┐   ┌──────────┐   ┌───────────┐   ┌──────────┐   ┌──────────┐
│ Faculty │   │ Frontend │   │  Backend  │   │ AI/ML    │   │ Database │
│   /     │   │          │   │           │   │ Service  │   │          │
│ Admin   │   │          │   │           │   │ (Python) │   │          │
└─────────┘   └──────────┘   └───────────┘   └──────────┘   └──────────┘
     │              │               │              │              │
     │ 1. Request   │               │              │              │
     │    Prediction│               │              │              │
     ├─────────────▶│               │              │              │
     │              │ 2. API Call   │              │              │
     │              ├──────────────▶│              │              │
     │              │               │ 3. Fetch     │              │
     │              │               │    Student   │              │
     │              │               │    Data      │              │
     │              │               ├──────────────┼─────────────▶│
     │              │               │◀─────────────┼──────────────┤
     │              │               │ 4. Call ML   │              │
     │              │               │    Service   │              │
     │              │               ├─────────────▶│              │
     │              │               │              │ 5. Load Model│
     │              │               │              │ 6. Process   │
     │              │               │              │    Data      │
     │              │               │              │ 7. Generate  │
     │              │               │              │    Prediction│
     │              │               │ 8. Result    │              │
     │              │               │◀─────────────┤              │
     │              │               │ 9. Store     │              │
     │              │               │    Prediction│              │
     │              │               ├──────────────┼─────────────▶│
     │              │ 10. Response  │              │              │
     │              │◀──────────────┤              │              │
     │ 11. Display  │               │              │              │
     │◀─────────────┤               │              │              │
     └──────────────┴───────────────┴──────────────┴──────────────┘
```

---

## 8. Security Implementation

### 8.1 Security Best Practices

#### Input Validation
```typescript
import { z } from 'zod';

// Example: Student creation validation
export const createStudentSchema = z.object({
  email: z.string().email().max(255),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  enrollmentNumber: z.string().regex(/^[A-Z0-9]+$/),
  departmentId: z.string().uuid(),
  batchYear: z.number().int().min(2020).max(2030),
  semester: z.number().int().min(1).max(8),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/),
});
```

#### Password Security
```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

#### JWT Security
```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export function generateAccessToken(userId: string, roles: string[]): string {
  return jwt.sign(
    { sub: userId, roles, type: 'access' },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}
```

#### SQL Injection Prevention
```typescript
// ✅ CORRECT: Use parameterized queries
const { data, error } = await supabase
  .from('students')
  .select('*')
  .eq('email', userEmail);

// ❌ WRONG: Never use string concatenation
// const query = `SELECT * FROM students WHERE email = '${userEmail}'`;
```

#### XSS Prevention
```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}
```

#### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP'
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per window
  message: 'Too many login attempts'
});
```

#### CORS Configuration
```typescript
import cors from 'cors';

const corsOptions: cors.CorsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

### 8.2 Environment Variables

```env
# .env.example

# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Supabase
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxx

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@campusconnect.com

# SMS Service
SMS_API_KEY=your-sms-api-key
SMS_SENDER_ID=CAMPUS

# Storage
STORAGE_BUCKET=campus-documents

# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-ai-service-key

# Payment Gateway
PAYMENT_GATEWAY_KEY=your-payment-key
PAYMENT_GATEWAY_SECRET=your-payment-secret
PAYMENT_WEBHOOK_SECRET=your-webhook-secret

# Frontend
FRONTEND_URL=http://localhost:5173

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 9. Deployment Guide

### 9.1 Deployment Architecture

```
┌────────────────────────────────────────────────────────────┐
│                        Load Balancer                        │
└────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
┌─────────▼────────┐ ┌────────▼───────┐ ┌────────▼────────┐
│   Web Server 1   │ │  Web Server 2  │ │  Web Server 3   │
│   (Node.js API)  │ │  (Node.js API) │ │  (Node.js API)  │
└──────────────────┘ └────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
┌─────────▼────────┐ ┌────────▼───────┐ ┌────────▼────────┐
│    Supabase      │ │   AI Service   │ │     Redis       │
│   (Database)     │ │    (Python)    │ │     (Cache)     │
└──────────────────┘ └────────────────┘ └─────────────────┘
```

### 9.2 Deployment Steps

#### 1. Supabase Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link project
supabase link --project-ref your-project-ref

# Push database migrations
supabase db push

# Deploy edge functions
supabase functions deploy
```

#### 2. Backend Deployment (Node.js)
```bash
# Build TypeScript
npm run build

# Deploy to your hosting platform
# Example: Heroku
heroku create campusconnect-api
git push heroku main

# Example: AWS EC2
ssh user@your-ec2-instance
git clone your-repo
npm install
npm run build
pm2 start dist/server.js
```

#### 3. AI Service Deployment (Python)
```bash
# Build Docker image
docker build -t campusconnect-ai:latest ./ai-service

# Run container
docker run -d \
  -p 8000:8000 \
  -e DATABASE_URL=$DATABASE_URL \
  campusconnect-ai:latest

# Or deploy to cloud
# Google Cloud Run, AWS ECS, etc.
```

#### 4. Frontend Deployment
```bash
# Build React app
npm run build

# Deploy to Vercel/Netlify
vercel deploy

# Or serve with Nginx
sudo cp -r dist/* /var/www/html/
```

### 9.3 Docker Setup

#### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis

  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=campusconnect
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

---

## 10. Complete Implementation Example

### 10.1 Authentication Service

```typescript
// src/services/auth.service.ts
import { supabase } from '../config/supabase';
import { hashPassword, verifyPassword } from '../utils/crypto.util';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user!.id,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
      });

    if (profileError) throw profileError;

    // Assign role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user!.id,
        role: data.role,
      });

    if (roleError) throw roleError;

    return authData;
  }

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch user roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id);

    const rolesList = roles?.map(r => r.role) || [];

    // Generate tokens
    const accessToken = generateAccessToken(data.user.id, rolesList);
    const refreshToken = generateRefreshToken(data.user.id);

    return {
      user: data.user,
      roles: rolesList,
      accessToken,
      refreshToken,
    };
  }
}
```

### 10.2 Student Controller

```typescript
// src/controllers/student.controller.ts
import { Request, Response } from 'express';
import { StudentService } from '../services/student.service';
import { successResponse, errorResponse } from '../utils/response.util';

export class StudentController {
  private studentService: StudentService;

  constructor() {
    this.studentService = new StudentService();
  }

  async getAllStudents(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, department, semester } = req.query;

      const result = await this.studentService.getAll({
        page: Number(page),
        limit: Number(limit),
        department: department as string,
        semester: semester ? Number(semester) : undefined,
      });

      return successResponse(res, result, 'Students fetched successfully');
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  async getStudentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const student = await this.studentService.getById(id);

      if (!student) {
        return errorResponse(res, 'Student not found', 404);
      }

      return successResponse(res, student, 'Student fetched successfully');
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  async createStudent(req: Request, res: Response) {
    try {
      const studentData = req.body;
      const student = await this.studentService.create(studentData);

      return successResponse(res, student, 'Student created successfully', 201);
    } catch (error) {
      return errorResponse(res, error);
    }
  }

  async updateStudent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const student = await this.studentService.update(id, updateData);

      return successResponse(res, student, 'Student updated successfully');
    } catch (error) {
      return errorResponse(res, error);
    }
  }
}
```

### 10.3 Route Definition

```typescript
// src/routes/student.routes.ts
import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { createStudentSchema } from '../validators/student.validator';

const router = Router();
const controller = new StudentController();

router.use(authenticate); // All routes require authentication

router.get(
  '/',
  authorize(['faculty', 'hod', 'principal', 'admin']),
  controller.getAllStudents.bind(controller)
);

router.get(
  '/:id',
  authorize(['student', 'faculty', 'hod', 'principal', 'admin']),
  controller.getStudentById.bind(controller)
);

router.post(
  '/',
  authorize(['admin', 'principal']),
  validate(createStudentSchema),
  controller.createStudent.bind(controller)
);

router.put(
  '/:id',
  authorize(['admin', 'principal']),
  controller.updateStudent.bind(controller)
);

export default router;
```

---

## 11. Testing Strategy

### 11.1 Unit Tests
```typescript
// tests/unit/services/auth.service.test.ts
import { AuthService } from '../../../src/services/auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Test@1234',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
      };

      const result = await authService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(userData.email);
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'Test@1234',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
      };

      await expect(authService.register(userData)).rejects.toThrow();
    });
  });
});
```

### 11.2 Integration Tests
```typescript
// tests/integration/api/student.test.ts
import request from 'supertest';
import app from '../../../src/app';

describe('Student API', () => {
  let authToken: string;

  beforeAll(async () => {
    // Login to get auth token
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Admin@123',
      });

    authToken = response.body.data.accessToken;
  });

  describe('GET /api/v1/students', () => {
    it('should return list of students', async () => {
      const response = await request(app)
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app).get('/api/v1/students');

      expect(response.status).toBe(401);
    });
  });
});
```

---

## 12. Monitoring & Logging

### 12.1 Logging Setup
```typescript
// src/utils/logger.util.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

---

## 🎯 Summary

This document provides a complete backend architecture for the CampusConnect ERP system, including:

✅ **Database Schema** - 25+ tables with relationships
✅ **API Design** - 100+ RESTful endpoints
✅ **Authentication & Authorization** - JWT + RBAC
✅ **Security** - Input validation, SQL injection prevention, XSS protection
✅ **Data Flow** - Complete request-response cycles
✅ **Folder Structure** - MVC pattern with clean architecture
✅ **Deployment Guide** - Docker, cloud deployment steps
✅ **Code Examples** - Working implementations

**Next Steps:**
1. Enable Lovable Cloud (Supabase)
2. Run database migrations
3. Create Edge Functions
4. Integrate with frontend
5. Test and deploy

This architecture is production-ready, scalable, and follows industry best practices! 🚀
