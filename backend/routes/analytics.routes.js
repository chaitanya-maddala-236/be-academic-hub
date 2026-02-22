const express = require('express');
const router = express.Router();
const {
  getProjectsByDepartment,
  getFundingTrend,
  getStatusDistribution,
} = require('../controllers/analytics.controller');

// Public analytics endpoints
router.get('/projects-by-department', getProjectsByDepartment);
router.get('/funding-trend', getFundingTrend);
router.get('/status-distribution', getStatusDistribution);

module.exports = router;
