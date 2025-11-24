-- Create database
CREATE DATABASE IF NOT EXISTS vpn_management;
USE vpn_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role ENUM('admin', 'reseller', 'user') NOT NULL DEFAULT 'user',
    status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
    expires_at TIMESTAMP NULL,
    reseller_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reseller_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX(role),
    INDEX(status),
    INDEX(expires_at),
    INDEX(reseller_id)
);

-- Resellers table (for quota management)
CREATE TABLE IF NOT EXISTS resellers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    user_quota INT NOT NULL DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- VPN Packages table
CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    days INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(100),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX(user_id),
    INDEX(created_at)
);

-- Insert default packages
INSERT INTO packages (name, days, price, description) VALUES
('1 Month', 30, 2.99, '1 month VPN access'),
('3 Months', 90, 7.99, '3 months VPN access'),
('6 Months', 180, 14.99, '6 months VPN access'),
('12 Months', 365, 27.99, '12 months VPN access');

-- Create sample admin user (username: 123456, password: 654321)
INSERT INTO users (username, password, email, role, status, expires_at) VALUES
('123456', '654321', 'admin@vpn.local', 'admin', 'active', '2099-12-31 00:00:00');
