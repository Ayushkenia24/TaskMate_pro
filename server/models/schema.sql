-- Create Database
CREATE DATABASE IF NOT EXISTS taskmate_pro;
USE taskmate_pro;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    task_name VARCHAR(200) NOT NULL,
    description TEXT,
    task_date DATE NOT NULL,
    task_time TIME NOT NULL,
    status ENUM('pending', 'done', 'late') DEFAULT 'pending',
    alert_count TINYINT DEFAULT 0,
    first_alert_sent_at TIMESTAMP NULL,
    second_alert_sent_at TIMESTAMP NULL,
    third_alert_sent_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, task_date),
    INDEX idx_status (status),
    INDEX idx_alert_count (alert_count, status),
    INDEX idx_task_time (task_date, task_time)
);

-- Sample Data for Testing
INSERT INTO users (name, email, phone, password) VALUES 
('Demo User', 'demo@taskmate.com', '+1234567890', '$2a$10$YourHashedPasswordHere');

-- Sample tasks (with user_id = 1)
INSERT INTO tasks (user_id, task_name, description, task_date, task_time, status) VALUES
(1, 'Morning Workout', 'Hit the gym for 30 minutes', CURDATE(), '07:00:00', 'pending'),
(1, 'Team Meeting', 'Discuss project roadmap', CURDATE(), '10:00:00', 'pending'),
(1, 'Lunch Break', 'Enjoy a healthy meal', CURDATE(), '13:00:00', 'pending');