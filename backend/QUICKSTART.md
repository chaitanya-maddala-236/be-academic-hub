# API Quick Start Guide

This guide will help you get the API running in under 5 minutes.

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)

## Quick Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup PostgreSQL database**
   ```bash
   # Login to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE research_portal_db;
   
   # Exit psql
   \q
   
   # Run schema
   psql -U postgres -d research_portal_db -f database/schema.sql
   ```

4. **Configure environment**
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env and update these values:
   # DB_HOST=localhost
   # DB_PORT=5432
   # DB_USER=postgres
   # DB_PASSWORD=your_password
   # DB_NAME=research_portal_db
   # JWT_SECRET=your_random_secret_here
   ```

5. **Start the server**
   ```bash
   npm start
   ```

   Server will start on http://localhost:5000

## Test Your Setup

### 1. Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-17T..."
}
```

### 2. Login with Default Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.edu",
    "password": "admin123"
  }'
```

**⚠️ Important**: Change the admin password immediately in production!

### 3. Create Your First Faculty
```bash
# First, get your token from login response above
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/faculty \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Dr. Jane Smith",
    "designation": "Professor",
    "department": "Computer Science",
    "email": "jane.smith@university.edu"
  }'
```

## API Endpoints Overview

All endpoints are prefixed with `/api`

### Public Endpoints (No Auth Required)
- `GET /api/faculty` - List all faculty
- `GET /api/publications` - List publications
- `GET /api/patents` - List patents
- `GET /api/projects` - List projects
- `GET /api/labs` - List research labs
- `GET /api/ip-assets` - List IP assets

### Admin-Only Endpoints (Auth Required)
- `POST /api/*` - Create resources
- `PUT /api/*/:id` - Update resources
- `DELETE /api/*/:id` - Delete resources

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

## Common Filter Parameters

Most list endpoints support:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `department` - Filter by department
- `year` - Filter by year
- `search` - Search in title/name fields

Example:
```bash
curl "http://localhost:5000/api/publications?year=2024&department=Computer%20Science&page=1&limit=20"
```

## Response Format

All responses follow this standard format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {},
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## File Upload

For endpoints that support file upload (faculty profile images, lab images):

```bash
curl -X POST http://localhost:5000/api/faculty \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Dr. John Doe" \
  -F "email=john@university.edu" \
  -F "profile_image=@/path/to/image.jpg"
```

## Development Tips

1. **Use nodemon for auto-reload**
   ```bash
   npm run dev
   ```

2. **Check server logs** for debugging

3. **Test with tools like**:
   - Postman
   - Insomnia
   - curl
   - HTTPie

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `sudo service postgresql status`
- Verify credentials in `.env` file
- Check database exists: `psql -U postgres -l`

### Authentication Error
- Ensure JWT_SECRET is set in `.env`
- Token expires after 24h by default
- Check Authorization header format: `Bearer <token>`

### File Upload Error
- Check `uploads/` directory exists and is writable
- Maximum file size: 5MB
- Allowed types: jpeg, jpg, png, gif

## Next Steps

1. **Change default admin password**
2. **Add your faculty data**
3. **Import publications, patents, projects**
4. **Configure CORS for your frontend**
5. **Deploy to production**

## Need Help?

See the full README.md for detailed documentation on:
- Complete API reference
- Database schema details
- Security configuration
- Deployment guides
