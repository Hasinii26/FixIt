# FixIt — Smart Complaint & Maintenance Management System

A full-stack college technical training web application engineered for campus maintenance operations, facility fault reporting, technician dispatch, and transparent resolution tracking.

---

## 📌 Project Overview
**FixIt** bridges the communication gap between students/residents, maintenance personnel (technicians, electricians, plumbers), and campus administrative officers.

- **Frontend:** React.js (Vite), Axios, Plain CSS (Navy `#0f172a`, Teal `#0d9488`, White)
- **Backend:** Node.js, Express.js, RESTful Architecture
- **Database:** MySQL 8.0 with Relational Constraints, Foreign Keys & Cascade rules
- **Security:** Bcrypt Password Hashing, JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)

---

## 🌟 Key Features

### 1. Role-Based Authentication & Access Control
- Secure user registration and login.
- Password hashing with **bcrypt**.
- Stateless, tamper-proof session management using **JWT**.
- Server-side role protection enforcing permissions across **Student/User**, **Staff**, and **Admin**.

### 2. Student / Resident Dashboard
- Live metric cards: Total Filed, Pending Review, In Progress, Resolved.
- Complaint Lodging Form:
  - Fields: Title, Category (*Electrical*, *Plumbing*, *Internet*, *Cleaning*, *Other*), Location/Room, Priority (*Low*, *Medium*, *High*), Description.
  - Automatically generates unique tracking code (e.g. `FIX-1001`).
- Filter & Search: Search by ticket ID, keywords, room numbers, filter by category & status.
- Real-Time Progress Tracker: Interactive modal showing assigned technician details and audit history timeline.

### 3. Maintenance Staff Dashboard
- Personalized technician work orders list filtered to assigned jobs.
- Update ticket status (e.g., from *Assigned* to *In Progress* to *Resolved*).
- Append technician notes and progress remarks directly into the database audit trail.

### 4. Admin Dispatch Console
- Global visibility of all campus maintenance tickets and statistics.
- Single-click technician assignment & work order dispatch.
- Override ticket priorities and statuses.
- Dedicated Maintenance Staff directory view with contact information and assigned trade.

---

## 🗄️ Database Schema (`fixit_db`)

The database consists of 4 relational tables in `backend/schema.sql`:

1. `users`: Stores registered campus users, technicians, and administrators (`id`, `name`, `email`, `password`, `role`, `phone`, `department`, `created_at`, `updated_at`).
2. `complaints`: Stores maintenance tickets (`id`, `complaint_code`, `user_id`, `title`, `description`, `category`, `location`, `priority`, `status`, `created_at`, `updated_at`).
3. `assignments`: Maps complaints to staff members (`id`, `complaint_id`, `staff_id`, `assigned_by`, `notes`, `assigned_at`, `updated_at`).
4. `complaint_history`: Chronological audit trail logging status transitions, timestamps, author, and notes (`id`, `complaint_id`, `updated_by`, `status`, `notes`, `created_at`).

---

## 🔑 Demo Login Credentials

For quick evaluation and live college presentation, default accounts are pre-seeded in the database:

| Role | Email | Password | Department / Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@fixit.com` | `password123` | Facilities Management Officer |
| **Staff (Electrician)** | `staff.electric@fixit.com` | `password123` | Electrical Maintenance Specialist |
| **Staff (Plumber)** | `staff.plumb@fixit.com` | `password123` | Plumbing & Water Supply Specialist |
| **Staff (IT Support)** | `staff.it@fixit.com` | `password123` | Campus Network Operations |
| **Student / User** | `student@fixit.com` | `password123` | Computer Science Student |

> *Tip: The Login page also features convenient 1-click **Quick-Fill Demo** buttons.*

---

## 🚀 Setup & Execution Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ or v24+)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) (v8.0+)

---

### Step 1: Database Initialization
Open your MySQL client or command prompt and execute `backend/schema.sql`:

```bash
# In MySQL CLI or PowerShell:
mysql -u root -p < backend/schema.sql
```
*(Or open MySQL Workbench, load `backend/schema.sql`, and execute).*

---

### Step 2: One-Command Startup (Recommended)
From the root project directory `fixit-system`:
```bash
# Run both Backend & Frontend simultaneously with one command:
npm run dev
# OR:
npm start
```

### Step 3: Or Start Individually
**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev   # or npm start
```

---

## 📁 Project Directory Structure

