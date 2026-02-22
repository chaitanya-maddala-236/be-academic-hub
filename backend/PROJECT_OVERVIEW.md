# University Research Management System - Project Overview

## 📋 Project Summary

A production-ready REST API backend for managing university research data including publications, patents, IP assets, funded projects, research labs, and faculty information. Built with Node.js, Express, PostgreSQL, and JWT authentication.

## 🏗️ Architecture

```
Client (Web/Mobile) → API Server (Express) → PostgreSQL Database
                           ↓
                   JWT Authentication
                   Role-based Access
                   File Upload (Multer)
```

## 📊 Database Schema

```
users (Authentication)
  ├── id, email, password, role, created_at
  
faculty (Faculty Members)
  ├── id, name, designation, department, specialization
  ├── bio, email, profile_image, created_at
  └── relationships:
      ├── publications (one-to-many)
      ├── patents (one-to-many)
      └── projects (by name match)

publications (Research Publications)
  ├── id, title, journal_name, publication_type
  ├── year, indexing, national_international
  └── faculty_id (FK → faculty.id)

patents (Patent Records)
  ├── id, title, patent_number, inventors
  ├── department, status, filing_date, grant_date
  ├── description
  └── faculty_id (FK → faculty.id)

ip_assets (IP Assets)
  ├── id, name, type, owner, department
  ├── filing_year, expiry_date, status
  └── commercialized (boolean)

funded_projects (Research Projects)
  ├── id, title, principal_investigator
  ├── department, funding_agency, sanctioned_amount
  ├── start_date, end_date, status (auto-calculated)
  └── created_at

research_labs (Research Laboratories)
  ├── id, name, department, head
  ├── description, focus_areas (array)
  ├── established_year, image_url
  └── created_at
```

## 🔌 API Endpoints Summary

### Base URL: `/api`

| Module | Endpoints | Public | Admin | Features |
|--------|-----------|--------|-------|----------|
| **Auth** | `/auth/register`, `/auth/login` | ✓ | ✓ | JWT, bcrypt |
| **Faculty** | `/faculty`, `/faculty/:id` | GET | CRUD | Filters, relationships, image upload |
| **Publications** | `/publications`, `/publications/:id` | GET | CRUD | 6 filters, pagination, search |
| **Patents** | `/patents`, `/patents/:id` | GET | CRUD | 4 filters, year extraction |
| **IP Assets** | `/ip-assets`, `/ip-assets/:id` | GET | CRUD | 4 filters, commercialization |
| **Projects** | `/projects`, `/projects/:id` | GET | CRUD | Auto-status, 4 filters |
| **Labs** | `/labs`, `/labs/:id` | GET | CRUD | Array fields, image upload |

## 🎯 Key Features

### 1. Auto-Status Calculation (Projects)
```javascript
Status = {
  'upcoming':  if start_date > today
  'ongoing':   if start_date <= today <= end_date
  'completed': if end_date < today
}
```

### 2. Faculty Relationships
```javascript
GET /api/faculty/1 returns:
{
  ...faculty_info,
  publications: [...],  // All linked publications
  patents: [...],       // All linked patents
  projects: [...]       // Projects by PI name match
}
```

### 3. Comprehensive Filtering
```
Publications:
  - year, publication_type, department
  - indexing, search (title), faculty_id
  - page, limit

Projects:
  - status (auto-calculated), department
  - funding_agency, year, page, limit

Patents:
  - status, year (from filing_date)
  - department, search, page, limit

IP Assets:
  - type, department, commercialized
  - year, page, limit

Labs:
  - department, research_area
  - page, limit

Faculty:
  - department, search (name)
  - sortByPublications, page, limit
```

### 4. File Upload Support
- Faculty profile images (5MB max, jpg/png/gif)
- Research lab images (5MB max, jpg/png/gif)
- Stored in `/uploads` directory
- Paths saved in database

### 5. Security Features
✅ Parameterized SQL queries (prevent injection)
✅ JWT authentication (24h expiry)
✅ Role-based access control (admin/faculty/public)
✅ Password hashing (bcrypt, 10 rounds)
✅ Input validation (express-validator)
✅ Global error handler (no raw errors)
✅ Environment variable protection
✅ CORS configuration

## 📦 Technology Stack

### Backend
- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **Database**: PostgreSQL (v12+)
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcrypt
- **File Upload**: Multer
- **Validation**: express-validator
- **Database Client**: pg (with connection pooling)

