-- Gym ERP System Database Schema
-- Run this script against your MySQL server to create tables and sample data.

CREATE DATABASE IF NOT EXISTS gym_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gym_erp;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  duration_days INT NOT NULL DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(50) NOT NULL,
  joining_date DATE NOT NULL,
  end_date DATE NOT NULL,
  package_id INT DEFAULT NULL,
  cash_payment DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  online_payment DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  remaining_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  whatsapp_added ENUM('yes','no') NOT NULL DEFAULT 'no',
  join_message_status ENUM('pending','sent') NOT NULL DEFAULT 'pending',
  renewal_message_status ENUM('pending','sent') NOT NULL DEFAULT 'pending',
  photo VARCHAR(512) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  type ENUM('cash','online') NOT NULL DEFAULT 'cash',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS renewals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  old_end_date DATE NOT NULL,
  new_end_date DATE NOT NULL,
  renewal_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO admins (email, password) VALUES ('admin@gymerp.com', '$2y$10$Kx4KvQ6Y86nHmM37QvS7peno1mJHVQwSuvhJpqMnwNpm03MS5stoG');

INSERT IGNORE INTO packages (name, price, duration_days) VALUES
  ('Silver Plan', 35.00, 30),
  ('Gold Plan', 55.00, 60),
  ('Platinum Plan', 80.00, 90);

INSERT IGNORE INTO members (full_name, mobile_number, joining_date, end_date, package_id, cash_payment, online_payment, remaining_amount, whatsapp_added, join_message_status, renewal_message_status)
VALUES
  ('Samuel Carter', '555-0147', '2026-03-20', '2026-04-19', 1, 35.00, 0.00, 0.00, 'yes', 'sent', 'pending'),
  ('Mia Johnson', '555-0199', '2026-03-10', '2026-05-09', 2, 30.00, 25.00, 0.00, 'yes', 'sent', 'sent');

INSERT IGNORE INTO payments (member_id, amount, type) VALUES
  (1, 35.00, 'cash'),
  (2, 55.00, 'online');
