# Academic Research Management System - Complete API Documentation

A comprehensive REST API backend for managing university research data including publications, patents, IPR, funded projects, research centers, consultancy, teaching materials, awards, student projects, and faculty information.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=research_portal_db
PORT=5000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
```

### Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE research_portal_db;"

# Run schema
psql -U postgres -d research_portal_db -f database/schema.sql
```

### Start Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Default Users

The system comes with three default users:

| Email | Password | Role |
|-------|----------|------|
| admin@vnrvjiet.ac.in | Admin@123 | admin |
| faculty@vnrvjiet.ac.in | Faculty@123 | faculty |
| student@vnrvjiet.ac.in | Student@123 | student |

## 👥 Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **admin** | Full CRUD on all resources |
| **faculty** | Read all, Create/Update own resources |
| **student** | Read-only access, limited submissions |
| **public** | Read-only public data |

## 📚 API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@vnrvjiet.ac.in",
  "password": "password123",
  "role": "student"  // admin | faculty | student | public
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@vnrvjiet.ac.in",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "email": "user@vnrvjiet.ac.in",
      "role": "student"
    }
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@vnrvjiet.ac.in",
    "role": "student",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logout successful. Please remove the token from client storage."
}
```

---

### Faculty Endpoints

#### List Faculty
```http
GET /api/faculty?department=CSE&page=1&limit=10

Query Parameters:
- department (optional): Filter by department
- search (optional): Search by name or email
- sortByPublications (optional): Sort by publication count
- page (default: 1): Page number
- limit (default: 10): Results per page
```

#### Get Faculty by ID
```http
GET /api/faculty/:id

Returns faculty with related publications, patents, and projects
```

#### Create Faculty (Admin only)
```http
POST /api/faculty
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "Dr. John Doe",
  "designation": "Professor",
  "department": "Computer Science",
  "specialization": "Machine Learning, AI",
  "bio": "Brief biography",
  "email": "john.doe@vnrvjiet.ac.in",
  "profile_image": <file>
}
```

#### Update Faculty
```http
PUT /api/faculty/:id
Authorization: Bearer <token>
```

#### Delete Faculty (Admin only)
```http
DELETE /api/faculty/:id
Authorization: Bearer <admin_token>
```

---

### Research Projects (Funded Projects)

#### List Projects
```http
GET /api/projects?status=ongoing&department=CSE&year=2024

Query Parameters:
- status: ongoing | completed | upcoming
- department: Filter by department
- funding_agency: Filter by funding agency
- year: Filter by start year
- page, limit: Pagination
```

#### Get Project by ID
```http
GET /api/projects/:id
```

#### Create Project (Admin only)
```http
POST /api/projects
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "AI Research Project",
  "principal_investigator": "Dr. John Doe",
  "co_principal_investigator": "Dr. Jane Smith",
  "department": "Computer Science",
  "funding_agency": "DST",
  "agency_scientist": "Dr. Agency Scientist",
  "file_number": "DST/2024/001",
  "sanctioned_amount": 5000000,
  "funds_per_year": {
    "2024": 1500000,
    "2025": 2000000,
    "2026": 1500000
  },
  "start_date": "2024-01-01",
  "end_date": "2026-12-31",
  "objectives": "Research objectives",
  "deliverables": "Expected deliverables",
  "outcomes": "Expected outcomes",
  "team": "Team members list",
  "pdf_url": "/uploads/projects/proposal.pdf"
}
```

#### Update Project (Admin only)
```http
PUT /api/projects/:id
Authorization: Bearer <admin_token>
```

#### Delete Project (Admin only)
```http
DELETE /api/projects/:id
Authorization: Bearer <admin_token>
```

---

### Publications

#### List Publications
```http
GET /api/publications?year=2024&type=journal&department=CSE

