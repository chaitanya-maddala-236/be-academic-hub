# University Research Management System - Backend API

A production-ready REST API backend for managing university research data including publications, patents, IP assets, funded projects, research labs, and faculty information.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, Faculty, Public)
- **Faculty Management**: CRUD operations with profile image upload
- **Publications**: Complete publication management with filtering and pagination
- **Patents**: Patent tracking and management
- **IP Assets**: Intellectual property asset management
- **Funded Projects**: Project management with auto-calculated status (ongoing/completed/upcoming)
- **Research Labs**: Research laboratory information with image upload
- **File Upload**: Support for profile images and lab images
- **Filtering & Pagination**: Server-side filtering and pagination on all list endpoints
- **Relationships**: Faculty can be linked to publications, patents, and projects

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:
   ```
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

4. **Setup PostgreSQL Database**

   Create the database:
   ```bash
   psql -U postgres
   CREATE DATABASE research_portal_db;
   \q
   ```

   Run the schema file to create tables:
   ```bash
   psql -U postgres -d research_portal_db -f database/schema.sql
   ```

5. **Start the server**

   Development mode with auto-reload:
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@university.edu",
  "password": "password123",
  "role": "public"  // admin | faculty | public
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@university.edu",
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
      "email": "user@university.edu",
      "role": "public"
    }
  }
}
```

### Faculty Endpoints

- `GET /api/faculty` - Get all faculty (supports filters: department, search, sortByPublications, page, limit)
- `GET /api/faculty/:id` - Get single faculty with related publications, patents, and projects
- `POST /api/faculty` - Create faculty (Admin only, supports multipart/form-data for profile_image)
- `PUT /api/faculty/:id` - Update faculty (Admin/Faculty only)
- `DELETE /api/faculty/:id` - Delete faculty (Admin only)

### Publications Endpoints

- `GET /api/publications` - Get all publications (supports filters: year, publication_type, department, indexing, search, faculty_id, page, limit)
- `GET /api/publications/:id` - Get single publication
- `POST /api/publications` - Create publication (Admin only)
- `PUT /api/publications/:id` - Update publication (Admin only)
- `DELETE /api/publications/:id` - Delete publication (Admin only)

### Patents Endpoints

- `GET /api/patents` - Get all patents (supports filters: status, year, department, search, page, limit)
- `GET /api/patents/:id` - Get single patent
- `POST /api/patents` - Create patent (Admin only)
- `PUT /api/patents/:id` - Update patent (Admin only)
- `DELETE /api/patents/:id` - Delete patent (Admin only)

### IP Assets Endpoints

- `GET /api/ip-assets` - Get all IP assets (supports filters: type, department, commercialized, year, page, limit)
- `GET /api/ip-assets/:id` - Get single IP asset
- `POST /api/ip-assets` - Create IP asset (Admin only)
- `PUT /api/ip-assets/:id` - Update IP asset (Admin only)
- `DELETE /api/ip-assets/:id` - Delete IP asset (Admin only)

### Funded Projects Endpoints

- `GET /api/projects` - Get all projects (supports filters: status, department, funding_agency, year, page, limit)
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (Admin only)
- `PUT /api/projects/:id` - Update project (Admin only)
- `DELETE /api/projects/:id` - Delete project (Admin only)

**Note**: Project status (ongoing/completed/upcoming) is automatically calculated based on start_date and end_date.

### Research Labs Endpoints

- `GET /api/labs` - Get all labs (supports filters: department, research_area, page, limit)
- `GET /api/labs/:id` - Get single lab
- `POST /api/labs` - Create lab (Admin only, supports multipart/form-data for image)
- `PUT /api/labs/:id` - Update lab (Admin only)
- `DELETE /api/labs/:id` - Delete lab (Admin only)

### Authentication

Protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer your_jwt_token_here
```

### Standard Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control
- Parameterized SQL queries to prevent SQL injection
- Input validation with express-validator
- CORS configuration
- Global error handling
- Environment variable protection

## 🗄️ Database Schema

The database includes the following tables:
- `users` - User authentication
- `faculty` - Faculty information
- `publications` - Research publications
- `patents` - Patent records
- `ip_assets` - Intellectual property assets
- `funded_projects` - Funded research projects
- `research_labs` - Research laboratory information

See `database/schema.sql` for complete schema definition.

## 📦 Project Structure

```
backend/
├── config/
│   └── db.js                  # Database configuration
├── controllers/
│   ├── auth.controller.js     # Authentication logic
│   ├── faculty.controller.js  # Faculty operations
│   ├── publications.controller.js
│   ├── patents.controller.js
│   ├── ipAssets.controller.js
│   ├── projects.controller.js
│   └── labs.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── faculty.routes.js
│   ├── publications.routes.js
│   ├── patents.routes.js
│   ├── ipAssets.routes.js
│   ├── projects.routes.js
│   └── labs.routes.js
├── middleware/
│   ├── auth.middleware.js     # JWT verification
│   ├── role.middleware.js     # Role-based access
│   └── error.middleware.js    # Global error handler
├── database/
│   └── schema.sql             # Database schema
├── uploads/                   # File upload directory
├── server.js                  # Main application file
├── package.json
├── .env.example
└── README.md
```

## 🚀 Deployment

The API is ready for deployment on:
- Render
- Railway
- AWS
- Heroku
- DigitalOcean

### Environment Configuration

Make sure to set all environment variables in your deployment platform:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `PORT`
- `NODE_ENV`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`

### Database Setup on Production

Run the schema.sql file on your production PostgreSQL database to create all necessary tables and indexes.

## 🧪 Testing

Health check endpoint:
```bash
curl http://localhost:5000/health
```

## 📝 Default Admin Account

After running the schema, a default admin account is created:
- Email: `admin@university.edu`
- Password: `admin123`

**Important**: Change this password immediately after first login in production!

## 🤝 Support

For issues or questions, please create an issue in the repository.

## 📄 License

ISC
