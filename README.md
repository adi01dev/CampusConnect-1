# 🎓 CampusConnect — Full-Stack ERP for Educational Institutes

![React](https://img.shields.io/badge/Frontend-React.js-blue)
![Tailwind](https://img.shields.io/badge/UI-TailwindCSS-06B6D4)
![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933)
![Python](https://img.shields.io/badge/AI-Python%20%28FastAPI%29-3776AB)
![MongoDB](https://img.shields.io/badge/DB-MongoDB%20Atlas-47A248)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Firebase](https://img.shields.io/badge/Cloud-Firebase%20Storage%20%2B%20FCM-FFCA28)
![License](https://img.shields.io/badge/License-MIT-green)

CampusConnect is a **web-based ERP** tailored for schools/colleges with **role-based access** for six roles: **Principal, HOD, Faculty, Student, Admin, Accountant**. Each role gets a dedicated dashboard and permissions. The system includes **AI features** (chatbot, performance prediction, and recommendations), **QR-based attendance**, **smart calendar sync**, **secure document storage**, and **PWA support**.

---

## 🧭 Table of Contents
- [Features](#-features)
- [Role Access Matrix](#-role-access-matrix)
- [Tech Stack](#-tech-stack)
- [Folder Structure](#-folder-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 1) Authentication & Role Management
- JWT-based auth (access + refresh tokens)
- Role-based routing & dashboards
- MongoDB collections for users, roles, permissions

### 2) Role Dashboards
- **Principal**: cross-institute analytics, performance insights, system logs
- **HOD**: manage department: students, faculty, subjects, student data
- **Faculty**: upload notes/assignments/schedules, **QR attendance**, answer queries/MoU requests, see **AI predictions**
- **Student**: view notes/schedules/attendance/assignments/docs, pay fees, MoU requests, **AI recommendations**
- **Admin**: manage cloud docs (Firebase/AWS S3), upload & retrieve
- **Accountant**: manage fee data, generate receipts, send notifications

### 3) AI & ML
- **AI Chatbot** (Google Gemini) for support/navigation
- **Student Performance Prediction** (attendance + marks)
- **Course/Resource Recommendations** (profile + interests + records)

### 4) Integrations
- **QR Attendance** (JS scanner)
- **Smart Calendar** (Google Calendar API)
- **Notifications** (Firebase Cloud Messaging)
- **PWA** (installable, offline-ready)
- **Secure Document Uploads** (AES-256 at rest + signed URLs)

---

## 🔐 Role Access Matrix

| Feature / Role                | Principal | HOD | Faculty | Student | Admin | Accountant |
|------------------------------|:---------:|:---:|:------:|:-------:|:-----:|:----------:|
| View Analytics               | ✅        | ✅* | ✅*    | ❌      | ✅*   | ✅*        |
| Manage Departments           | ✅        | ✅  | ❌     | ❌      | ❌    | ❌         |
| Manage Subjects              | ✅        | ✅  | ✅*    | ❌      | ❌    | ❌         |
| Upload Notes/Assignments     | ✅*       | ✅* | ✅     | ❌      | ❌    | ❌         |
| QR Attendance                | View      | View| **Mark**| View     | ❌    | ❌         |
| Student Queries / MoUs       | View      | View| **Respond** | **Raise** | ❌ | ❌  |
| Fee Payments                 | View      | View| View   | **Pay** | ❌    | **Manage** |
| Cloud Documents              | View      | View| View   | View    | **Manage** | View |
| System Logs                  | **All**   | Dept| Own    | ❌      | **All** | View |

> `*` indicates limited/aggregated access per role.

---

## 🧰 Tech Stack

- **Frontend**: React.js, Tailwind CSS, React Router, Axios, PWA
- **Backend**: Node.js, Express, JWT, Mongoose, Multer
- **AI/ML**: Python 3.10+, Flask/FastAPI, scikit-learn, pandas, NumPy
- **Database**: MongoDB Atlas
- **Cloud**: Firebase Storage, FCM
- **Other**: Google Calendar API, QR Scanner (e.g., `html5-qrcode`)

---

### 📂 Folder Structure

![1000081487](https://github.com/user-attachments/assets/b98a6498-15ef-487d-9815-c2271736c942)


---

### ☁️ Deployment

- Client: Vercel/Firebase Hosting
- Server: Render/Railway
- AI: Render/Railway (Python service)
- Firebase: Storage + FCM setup

---

### 🤝 Contributing

1. Fork the repo
2. Create a branch
3. Commit changes with tests/docs
4. Open a PR

---

### 📜 License

MIT — see LICENSE for details.
