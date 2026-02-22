# API Testing Examples

This file contains example API calls for testing all endpoints.

## Authentication

### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@university.edu",
    "password": "password123",
    "role": "public"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.edu",
    "password": "admin123"
  }'
```

Save the token from the response for authenticated requests:
```bash
TOKEN="your_jwt_token_here"
```

## Faculty Endpoints

### List All Faculty
```bash
curl http://localhost:5000/api/faculty
```

### List Faculty with Filters
```bash
# Filter by department
curl "http://localhost:5000/api/faculty?department=Computer%20Science"

# Search by name
curl "http://localhost:5000/api/faculty?search=john"

# Sort by publications count
curl "http://localhost:5000/api/faculty?sortByPublications=true"

# Pagination
curl "http://localhost:5000/api/faculty?page=2&limit=5"
```

### Get Single Faculty with Relationships
```bash
curl http://localhost:5000/api/faculty/1
```

### Create Faculty (Admin only)
```bash
curl -X POST http://localhost:5000/api/faculty \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Dr. Jane Smith",
    "designation": "Associate Professor",
    "department": "Computer Science",
    "specialization": "Machine Learning",
    "bio": "Expert in ML and AI",
    "email": "jane.smith@university.edu"
  }'
```

### Create Faculty with Image Upload
```bash
curl -X POST http://localhost:5000/api/faculty \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=Dr. John Doe" \
  -F "designation=Professor" \
  -F "department=Computer Science" \
  -F "email=john.doe@university.edu" \
  -F "profile_image=@/path/to/image.jpg"
```

### Update Faculty
```bash
curl -X PUT http://localhost:5000/api/faculty/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "designation": "Professor",
    "bio": "Updated bio information"
  }'
```

### Delete Faculty
```bash
curl -X DELETE http://localhost:5000/api/faculty/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Publications Endpoints

### List All Publications
```bash
curl http://localhost:5000/api/publications
```

### List Publications with Filters
```bash
# Filter by year
curl "http://localhost:5000/api/publications?year=2024"

# Filter by type
curl "http://localhost:5000/api/publications?publication_type=journal"

# Filter by department
curl "http://localhost:5000/api/publications?department=Computer%20Science"

# Filter by indexing
curl "http://localhost:5000/api/publications?indexing=SCI"

# Search by title
curl "http://localhost:5000/api/publications?search=machine%20learning"

# Filter by faculty
curl "http://localhost:5000/api/publications?faculty_id=1"

# Multiple filters with pagination
curl "http://localhost:5000/api/publications?year=2024&publication_type=journal&page=1&limit=10"
```

### Get Single Publication
```bash
curl http://localhost:5000/api/publications/1
```

### Create Publication
```bash
curl -X POST http://localhost:5000/api/publications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Deep Learning in Healthcare",
    "journal_name": "IEEE Transactions on AI",
    "publication_type": "journal",
    "year": 2024,
    "indexing": "SCI",
    "national_international": "international",
    "faculty_id": 1
  }'
```

### Update Publication
```bash
curl -X PUT http://localhost:5000/api/publications/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "year": 2025,
    "indexing": "Scopus"
  }'
```

### Delete Publication
```bash
curl -X DELETE http://localhost:5000/api/publications/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Patents Endpoints

### List All Patents
```bash
curl http://localhost:5000/api/patents
```

### List Patents with Filters
```bash
# Filter by status
curl "http://localhost:5000/api/patents?status=granted"

# Filter by year
curl "http://localhost:5000/api/patents?year=2023"

# Filter by department
curl "http://localhost:5000/api/patents?department=Computer%20Science"

# Search by title
curl "http://localhost:5000/api/patents?search=AI"
```

### Get Single Patent
```bash
curl http://localhost:5000/api/patents/1
```

### Create Patent
```bash
curl -X POST http://localhost:5000/api/patents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "AI-based Disease Prediction System",
    "patent_number": "US12345678",
    "inventors": "Dr. John Smith, Dr. Jane Doe",
    "department": "Computer Science",
    "status": "granted",
    "filing_date": "2023-01-15",
    "grant_date": "2024-06-20",
    "description": "An innovative system for predicting diseases using AI",
    "faculty_id": 1
  }'
```

### Update Patent
```bash
curl -X PUT http://localhost:5000/api/patents/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "granted",
    "grant_date": "2024-07-01"
  }'
```

### Delete Patent
```bash
curl -X DELETE http://localhost:5000/api/patents/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Funded Projects Endpoints

### List All Projects
```bash
curl http://localhost:5000/api/projects
```

### List Projects with Filters
```bash
# Filter by status (ongoing/completed/upcoming)
curl "http://localhost:5000/api/projects?status=ongoing"

# Filter by department
curl "http://localhost:5000/api/projects?department=Computer%20Science"

# Filter by funding agency
curl "http://localhost:5000/api/projects?funding_agency=NSF"

# Filter by year
curl "http://localhost:5000/api/projects?year=2024"
```

### Get Single Project
```bash
curl http://localhost:5000/api/projects/1
```

