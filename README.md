# CodeRegal Interactive LMS

A comprehensive full-stack Learning Management System designed to facilitate online learning with support for multiple user roles, real-time programming activities, automated assessment, and comprehensive progress tracking.

![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)

## 📋 Table of Contents

- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [Screenshots](#-screenshots)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Security Features](#-security-features)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### User Management
- **Multi-role System**: Support for Admin, Coordinator, Teacher, and Student roles
- **Role-based Access Control**: Secure permission system for different user types
- **User Authentication**: Secure login with Google OAuth integration
- **Profile Management**: User profiles with photo upload and information management

### Learning Management
- **Class Management**: Create and manage classes with course outlines
- **Course Structure**: Hierarchical organization (Modules → Lessons → Topics)
- **Material Management**: Upload and organize learning materials (PDFs, documents, images)
- **Student Enrollment**: Request-based enrollment system with approval workflow

### Interactive Activities
- **Real-time Code Execution**: Integrated Monaco Editor with JDoodle API for live coding
- **Multiple Activity Types**: Coding exercises, quizzes, multiple choice, identification, and essay
- **Automated Grading**: Automatic evaluation of coding activities and quizzes
- **Progress Tracking**: Real-time progress monitoring for students and teachers

### Assessment & Analytics
- **Automated Grading System**: Instant feedback on coding activities and quizzes
- **Progress Dashboard**: Visual progress tracking with charts and statistics
- **Leaderboard**: Competitive ranking system to motivate students
- **Performance Reports**: Detailed analytics for teachers and coordinators
- **Certificate Generation**: Automated certificate creation for course completion

### Additional Features
- **Newsfeed System**: Social features with posts, comments, and reactions
- **File Management**: Secure file upload/download system
- **Email Notifications**: PHPMailer integration for email communications
- **Audit Logging**: Comprehensive activity logging for security and tracking
- **Responsive Design**: Mobile-friendly interface using Bootstrap

## 🛠️ Technologies Used

### Backend
- **PHP 8.2+** (Object-Oriented Programming)
- **MySQL/MariaDB** (Database)
- **PDO** (Database Abstraction Layer)
- **Composer** (Dependency Management)

### Frontend
- **JavaScript** (Vanilla JS, AJAX)
- **Bootstrap 5** (CSS Framework)
- **Monaco Editor** (Code Editor)
- **Prism.js** (Syntax Highlighting)

### APIs & Integrations
- **Google OAuth API** (Authentication)
- **JDoodle API** (Code Execution)
- **PHPMailer** (Email Functionality)

### Security
- **CSRF Protection**
- **Password Hashing** (bcrypt)
- **Input Sanitization & Validation**
- **Rate Limiting**
- **SQL Injection Prevention** (Prepared Statements)
- **Session Management**

## 🚀 Installation

### Prerequisites

- **XAMPP** (or any PHP development environment)
- **PHP 8.2+**
- **MySQL/MariaDB 10.4+**
- **Composer** (for dependency management)
- **Web Server** (Apache/Nginx)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Deeyb/capstoneproject.git
cd capstoneproject
```

### Step 2: Install Dependencies

```bash
composer install
```

### Step 3: Database Setup

1. Create a new MySQL database:
```sql
CREATE DATABASE coderegal_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

2. Import the database schema:
```bash
# Using phpMyAdmin or MySQL command line
mysql -u root -p coderegal_db < coderegal_db.sql
```

Or import `coderegal_db.sql` through phpMyAdmin.

### Step 4: Configure Environment

1. Copy the environment example file:
```bash
cp env.example .env
```

2. Edit `.env` file with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=coderegal_db

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost/capstoneproject/google_callback.php

# JDoodle API Configuration
JDOODLE_CLIENT_ID=your_jdoodle_client_id_here
JDOODLE_CLIENT_SECRET=your_jdoodle_client_secret_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_ENCRYPTION=tls
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
```

### Step 5: Set Permissions

Ensure the following directories are writable:
```bash
chmod 755 sessions/
chmod 755 uploads/
chmod 755 storage/
chmod 755 materials/
```

### Step 6: Run Database Migrations (if needed)

```bash
# Import any additional migrations
mysql -u root -p coderegal_db < database_migrations.sql
```

### Step 7: Start the Server

If using XAMPP:
1. Start Apache and MySQL from XAMPP Control Panel
2. Access the application at: `http://localhost/capstoneproject`

## ⚙️ Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost/capstoneproject/google_callback.php`
6. Copy Client ID and Client Secret to `.env` file

### JDoodle API Setup

1. Sign up at [JDoodle API](https://www.jdoodle.com/api)
2. Get your Client ID and Client Secret
3. Add credentials to `.env` file
4. Test connection via Admin Panel > Settings

### Email Configuration

For Gmail:
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in `.env` file (not your regular password)

## 📖 Usage

### Default Admin Account

After database import, you may need to create an admin account manually or use the registration system.

### User Roles

- **Admin**: Full system access, user management, system settings, audit logs
- **Coordinator**: Course management, class oversight, reports, user analytics
- **Teacher**: Class management, activity creation, automated grading, student progress tracking
- **Student**: Enroll in classes, complete activities, view progress, access leaderboard

### Getting Started

1. **Registration**: Create an account or use Google OAuth
2. **Login**: Access your role-specific dashboard
3. **Create/Join Class**: Teachers create classes, students request enrollment
4. **Create Activities**: Teachers add activities with various types (coding, quiz, essay)
5. **Submit Work**: Students complete and submit activities with real-time code execution
6. **Track Progress**: View analytics and progress reports with visual dashboards

### Key Workflows

- **Teacher Workflow**: Create class → Add course outline → Create activities → Grade submissions → View analytics
- **Student Workflow**: Join class → Access materials → Complete activities → Submit work → Track progress
- **Admin Workflow**: Manage users → Monitor system → View audit logs → Configure settings

## 📁 Project Structure

```
capstoneproject/
├── assets/                 # Frontend assets
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   └── images/            # Images
├── classes/               # PHP classes (OOP architecture)
│   ├── UnifiedAuthManager.php      # Authentication system
│   ├── UnifiedSecurityManager.php  # Security features
│   ├── UnifiedCSRFProtection.php   # CSRF protection
│   ├── Database.php                # Database connection
│   └── ...                         # Other service classes
├── config/                # Configuration files
│   ├── Database.php       # Database configuration
│   └── google_oauth.php   # OAuth configuration
├── includes/              # Include files
├── materials/             # Learning materials storage
├── modules/               # Course modules
├── PHPMailer/            # Email library
├── sessions/             # Session storage
├── storage/              # File storage
├── uploads/              # Uploaded files
├── coderegal_db.sql      # Database schema (20+ tables)
├── database_migrations.sql # Database migrations
├── coderegal_erd.dbml    # Database ERD (Entity Relationship Diagram)
├── composer.json         # PHP dependencies
├── config.php            # Main configuration
├── index.php             # Landing page
├── admin_panel.php       # Admin dashboard
├── teacher_dashboard.php # Teacher dashboard
├── student_dashboard.php # Student dashboard
├── coordinator_dashboard.php # Coordinator dashboard
└── README.md             # This file
```

### Architecture Overview

- **MVC-like Structure**: Separation of concerns with classes, views, and API endpoints
- **Service Layer**: Business logic separated into service classes
- **RESTful API**: JSON-based API for frontend-backend communication
- **Database Layer**: PDO-based database abstraction for security and flexibility

## 🔌 API Documentation

### RESTful API Endpoints

The application provides RESTful API endpoints for various operations:

- **Class Management**: `/teacher_class_api.php` - CRUD operations for classes
- **Activity Management**: `/universal_activity_api.php` - Create and manage activities
- **Submissions**: `/submissions_api.php` - Handle activity submissions
- **User Management**: `/user_action_ajax.php` - User operations and management
- **Reports**: `/get_reports_data.php` - Generate analytics and reports
- **Student Status**: `/update_student_status.php` - Manage student enrollment status

### API Response Format

All API endpoints return JSON responses in the following format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Authentication

All API endpoints require proper authentication via session management. Unauthorized requests return:

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### Example API Usage

```javascript
// Example: Update student status
fetch('/update_student_status.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    class_id: 1,
    student_id: 123,
    status: 'accepted'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## 🔒 Security Features

- **CSRF Protection**: Token-based protection against Cross-Site Request Forgery attacks
- **Password Security**: Bcrypt hashing with configurable cost (default: 12 rounds)
- **Input Validation**: Comprehensive sanitization and validation on all user inputs
- **SQL Injection Prevention**: Prepared statements with PDO (no direct SQL queries)
- **Rate Limiting**: Protection against brute force attacks (5 attempts per minute)
- **Session Security**: Secure session management with regeneration and timeout
- **XSS Protection**: Output escaping and sanitization to prevent script injection
- **File Upload Security**: Type validation, size limits, and secure storage
- **Role-Based Access Control**: Granular permissions for different user roles
- **Audit Logging**: Comprehensive activity logging for security monitoring
- **Remember Me Security**: Secure token-based "remember me" functionality

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🗄️ Database Schema

The application uses a normalized MySQL database with 20+ tables including:

- **User Management**: `users`, `authorized_ids`, `audit_logs`
- **Class Management**: `classes`, `class_students`, `courses`
- **Content Management**: `materials`, `class_modules`, `class_lessons`, `class_topics`
- **Activity System**: `lesson_activities`, `activity_questions`, `question_choices`, `activity_test_cases`
- **Submissions**: `activity_attempts`, `activity_attempt_items`
- **Analytics**: Progress tracking, leaderboard, certificates

An ERD (Entity Relationship Diagram) is available in `coderegal_erd.dbml` format. You can view it using [dbdiagram.io](https://dbdiagram.io).

## 🎯 Key Technical Highlights

### What Makes This Project Stand Out

- **Full-Stack Development**: Complete end-to-end development from database to frontend
- **Real-time Features**: Live code execution with Monaco Editor integration
- **Security-First Approach**: Comprehensive security measures implemented throughout
- **Scalable Architecture**: OOP design with service layer for maintainability
- **API-Driven**: RESTful API design for flexible frontend integration
- **Multi-role System**: Complex permission system with role-based access control
- **Automated Systems**: Automated grading, certificate generation, and progress tracking

### Challenges Solved

- **Real-time Code Execution**: Integrated external API (JDoodle) with Monaco Editor for seamless coding experience
- **Complex Database Relationships**: Designed normalized schema with 20+ interconnected tables
- **Security Implementation**: Implemented multiple layers of security (CSRF, XSS, SQL injection prevention)
- **Multi-role Management**: Built flexible permission system supporting 4 different user roles
- **File Management**: Secure file upload/download system with validation and storage

## 📊 Project Statistics

- **Database Tables**: 20+
- **API Endpoints**: 15+
- **User Roles**: 4 (Admin, Coordinator, Teacher, Student)
- **Activity Types**: 5 (Coding, Quiz, Multiple Choice, Identification, Essay)
- **Security Features**: 10+ implemented security measures
- **Technologies**: 10+ technologies and frameworks integrated

## 📝 License

This project is part of an academic capstone project. All rights reserved.

## 👤 Author

**Your Name**
- GitHub: [@Deeyb](https://github.com/Deeyb)
- Project Link: [https://github.com/Deeyb/capstoneproject](https://github.com/Deeyb/capstoneproject)

> **Note for Interviewers**: This project demonstrates full-stack development skills, security best practices, and the ability to integrate multiple third-party services. The codebase follows OOP principles and includes comprehensive error handling and security measures.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Bootstrap](https://getbootstrap.com/) - CSS framework
- [JDoodle](https://www.jdoodle.com/) - Code execution API
- [PHPMailer](https://github.com/PHPMailer/PHPMailer) - Email library
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2) - Authentication

---

⭐ If you found this project helpful, please give it a star!
