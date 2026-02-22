const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');
const dashboardController = require('../controllers/dashboard.controller');

// Protected routes - Admin and specific roles can view dashboard
router.get('/stats', verifyToken, authorizeRole(['admin']), dashboardController.getDashboardStats);
router.get('/publications-per-year', verifyToken, authorizeRole(['admin']), dashboardController.getPublicationsPerYear);
router.get('/patent-growth', verifyToken, authorizeRole(['admin']), dashboardController.getPatentGrowth);
router.get('/consultancy-revenue', verifyToken, authorizeRole(['admin']), dashboardController.getConsultancyRevenue);
router.get('/department-comparison', verifyToken, authorizeRole(['admin']), dashboardController.getDepartmentComparison);

module.exports = router;