### Create Project (Status auto-calculated)
```bash
# Ongoing project (start_date < today < end_date)
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "AI in Education",
    "principal_investigator": "Dr. John Smith",
    "department": "Computer Science",
    "funding_agency": "NSF",
    "sanctioned_amount": 500000,
    "start_date": "2025-01-01",
    "end_date": "2027-12-31"
  }'

# Completed project (end_date < today)
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Past Research",
    "principal_investigator": "Dr. Jane Doe",
    "department": "Computer Science",
    "funding_agency": "DARPA",
    "sanctioned_amount": 750000,
    "start_date": "2020-01-01",
    "end_date": "2023-12-31"
  }'

# Upcoming project (start_date > today)
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Future Initiative",
    "principal_investigator": "Dr. Alice Johnson",
    "department": "Computer Science",
    "funding_agency": "DOE",
    "sanctioned_amount": 1000000,
    "start_date": "2027-01-01",
    "end_date": "2030-12-31"
  }'
```

### Update Project
```bash
curl -X PUT http://localhost:5000/api/projects/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sanctioned_amount": 550000,
    "end_date": "2028-12-31"
  }'
```

### Delete Project
```bash
curl -X DELETE http://localhost:5000/api/projects/1 \
  -H "Authorization: Bearer $TOKEN"
```

## IP Assets Endpoints

### List All IP Assets
```bash
curl http://localhost:5000/api/ip-assets
```

### List IP Assets with Filters
```bash
# Filter by type
curl "http://localhost:5000/api/ip-assets?type=patent"

# Filter by department
curl "http://localhost:5000/api/ip-assets?department=Computer%20Science"

# Filter by commercialized status
curl "http://localhost:5000/api/ip-assets?commercialized=true"

# Filter by year
curl "http://localhost:5000/api/ip-assets?year=2023"
```

### Get Single IP Asset
```bash
curl http://localhost:5000/api/ip-assets/1
```

### Create IP Asset
```bash
curl -X POST http://localhost:5000/api/ip-assets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Smart Healthcare Platform",
    "type": "patent",
    "owner": "University Research Foundation",
    "department": "Computer Science",
    "filing_year": 2023,
    "expiry_date": "2043-12-31",
    "status": "active",
    "commercialized": true
  }'
```

### Update IP Asset
```bash
curl -X PUT http://localhost:5000/api/ip-assets/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "commercialized": true,
    "status": "active"
  }'
```

### Delete IP Asset
```bash
curl -X DELETE http://localhost:5000/api/ip-assets/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Research Labs Endpoints

### List All Labs
```bash
curl http://localhost:5000/api/labs
```

### List Labs with Filters
```bash
# Filter by department
curl "http://localhost:5000/api/labs?department=Computer%20Science"

# Filter by research area
curl "http://localhost:5000/api/labs?research_area=AI"
```

### Get Single Lab
```bash
curl http://localhost:5000/api/labs/1
```

### Create Lab
```bash
curl -X POST http://localhost:5000/api/labs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Artificial Intelligence Research Lab",
    "department": "Computer Science",
    "head": "Dr. John Smith",
    "description": "Advanced research in artificial intelligence and machine learning",
    "focus_areas": ["AI", "Machine Learning", "Deep Learning", "Computer Vision"],
    "established_year": 2020
  }'
```

### Create Lab with Image Upload
```bash
curl -X POST http://localhost:5000/api/labs \
  -H "Authorization: Bearer $TOKEN" \
  -F "name=AI Research Lab" \
  -F "department=Computer Science" \
  -F "head=Dr. John Smith" \
  -F "description=Advanced AI research" \
  -F "focus_areas[]=AI" \
  -F "focus_areas[]=ML" \
  -F "established_year=2020" \
  -F "image=@/path/to/lab-image.jpg"
```

### Update Lab
```bash
curl -X PUT http://localhost:5000/api/labs/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "head": "Dr. Jane Doe",
    "focus_areas": ["AI", "ML", "NLP", "Computer Vision"]
  }'
```

### Delete Lab
```bash
curl -X DELETE http://localhost:5000/api/labs/1 \
  -H "Authorization: Bearer $TOKEN"
```

## Bulk Testing Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

# Login and get token
echo "Logging in..."
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@university.edu", "password": "admin123"}' | jq -r '.data.token')

echo "Token: ${TOKEN:0:50}..."

# Test all endpoints
echo -e "\nTesting Faculty..."
curl -s "$BASE_URL/api/faculty" | jq '.pagination'

echo -e "\nTesting Publications..."
curl -s "$BASE_URL/api/publications" | jq '.pagination'

echo -e "\nTesting Patents..."
curl -s "$BASE_URL/api/patents" | jq '.pagination'

echo -e "\nTesting Projects..."
curl -s "$BASE_URL/api/projects" | jq '.pagination'

echo -e "\nTesting Labs..."
curl -s "$BASE_URL/api/labs" | jq '.pagination'

echo -e "\nTesting IP Assets..."
curl -s "$BASE_URL/api/ip-assets" | jq '.pagination'

echo -e "\n✓ All endpoints tested!"
```

Run with:
```bash
chmod +x test-api.sh
./test-api.sh
```
