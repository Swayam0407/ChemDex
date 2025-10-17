-- Migration: Create compounds table
-- Description: Creates the compounds table with id, name, image, description fields and timestamps
-- Requirements: 5.1, 5.2

CREATE DATABASE IF NOT EXISTS chemical_compounds;
USE chemical_compounds;

CREATE TABLE IF NOT EXISTS compounds (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_name_length CHECK (CHAR_LENGTH(name) >= 1 AND CHAR_LENGTH(name) <= 255),
    CONSTRAINT chk_image_length CHECK (CHAR_LENGTH(image) >= 1 AND CHAR_LENGTH(image) <= 500),
    CONSTRAINT chk_description_length CHECK (description IS NULL OR CHAR_LENGTH(description) <= 65535)
);

-- Create indexes for better query performance
CREATE INDEX idx_compounds_name ON compounds(name);
CREATE INDEX idx_compounds_created_at ON compounds(created_at);