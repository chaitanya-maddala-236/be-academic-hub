const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projects.controller');

// Public routes
router.get('/', getAllProjects);
router.get('/:id', getProjectById);

// Protected routes - Admin only
router.post('/', verifyToken, authorizeRole('admin'), createProject);
router.put('/:id', verifyToken, authorizeRole('admin'), updateProject);
router.delete('/:id', verifyToken, authorizeRole('admin'), deleteProject);

module.exports = router;