Query Parameters:
- year: Filter by publication year
- publication_type: journal | conference
- department: Filter by department
- indexing: Scopus | Web of Science | etc.
- search: Search in title
- faculty_id: Filter by faculty
- page, limit: Pagination
```

#### Get Publication by ID
```http
GET /api/publications/:id
```

#### Create Publication (Admin only)
```http
POST /api/publications
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Paper Title",
  "journal_name": "IEEE Transactions",
  "publication_type": "journal",
  "year": 2024,
  "indexing": "Scopus, Web of Science",
  "national_international": "international",
  "faculty_id": 1,
  "pdf_url": "/uploads/publications/paper.pdf"
}
```

---

### IPR (Intellectual Property Rights)

Endpoints available at both `/api/ipr` and `/api/ip-assets`

#### List IPR
```http
GET /api/ipr?type=patent&status=granted

Query Parameters:
- type: patent | copyright | trademark | design
- status: filed | published | granted | rejected | expired
- department: Filter by department
- commercialized: true | false
- year: Filter by filing year
- page, limit: Pagination
```

#### Get IPR by ID
```http
GET /api/ipr/:id
```

#### Create IPR (Admin only)
```http
POST /api/ipr
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Novel AI Algorithm",
  "type": "patent",
  "owner": "VNRVJIET",
  "inventors": "Dr. John Doe, Dr. Jane Smith",
  "department": "Computer Science",
  "filing_year": 2024,
  "filing_date": "2024-01-15",
  "published_date": "2024-06-15",
  "granted_date": "2024-12-15",
  "status": "granted",
  "application_number": "202441000001",
  "registration_number": "IN123456",
  "description": "Detailed description",
  "pdf_url": "/uploads/ipr/patent.pdf",
  "commercialized": false,
  "faculty_id": 1
}
```

---

### Research Centers

Endpoints available at both `/api/research-centers` and `/api/labs`

#### List Research Centers
```http
GET /api/research-centers?department=CSE

Query Parameters:
- department: Filter by department
- research_area: Filter by research area
- page, limit: Pagination
```

#### Create Research Center (Admin only)
```http
POST /api/research-centers
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "Center for AI Research",
  "department": "Computer Science",
  "head": "Dr. John Doe",
  "description": "Center description",
  "focus_areas": ["Machine Learning", "Deep Learning", "NLP"],
  "established_year": 2020,
  "image": <file>
}
```

---

### Consultancy

#### List Consultancy
```http
GET /api/consultancy?department=CSE&status=ongoing

Query Parameters:
- department: Filter by department
- status: ongoing | completed | cancelled
- faculty_id: Filter by faculty
- year: Filter by start year
- page, limit: Pagination
```

#### Get Consultancy by ID
```http
GET /api/consultancy/:id
```

#### Create Consultancy (Admin/Faculty)
```http
POST /api/consultancy
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Industrial Consultancy Project",
  "faculty_id": 1,
  "client_name": "ABC Corporation",
  "department": "Computer Science",
  "amount_earned": 500000,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "description": "Project description",
  "status": "ongoing"
}
```

---

### Teaching Materials

#### List Teaching Materials
```http
GET /api/materials?faculty_id=1&department=CSE

Query Parameters:
- faculty_id: Filter by faculty
- department: Filter by department
- course_name: Filter by course
- material_type: ppt | pdf | video | document | other
- page, limit: Pagination
```

#### Create Teaching Material (Faculty/Admin)
```http
POST /api/materials
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Introduction to Machine Learning",
  "faculty_id": 1,
  "department": "Computer Science",
  "course_name": "CS501",
  "material_type": "pdf",
  "file": <file>,
  "video_link": "https://youtube.com/...",
  "description": "Course material description"
}
```

#### Delete Material (Faculty/Admin)
```http
DELETE /api/materials/:id
Authorization: Bearer <token>
```

---

### Awards & Recognitions

#### List Awards
```http
GET /api/awards?faculty_id=1&year=2024