### Development
- **Package Manager**: npm
- **Module System**: CommonJS (require/module.exports)
- **Environment**: dotenv

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                     # PostgreSQL connection pool
├── controllers/
│   ├── auth.controller.js        # Register, login
│   ├── faculty.controller.js     # Faculty CRUD + relationships
│   ├── publications.controller.js # Publications CRUD + filters
│   ├── patents.controller.js     # Patents CRUD + filters
│   ├── ipAssets.controller.js    # IP Assets CRUD + filters
│   ├── projects.controller.js    # Projects CRUD + auto-status
│   └── labs.controller.js        # Labs CRUD + filters
├── routes/
│   ├── auth.routes.js            # Auth endpoints
│   ├── faculty.routes.js         # Faculty endpoints + multer
│   ├── publications.routes.js    # Publications endpoints
│   ├── patents.routes.js         # Patents endpoints
│   ├── ipAssets.routes.js        # IP Assets endpoints
│   ├── projects.routes.js        # Projects endpoints
│   └── labs.routes.js            # Labs endpoints + multer
├── middleware/
│   ├── auth.middleware.js        # JWT verification
│   ├── role.middleware.js        # Role authorization
│   └── error.middleware.js       # Global error handler
├── database/
│   └── schema.sql                # Complete DB schema
├── uploads/                      # File upload directory
├── server.js                     # Main application
├── package.json                  # Dependencies
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
├── README.md                     # Main documentation
├── QUICKSTART.md                 # 5-minute setup guide
├── API_EXAMPLES.md               # All API examples
└── DEPLOYMENT.md                 # Deployment guides
```

## 🚀 Quick Start

```bash
# 1. Setup
cd backend
npm install

# 2. Database
createdb research_portal_db
psql -d research_portal_db -f database/schema.sql

# 3. Configure
cp .env.example .env
# Edit .env with your database credentials

# 4. Run
npm start

# 5. Test
curl http://localhost:5000/health
```

## 🔐 Default Admin

```
Email: admin@university.edu
Password: admin123
```

⚠️ **Change immediately in production!**

## 📖 Documentation

1. **README.md** - Complete API reference, installation, features
2. **QUICKSTART.md** - Get started in 5 minutes
3. **API_EXAMPLES.md** - curl examples for all endpoints
4. **DEPLOYMENT.md** - Deploy to Render/Railway/AWS/Heroku

## 🧪 Testing

All endpoints have been tested:
- ✅ Authentication (login, register)
- ✅ All CRUD operations
- ✅ All filters and pagination
- ✅ File uploads
- ✅ Auto-status calculation
- ✅ Faculty relationships
- ✅ Role-based access control

## 📊 Response Format

All responses use standardized format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {} or [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## 🌐 Deployment

Ready for deployment on:
- ✅ Render (free PostgreSQL included)
- ✅ Railway (excellent DX)
- ✅ AWS (Elastic Beanstalk + RDS)
- ✅ Heroku (with PostgreSQL addon)

See `DEPLOYMENT.md` for detailed guides.

## 📈 Performance

- Connection pooling (max 20 connections)
- Database indexes on foreign keys and common filters
- Parameterized queries for optimization
- Efficient pagination implementation

## 🔒 Security Checklist

- [x] JWT authentication
- [x] Role-based authorization
- [x] Password hashing (bcrypt)
- [x] Parameterized SQL queries
- [x] Input validation
- [x] CORS configuration
- [x] Environment variables
- [x] Error handling (no data leaks)
- [x] File upload restrictions

## 🛠️ Maintenance

### Regular Tasks
- Monitor database size
- Check logs for errors
- Update dependencies
- Backup database
- Rotate JWT secret (if needed)

### Scaling Considerations
- Add Redis for caching
- Use CDN for uploaded files
- Increase database connection pool
- Add rate limiting
- Implement horizontal scaling

## 📝 Notes

### Special Features
1. **Projects Status**: Automatically calculated based on dates, no manual updates needed
2. **Faculty Relationships**: Single query returns all related data
3. **Array Fields**: Research labs use PostgreSQL arrays for focus_areas
4. **File Uploads**: Configured with size and type restrictions
5. **Pagination**: Consistent across all list endpoints

### Design Decisions
- CommonJS for maximum compatibility
- Parameterized queries for security
- Soft validation (COALESCE for updates)
- Standardized response format
- Modular controller/route structure

## 🤝 Support

For issues or questions:
1. Check documentation in `README.md`
2. Review examples in `API_EXAMPLES.md`
3. Check deployment guides in `DEPLOYMENT.md`
4. Review quick start in `QUICKSTART.md`

## 📄 License

ISC

## 👥 Contributors

Built following production-ready standards and best practices for Node.js/Express/PostgreSQL applications.

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-17  
**Status**: Production Ready ✅
