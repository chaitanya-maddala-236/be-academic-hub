const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const prisma = require('./src/lib/prisma');
const errorHandler = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const facultyRoutes = require('./routes/faculty.routes');
const publicationsRoutes = require('./routes/publications.routes');
const patentsRoutes = require('./routes/patents.routes');
const ipAssetsRoutes = require('./routes/ipAssets.routes');
const projectsRoutes = require('./routes/projects.routes');
const labsRoutes = require('./routes/labs.routes');
const consultancyRoutes = require('./routes/consultancy.routes');
const materialsRoutes = require('./routes/materials.routes');
const awardsRoutes = require('./routes/awards.routes');
const studentProjectsRoutes = require('./routes/studentProjects.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/publications', publicationsRoutes);
app.use('/api/patents', patentsRoutes);
app.use('/api/ip-assets', ipAssetsRoutes);
app.use('/api/ipr', ipAssetsRoutes); // IPR alias for ip-assets
app.use('/api/projects', projectsRoutes);
app.use('/api/labs', labsRoutes);
app.use('/api/research-centers', labsRoutes); // Research centers alias for labs
app.use('/api/consultancy', consultancyRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/awards', awardsRoutes);
app.use('/api/student-projects', studentProjectsRoutes);
app.use('/api/analytics', analyticsRoutes);

// NEW: /api/v1 routes (Prisma-based)
const v1Routes = require('./src/routes/index');
app.use('/api/v1', v1Routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection via Prisma
    await prisma.$queryRaw`SELECT NOW()`;
    console.log('✓ Database connection established');

    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log(`✓ API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
