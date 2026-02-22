-- Create database (run this separately)
-- CREATE DATABASE research_portal_db;

-- Connect to the database
-- \c research_portal_db;

-- Drop tables if exist (for fresh install)
DROP TABLE IF EXISTS teaching_materials CASCADE;
DROP TABLE IF EXISTS awards CASCADE;
DROP TABLE IF EXISTS student_projects CASCADE;
DROP TABLE IF EXISTS consultancy CASCADE;
DROP TABLE IF EXISTS publications CASCADE;
DROP TABLE IF EXISTS patents CASCADE;
DROP TABLE IF EXISTS ip_assets CASCADE;
DROP TABLE IF EXISTS funded_projects CASCADE;
DROP TABLE IF EXISTS research_labs CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (for authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'faculty', 'student', 'public')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Faculty table
CREATE TABLE faculty (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    designation VARCHAR(100),
    department VARCHAR(100),
    specialization TEXT,
    bio TEXT,
    email VARCHAR(100) UNIQUE,
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Publications table
CREATE TABLE publications (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    journal_name TEXT,
    publication_type VARCHAR(20) CHECK (publication_type IN ('journal', 'conference')),
    year INT,
    indexing VARCHAR(50),
    national_international VARCHAR(20) CHECK (national_international IN ('national', 'international')),
    faculty_id INT REFERENCES faculty(id) ON DELETE CASCADE,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Patents table
CREATE TABLE patents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    patent_number VARCHAR(100),
    inventors TEXT,
    department VARCHAR(100),
    status VARCHAR(50),
    filing_date DATE,
    grant_date DATE,
    description TEXT,
    faculty_id INT REFERENCES faculty(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- IP Assets table (IPR - Patents, Trademarks, Copyrights)
CREATE TABLE ip_assets (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('patent', 'copyright', 'trademark', 'design')),
    owner VARCHAR(100),
    inventors TEXT,
    department VARCHAR(100),
    filing_year INT,
    filing_date DATE,
    published_date DATE,
    granted_date DATE,
    expiry_date DATE,
    status VARCHAR(50) CHECK (status IN ('filed', 'published', 'granted', 'rejected', 'expired')),
    application_number VARCHAR(100),
    registration_number VARCHAR(100),
    description TEXT,
    pdf_url TEXT,
    commercialized BOOLEAN DEFAULT false,
    faculty_id INT REFERENCES faculty(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Funded Projects table (Research Projects)
CREATE TABLE funded_projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    principal_investigator VARCHAR(100),
    co_principal_investigator VARCHAR(100),
    department VARCHAR(100),
    funding_agency VARCHAR(100),
    agency_scientist VARCHAR(100),
    file_number VARCHAR(100),
    sanctioned_amount NUMERIC,
    funds_per_year JSONB,
    start_date DATE,
    end_date DATE,
    objectives TEXT,
    deliverables TEXT,
    outcomes TEXT,
    team TEXT,
    status VARCHAR(50),
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Research Labs table (Research Centers)
CREATE TABLE research_labs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    department VARCHAR(100),
    head VARCHAR(100),
    description TEXT,
    focus_areas TEXT[],
    established_year INT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Consultancy table
CREATE TABLE consultancy (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    faculty_id INT REFERENCES faculty(id),
    client_name VARCHAR(200),
    department VARCHAR(100),
    amount_earned NUMERIC,
    start_date DATE,
    end_date DATE,
    description TEXT,
    status VARCHAR(50) CHECK (status IN ('ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Teaching Materials table
CREATE TABLE teaching_materials (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    faculty_id INT REFERENCES faculty(id) ON DELETE CASCADE,
    department VARCHAR(100),
    course_name VARCHAR(100),
    material_type VARCHAR(50) CHECK (material_type IN ('ppt', 'pdf', 'video', 'document', 'other')),
    file_url TEXT,
    video_link TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Awards table
CREATE TABLE awards (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    faculty_id INT REFERENCES faculty(id),
    award_type VARCHAR(100),
    awarded_by VARCHAR(200),
    year INT,
    date_received DATE,
    description TEXT,
    certificate_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Student Projects table (Academic Projects - UG/PG)
CREATE TABLE student_projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    faculty_id INT REFERENCES faculty(id),
    student_names TEXT,
    department VARCHAR(100),
    project_type VARCHAR(50) CHECK (project_type IN ('UG', 'PG', 'PhD')),
    academic_year VARCHAR(20),
    abstract TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_publications_faculty ON publications(faculty_id);
CREATE INDEX idx_publications_year ON publications(year);
CREATE INDEX idx_publications_type ON publications(publication_type);
CREATE INDEX idx_patents_faculty ON patents(faculty_id);
CREATE INDEX idx_patents_status ON patents(status);
CREATE INDEX idx_patents_filing_date ON patents(filing_date);
CREATE INDEX idx_ip_assets_type ON ip_assets(type);
CREATE INDEX idx_ip_assets_status ON ip_assets(status);
CREATE INDEX idx_ip_assets_faculty ON ip_assets(faculty_id);
CREATE INDEX idx_projects_status ON funded_projects(status);
CREATE INDEX idx_projects_department ON funded_projects(department);
CREATE INDEX idx_faculty_department ON faculty(department);
CREATE INDEX idx_labs_department ON research_labs(department);
CREATE INDEX idx_consultancy_faculty ON consultancy(faculty_id);
CREATE INDEX idx_consultancy_status ON consultancy(status);
CREATE INDEX idx_teaching_materials_faculty ON teaching_materials(faculty_id);
CREATE INDEX idx_awards_faculty ON awards(faculty_id);
CREATE INDEX idx_awards_year ON awards(year);
CREATE INDEX idx_student_projects_faculty ON student_projects(faculty_id);
CREATE INDEX idx_student_projects_type ON student_projects(project_type);

-- Insert default users with pre-generated password hashes
-- Password hashes were generated using bcrypt with 10 salt rounds
-- Default test accounts:
--   admin@vnrvjiet.ac.in  (role: admin, password: Admin@123)
--   faculty@vnrvjiet.ac.in (role: faculty, password: Faculty@123)
--   student@vnrvjiet.ac.in (role: student, password: Student@123)
INSERT INTO users (email, password, role) VALUES 
('admin@vnrvjiet.ac.in', '$2b$10$uu/bnZ/9Che/nNjiflbjQeYPJCP0/wDlaOIZg38vx87DxFkX8xeA.', 'admin'),
('faculty@vnrvjiet.ac.in', '$2b$10$lJ1Jrh5PvSkBdQuex1vVWu3grRqT4p2Scw4VwK5NJlRGIi8lWVzVa', 'faculty'),
('student@vnrvjiet.ac.in', '$2b$10$FRZ2llgu6ZzfZHlT8BsUL.Vr/SieChc1tQfFyMOPksK.P8K5yrZaC', 'student');
