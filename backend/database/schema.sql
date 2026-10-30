-- ====================================================================
-- Attend Pro - Smart Attendance & Automated Payroll Database Schema
-- Compatible with MySQL 8.0, MariaDB 10.4+, and TiDB Serverless
-- ====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Table: branches
DROP TABLE IF EXISTS `branches`;
CREATE TABLE `branches` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `radius_meters` INT NOT NULL DEFAULT 100,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'employee',
    `department` VARCHAR(255) NULL,
    `green_points` INT UNSIGNED NOT NULL DEFAULT 0,
    `red_points` INT UNSIGNED NOT NULL DEFAULT 0,
    `black_points` INT UNSIGNED NOT NULL DEFAULT 0,
    `early_green_credits` INT UNSIGNED NOT NULL DEFAULT 0,
    `consecutive_early_days` INT UNSIGNED NOT NULL DEFAULT 0,
    `financial_balance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `insta_pay_number` VARCHAR(255) NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: attendance_logs
DROP TABLE IF EXISTS `attendance_logs`;
CREATE TABLE `attendance_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `check_in_time` DATETIME NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `point_type` VARCHAR(50) NOT NULL DEFAULT 'green',
    `is_excused` TINYINT(1) NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_checkin` (`user_id`, `check_in_time`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: leave_requests
DROP TABLE IF EXISTS `leave_requests`;
CREATE TABLE `leave_requests` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `reason` TEXT NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_leaves` (`user_id`, `start_date`, `end_date`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table: points_ledgers
DROP TABLE IF EXISTS `points_ledgers`;
CREATE TABLE `points_ledgers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `transaction_type` VARCHAR(100) NOT NULL,
    `amount_deducted_or_rewarded` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `description` TEXT NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_ledger` (`user_id`, `created_at`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table: dispute_tickets
DROP TABLE IF EXISTS `dispute_tickets`;
CREATE TABLE `dispute_tickets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `ticket_code` VARCHAR(50) NOT NULL,
    `penalty_type` VARCHAR(50) NOT NULL,
    `incident_date` DATE NOT NULL,
    `reason` TEXT NOT NULL,
    `status` VARCHAR(30) DEFAULT 'pending',
    `admin_response` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_dispute_user` (`user_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table: system_settings
DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
    `setting_key` VARCHAR(100) PRIMARY KEY,
    `setting_value` TEXT NOT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Table: audit_logs
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `action` VARCHAR(255) NOT NULL,
    `details` TEXT NOT NULL,
    `performed_by` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- SEED INITIAL DATA
-- ====================================================================

-- Default Branches
INSERT INTO `branches` (`name`, `latitude`, `longitude`, `radius_meters`, `is_active`) VALUES 
('المقر الرئيسي - المعادي (HQ)', 30.044425, 31.235718, 200, 1),
('فرع الدقي والمهندسين', 30.038450, 31.211320, 150, 1);

-- Default System Settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`) VALUES 
('monthly_bonus_amount', '2500.00'),
('late_deduction_amount', '250.00'),
('absence_deduction_amount', '500.00');

-- Default Users (Password for all: password123)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `department`, `green_points`, `red_points`, `black_points`, `early_green_credits`, `consecutive_early_days`, `financial_balance`, `insta_pay_number`) VALUES 
(1, 'Eng. Ziad Mohamed (Owner)', 'owner@company.com', '$2y$10$doJHQvKYstnozg3t20Ag2OWghcF5ALKt5AdXrkk7hu3E5eciVpnKS', 'owner', 'Executive Management', 45, 0, 0, 10, 5, 0.00, 'ziad@instapay'),
(2, 'Eng. Ahmed Hassan', 'ahmed@company.com', '$2y$10$doJHQvKYstnozg3t20Ag2OWghcF5ALKt5AdXrkk7hu3E5eciVpnKS', 'employee', 'Software Engineering', 24, 0, 0, 3, 4, 2500.00, 'ahmed.hassan@instapay'),
(3, 'Sarah Mahmoud', 'sarah@company.com', '$2y$10$doJHQvKYstnozg3t20Ag2OWghcF5ALKt5AdXrkk7hu3E5eciVpnKS', 'employee', 'Product Design', 30, 0, 0, 5, 5, 5000.00, 'sarah.m@instapay'),
(4, 'Nourhan Tarek', 'nour@company.com', '$2y$10$doJHQvKYstnozg3t20Ag2OWghcF5ALKt5AdXrkk7hu3E5eciVpnKS', 'employee', 'DevOps & Cloud', 22, 0, 0, 4, 3, 2500.00, 'nour.tarek@instapay'),
(5, 'Tarek Abdelrahman', 'tarek@company.com', '$2y$10$doJHQvKYstnozg3t20Ag2OWghcF5ALKt5AdXrkk7hu3E5eciVpnKS', 'employee', 'Frontend Engineering', 18, 1, 0, 0, 0, 1250.00, 'tarek.dev@instapay'),
(6, 'Mariam Aly', 'mariam@company.com', '$2y$10$doJHQvKYstnozg3t20Ag2OWghcF5ALKt5AdXrkk7hu3E5eciVpnKS', 'employee', 'Human Resources', 28, 0, 0, 2, 5, 3750.00, 'mariam.aly@instapay');

-- Initial Ledgers & Audit Log
INSERT INTO `audit_logs` (`action`, `details`, `performed_by`) VALUES 
('DATABASE_INITIALIZED', 'Initial database schema and default policies loaded successfully.', 'System Migration');
