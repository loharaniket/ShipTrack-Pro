-- Database creation (Run these separately if the database doesn't exist)
CREATE DATABASE shiptrack;
-- \c shiptrack

-- Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL -- e.g., CUSTOMER, ADMIN, LOGISTICS_OPERATOR
);

-- Shipments Table
CREATE TABLE shipments (
    id BIGSERIAL PRIMARY KEY,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    sender_name VARCHAR(150) NOT NULL,
    receiver_name VARCHAR(150) NOT NULL,
    delivery_address TEXT NOT NULL,
    package_details TEXT,
    status VARCHAR(50) NOT NULL, -- e.g., CREATED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Admin User (Password is 'admin123' hashed with BCrypt. You can change this later)
-- Note: Replace with actual BCrypt hash if Spring Security requires it immediately
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2a$10$wY.uV7w/h7D7FhZ.s6J21O./V9P9fLhH8v1F/fD.jG/Y6vO3.nF6a', 'ADMIN');
