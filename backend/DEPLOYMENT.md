# Deployment Guide

This guide covers deploying the API to various cloud platforms.

## Table of Contents
1. [General Preparation](#general-preparation)
2. [Deploy to Render](#deploy-to-render)
3. [Deploy to Railway](#deploy-to-railway)
4. [Deploy to AWS](#deploy-to-aws)
5. [Deploy to Heroku](#deploy-to-heroku)
6. [Post-Deployment](#post-deployment)

## General Preparation

Before deploying to any platform, ensure:

1. **Code is committed to Git**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Environment variables are documented**
   - Review `.env.example`
   - Prepare values for production

3. **Database is ready**
   - PostgreSQL instance available
   - Schema can be applied
   - Connection details ready

## Deploy to Render

Render offers free PostgreSQL and web service hosting.

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - Name: `research-portal-db`
   - Plan: Free
   - Region: Choose nearest
4. Click "Create Database"
5. Save connection details (shown on database page)

### Step 2: Apply Database Schema

```bash
# Get database URL from Render dashboard
# It looks like: postgresql://user:pass@host/dbname

# Apply schema
psql "postgresql://user:pass@host/dbname" -f backend/database/schema.sql
```

### Step 3: Deploy Web Service

1. Click "New +" → "Web Service"
2. Connect your Git repository
3. Configure:
   - Name: `research-portal-api`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free

4. Add Environment Variables:
   ```
   DB_HOST=<from database connection>
   DB_PORT=5432
   DB_USER=<from database connection>
   DB_PASSWORD=<from database connection>
   DB_NAME=<from database connection>
   NODE_ENV=production
   JWT_SECRET=<generate strong random string>
   JWT_EXPIRES_IN=24h
   PORT=5000
   ```

5. Click "Create Web Service"

### Step 4: Verify Deployment

```bash
curl https://your-app.onrender.com/health
```

## Deploy to Railway

Railway provides excellent developer experience with automatic deploys.

### Step 1: Install Railway CLI (Optional)

```bash
npm install -g @railway/cli
railway login
```

### Step 2: Create New Project

**Option A: Using Dashboard**
1. Go to [Railway Dashboard](https://railway.app/)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Add PostgreSQL database from Railway marketplace

**Option B: Using CLI**
```bash
cd backend
railway init
railway add postgresql
```

### Step 3: Configure Environment

Add environment variables in Railway dashboard or via CLI:

```bash
railway variables set DB_HOST=${{POSTGRES.PGHOST}}
railway variables set DB_PORT=${{POSTGRES.PGPORT}}
railway variables set DB_USER=${{POSTGRES.PGUSER}}
railway variables set DB_PASSWORD=${{POSTGRES.PGPASSWORD}}
railway variables set DB_NAME=${{POSTGRES.PGDATABASE}}
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_secret_here
railway variables set JWT_EXPIRES_IN=24h
railway variables set PORT=5000
```

### Step 4: Apply Schema

```bash
# Using Railway CLI
railway run psql -f database/schema.sql
```

### Step 5: Deploy

```bash
railway up
```

## Deploy to AWS

AWS deployment using Elastic Beanstalk and RDS.

### Step 1: Create RDS PostgreSQL Instance

1. Go to AWS RDS Console
2. Click "Create database"
3. Choose:
   - Engine: PostgreSQL
   - Template: Free tier (for testing)
   - DB instance identifier: `research-portal-db`
   - Master username: `postgres`
   - Master password: <set strong password>
4. Configure:
   - Public access: Yes (for initial setup)
   - VPC security group: Create new
5. Create database

### Step 2: Apply Database Schema

```bash
# Get endpoint from RDS console
psql -h your-db.rds.amazonaws.com -U postgres -d postgres -f backend/database/schema.sql
```

### Step 3: Prepare Application

Create `.ebextensions/environment.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 8080
```

Create `.npmrc` in backend directory:
```
engine-strict=false
```

### Step 4: Deploy to Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
cd backend
eb init -p node.js research-portal-api --region us-east-1

# Create environment
eb create research-portal-env

# Set environment variables
eb setenv \
  DB_HOST=your-db.rds.amazonaws.com \
  DB_PORT=5432 \
  DB_USER=postgres \
  DB_PASSWORD=your_password \
  DB_NAME=research_portal_db \
  JWT_SECRET=your_secret_here \
  JWT_EXPIRES_IN=24h

# Deploy
eb deploy
```

### Step 5: Open Application

```bash
eb open
```

## Deploy to Heroku

### Step 1: Install Heroku CLI

```bash
# macOS
brew install heroku/brew/heroku

# Ubuntu
curl https://cli-assets.heroku.com/install.sh | sh
```

### Step 2: Create Heroku App

```bash
cd backend
heroku login
heroku create research-portal-api
```

### Step 3: Add PostgreSQL

```bash
heroku addons:create heroku-postgresql:mini
```

### Step 4: Configure Environment

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret_here
heroku config:set JWT_EXPIRES_IN=24h
```

Database variables are auto-configured by Heroku addon.

### Step 5: Create Procfile

Create `backend/Procfile`:
```
web: node server.js
```

### Step 6: Deploy

```bash
git add .
git commit -m "Add Procfile"
git push heroku main

# Or if deploying backend subfolder
git subtree push --prefix backend heroku main
```

### Step 7: Apply Database Schema

```bash
# Get database URL
heroku config:get DATABASE_URL

# Apply schema
psql <DATABASE_URL> -f database/schema.sql
```

### Step 8: Open App

```bash
heroku open
```

## Post-Deployment

After deploying to any platform:

### 1. Verify Health Endpoint

```bash
curl https://your-api.com/health
```

### 2. Change Admin Password

```bash
# Login
TOKEN=$(curl -X POST https://your-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@university.edu", "password": "admin123"}' \
  | jq -r '.data.token')

# Update password via direct database access or create an endpoint
```

### 3. Configure CORS

Update `CORS_ORIGIN` environment variable:
```bash
# For Railway
railway variables set CORS_ORIGIN=https://your-frontend.com

# For Heroku
heroku config:set CORS_ORIGIN=https://your-frontend.com

# For Render/AWS
# Update via dashboard
```

### 4. Setup Monitoring

- Enable application logs
- Setup health check monitoring
- Configure error alerting
- Monitor database connections

### 5. Backup Strategy

- Enable automated database backups
- Test backup restoration
- Document backup procedures

### 6. SSL/HTTPS

Most platforms provide SSL automatically:
- Render: Automatic
- Railway: Automatic
- Heroku: Automatic
- AWS EB: Configure in Load Balancer

### 7. Custom Domain (Optional)

Configure custom domain in platform settings:

**Render:**
- Settings → Custom Domains
- Add CNAME record: `api.yourdomain.com`

**Railway:**
- Settings → Domains
- Add custom domain

**Heroku:**
```bash
heroku domains:add api.yourdomain.com
```

## Environment Variables Reference

Required for all deployments:

```bash
# Database
DB_HOST=
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=research_portal_db

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=  # Generate with: openssl rand -base64 32
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=  # Your frontend URL or *
```

## Troubleshooting

### Database Connection Issues

1. Check security groups/firewall rules
2. Verify database is publicly accessible (for initial setup)
3. Confirm connection credentials
4. Test connection: `psql -h host -U user -d dbname`

### Application Won't Start

1. Check logs:
   ```bash
   # Railway
   railway logs
   
   # Heroku
   heroku logs --tail
   
   # Render
   # View in dashboard
   ```

2. Verify all environment variables are set
3. Ensure PORT is configured correctly
4. Check Node.js version compatibility

### 502/504 Errors

1. Increase timeout settings
2. Check application is listening on correct port
3. Verify health check endpoint works
4. Check database connection pool settings

## Security Checklist

- [ ] Changed default admin password
- [ ] JWT_SECRET is strong and unique
- [ ] Database password is strong
- [ ] CORS is configured (not using *)
- [ ] SSL/HTTPS is enabled
- [ ] Database is not publicly accessible (production)
- [ ] Environment variables are not in code
- [ ] Logs don't contain sensitive data
- [ ] Rate limiting is configured (optional)
- [ ] Database backups are enabled

## Performance Optimization

1. **Database Indexes**: Already included in schema
2. **Connection Pooling**: Already configured
3. **Caching**: Consider adding Redis for frequently accessed data
4. **CDN**: Use CDN for uploaded files
5. **Compression**: Add gzip middleware

## Next Steps

1. Setup CI/CD pipeline
2. Add database migrations tool
3. Implement rate limiting
4. Add request logging
5. Setup performance monitoring
6. Configure automated backups
7. Add integration tests
8. Setup staging environment

## Support

For platform-specific issues:
- Render: https://render.com/docs
- Railway: https://docs.railway.app
- AWS: https://docs.aws.amazon.com
- Heroku: https://devcenter.heroku.com