Query Parameters:
- faculty_id: Filter by faculty
- year: Filter by year
- award_type: Filter by award type
- page, limit: Pagination
```

#### Create Award (Admin/Faculty)
```http
POST /api/awards
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Best Researcher Award",
  "faculty_id": 1,
  "award_type": "National Award",
  "awarded_by": "IEEE",
  "year": 2024,
  "date_received": "2024-06-15",
  "description": "Award description",
  "certificate_url": "/uploads/awards/certificate.pdf"
}
```

---

### Student Projects (Academic Projects)

#### List Student Projects
```http
GET /api/student-projects?project_type=UG&department=CSE

Query Parameters:
- faculty_id: Filter by faculty guide
- department: Filter by department
- project_type: UG | PG | PhD
- academic_year: Filter by academic year
- page, limit: Pagination
```

#### Create Student Project (Faculty/Admin)
```http
POST /api/student-projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "IoT Based Smart Home System",
  "faculty_id": 1,
  "student_names": "Student1, Student2, Student3",
  "department": "Computer Science",
  "project_type": "UG",
  "academic_year": "2023-24",
  "abstract": "Project abstract",
  "pdf_url": "/uploads/projects/report.pdf"
}
```

---

## 📊 Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Optional success message",
  "data": {},
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Parameterized SQL queries (SQL injection prevention)
- Input validation with express-validator
- CORS configuration
- Environment variable protection
- Global error handling

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                          # Database configuration
├── controllers/
│   ├── auth.controller.js             # Authentication logic
│   ├── faculty.controller.js          # Faculty operations
│   ├── publications.controller.js     # Publications CRUD
│   ├── patents.controller.js          # Patents CRUD
│   ├── ipAssets.controller.js         # IPR CRUD
│   ├── projects.controller.js         # Funded projects CRUD
│   ├── labs.controller.js             # Research centers CRUD
│   ├── consultancy.controller.js      # Consultancy CRUD
│   ├── materials.controller.js        # Teaching materials CRUD
│   ├── awards.controller.js           # Awards CRUD
│   └── studentProjects.controller.js  # Student projects CRUD
├── routes/
│   ├── auth.routes.js                 # Auth routes
│   ├── faculty.routes.js              # Faculty routes
│   ├── publications.routes.js         # Publications routes
│   ├── patents.routes.js              # Patents routes
│   ├── ipAssets.routes.js             # IPR routes
│   ├── projects.routes.js             # Projects routes
│   ├── labs.routes.js                 # Research centers routes
│   ├── consultancy.routes.js          # Consultancy routes
│   ├── materials.routes.js            # Teaching materials routes
│   ├── awards.routes.js               # Awards routes
│   └── studentProjects.routes.js      # Student projects routes
├── middleware/
│   ├── auth.middleware.js             # JWT verification
│   ├── role.middleware.js             # Role-based access
│   └── error.middleware.js            # Global error handler
├── database/
│   └── schema.sql                     # Database schema
├── uploads/                           # File upload directory
│   └── materials/                     # Teaching materials uploads
├── server.js                          # Main application file
├── package.json
├── .env.example
└── README.md
```

## 🗄️ Database Tables

- `users` - User authentication and roles
- `faculty` - Faculty profiles and information
- `publications` - Research publications
- `patents` - Patent records (legacy, use ip_assets)
- `ip_assets` - Comprehensive IPR management
- `funded_projects` - Research projects with funding
- `research_labs` - Research centers/labs
- `consultancy` - Consultancy projects
- `teaching_materials` - Course materials
- `awards` - Awards and recognitions
- `student_projects` - UG/PG/PhD student projects

## 🚀 Deployment

Ready for deployment on:
- Render
- Railway
- AWS
- Heroku
- DigitalOcean

### Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure production database
- [ ] Set proper CORS_ORIGIN
- [ ] Change default admin password
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure file storage (S3/local)
- [ ] Set up monitoring and logging

## 📞 Support

For issues or questions, please create an issue in the repository.

## 📄 License

ISC