```
fixit-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MySQL2 connection pool & auto-test
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and JWT issuance
│   │   ├── complaintController.js# Complaint CRUD, search, filter, assignments & stats
│   │   └── userController.js     # Staff & user administration
│   ├── middleware/
│   │   └── auth.js               # JWT verification & RBAC authorization middleware
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth routes
│   │   ├── complaintRoutes.js    # /api/complaints routes
│   │   └── userRoutes.js         # /api/users routes
│   ├── .env                      # Database credentials & JWT secret
│   ├── .env.example              # Template environment file
│   ├── package.json              # Backend dependencies
│   ├── schema.sql                # Complete DDL schema & demonstration seed data
│   └── server.js                 # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # Axios client with JWT interceptors
│   │   ├── components/
│   │   │   ├── ComplaintDetailModal.jsx # Detailed modal with audit timeline
│   │   │   ├── PriorityBadge.jsx        # High / Medium / Low badges
│   │   │   ├── Sidebar.jsx              # Role-aware collapsible navigation
│   │   │   ├── StatCard.jsx             # Metric summary cards
│   │   │   ├── StatusBadge.jsx          # Submitted/Assigned/In Progress/Resolved badges
│   │   │   └── Topbar.jsx               # Header with user welcome & date
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global session state & localStorage persistence
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx# Admin dispatch, staff assign & statistics
│   │   │   ├── Login.jsx         # Sign in with 1-click college demo credentials
│   │   │   ├── Register.jsx      # New user / technician registration
│   │   │   ├── StaffDashboard.jsx# Technician work orders & progress update
│   │   │   └── UserDashboard.jsx # Student ticket submission & tracking
│   │   ├── App.jsx               # Route & role controller
│   │   ├── index.css             # Navy & Teal polished responsive stylesheet
│   │   └── main.jsx              # React DOM entry
│   ├── index.html                # App title and viewport
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite build configuration
└── README.md                     # Comprehensive project documentation
```

---

## 🧪 Verified API Endpoints

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System status health check |
| `POST` | `/api/auth/register` | Public | Create new user / staff account |
| `POST` | `/api/auth/login` | Public | Login and receive JWT token |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user session profile |
| `GET` | `/api/complaints/stats` | Authenticated | Get role-scoped metric statistics |
| `GET` | `/api/complaints` | Authenticated | List complaints (with search, category, status filters) |
| `POST` | `/api/complaints` | Authenticated | Submit new complaint ticket |
| `GET` | `/api/complaints/:id` | Authenticated | View complaint details + history audit trail |
| `PUT` | `/api/complaints/:id/assign` | Admin Only | Assign / re-assign technician with notes |
| `PUT` | `/api/complaints/:id/status` | Staff / Admin | Update status (*In Progress*, *Resolved*) & notes |
| `GET` | `/api/users/staff` | Admin Only | Retrieve list of active maintenance staff |

---

## 🎓 College Presentation Demonstration Flow

When demonstrating this project to instructors or evaluators, follow this workflow:

1. **Open Frontend:** Navigate to `http://localhost:5173`.
2. **Student Submission:**
   - Click the **🎓 Student** quick demo button and sign in.
   - Observe the 4 metric cards (Total, Pending, In Progress, Resolved).
   - Scroll to "Lodge a New Complaint", fill in an Electrical or Plumbing issue, and submit.
   - Notice the instant ticket generation (e.g. `FIX-2887`).
   - Click "View Progress" to see the newly logged history event.
   - Click **Exit** to sign out.
3. **Admin Dispatch:**
   - Click the **🛡️ Admin** quick demo button and sign in.
   - Inspect the campus-wide statistics.
   - Locate the newly submitted complaint.
   - Select a staff member from the dropdown (e.g. *Robert Green*) and click **Assign**.
   - Notice the status immediately changes to **Assigned**.
   - Click **Exit** to sign out.
4. **Staff Progress & Resolution:**
   - Click the **⚡ Staff** quick demo button and sign in.
   - Observe the assigned work order on the technician console.
   - Click **Update & Resolve**.
   - Change status to **In Progress** or **Resolved**, type technician notes (e.g. *"Replaced faulty starter capacitor"*), and click **Save Status Update**.
   - Notice the chronological audit timeline updates with the technician's name and timestamp.
5. **Student Verification:**
   - Sign back in as **Student** and observe the ticket status has transitioned to **Resolved** with the complete resolution timeline visible.
