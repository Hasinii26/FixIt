-- FixIt: Smart Complaint and Maintenance Management System
-- Database Schema & Demonstration Seed Data

CREATE DATABASE IF NOT EXISTS fixit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fixit_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'staff', 'admin') NOT NULL DEFAULT 'user',
    phone VARCHAR(20) NULL,
    department VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_code VARCHAR(30) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('Electrical', 'Plumbing', 'Internet', 'Cleaning', 'Other') NOT NULL,
    location VARCHAR(150) NOT NULL,
    priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
    status ENUM('Submitted', 'Assigned', 'In Progress', 'Resolved') NOT NULL DEFAULT 'Submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaints_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    staff_id INT NOT NULL,
    assigned_by INT NOT NULL,
    notes TEXT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignment_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_staff FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_admin FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Status History Table (Audit Trail)
CREATE TABLE IF NOT EXISTS complaint_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    updated_by INT NOT NULL,
    status ENUM('Submitted', 'Assigned', 'In Progress', 'Resolved') NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- SEED DATA (Default password for all seed accounts is: password123)
-- Hash: $2b$10$ZH00SDZcYmJ6BP89DRbQyudMHxHgVkBQectBt78kTb1y3jbzvTtwK

INSERT INTO users (id, name, email, password, role, phone, department) VALUES
(1, 'Admin Officer', 'admin@fixit.com', '$2b$10$ZH00SDZcYmJ6BP89DRbQyudMHxHgVkBQectBt78kTb1y3jbzvTtwK', 'admin', '9876543210', 'Facilities Management'),
(2, 'Robert Green (Electrician)', 'staff.electric@fixit.com', '$2b$10$ZH00SDZcYmJ6BP89DRbQyudMHxHgVkBQectBt78kTb1y3jbzvTtwK', 'staff', '9876543211', 'Electrical Maintenance'),
(3, 'Sarah Connor (Plumber)', 'staff.plumb@fixit.com', '$2b$10$ZH00SDZcYmJ6BP89DRbQyudMHxHgVkBQectBt78kTb1y3jbzvTtwK', 'staff', '9876543212', 'Plumbing & Water Supply'),
(4, 'Kevin Mitnick (IT Support)', 'staff.it@fixit.com', '$2b$10$ZH00SDZcYmJ6BP89DRbQyudMHxHgVkBQectBt78kTb1y3jbzvTtwK', 'staff', '9876543213', 'Campus Network Operations'),
(5, 'Alice Student', 'student@fixit.com', '$2b$10$ZH00SDZcYmJ6BP89DRbQyudMHxHgVkBQectBt78kTb1y3jbzvTtwK', 'user', '9876543214', 'Computer Science Dept')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Sample Complaints
INSERT INTO complaints (id, complaint_code, user_id, title, description, category, location, priority, status) VALUES
(1, 'FIX-1001', 5, 'Projector flickering in Lab 3', 'The HDMI projector continuously flickers and shuts down after 5 minutes of usage.', 'Electrical', 'CS Block - Lab 3', 'High', 'Assigned'),
(2, 'FIX-1002', 5, 'Water tap leakage on 2nd Floor', 'Tap in the rest room wash basin is continuously dripping water and needs washer replacement.', 'Plumbing', 'Main Block - 2nd Floor Restroom', 'Medium', 'In Progress'),
(3, 'FIX-1003', 5, 'WiFi hotspot down in Library reading hall', 'Students unable to connect to Campus-WiFi-Zone2; shows authentication timeout.', 'Internet', 'Central Library - 1st Floor', 'High', 'Submitted'),
(4, 'FIX-1004', 5, 'Broken door latch in Seminar Hall', 'The main entrance latch is stuck and won\'t lock properly.', 'Other', 'Auditorium Block - Seminar Hall B', 'Low', 'Resolved')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Sample Assignments
INSERT INTO assignments (id, complaint_id, staff_id, assigned_by, notes) VALUES
(1, 1, 2, 1, 'Assigned to Robert Green for testing projector cable and power inverter.'),
(2, 2, 3, 1, 'Sarah Connor dispatched to replace washer valve.')
ON DUPLICATE KEY UPDATE notes=VALUES(notes);

-- Sample Complaint History
INSERT INTO complaint_history (complaint_id, updated_by, status, notes) VALUES
(1, 5, 'Submitted', 'Complaint submitted by Alice Student.'),
(1, 1, 'Assigned', 'Admin assigned complaint to Robert Green.'),
(2, 5, 'Submitted', 'Complaint submitted by Alice Student.'),
(2, 1, 'Assigned', 'Admin assigned complaint to Sarah Connor.'),
(2, 3, 'In Progress', 'Inspected tap, procuring replacement washer.'),
(4, 5, 'Submitted', 'Complaint registered.'),
(4, 1, 'Assigned', 'Assigned to maintenance crew.'),
(4, 1, 'Resolved', 'Door latch repaired and lubricated successfully.');
