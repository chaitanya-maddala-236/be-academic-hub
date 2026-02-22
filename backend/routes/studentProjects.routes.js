const express = require('express');
const router = express.Router();
const studentProjectsController = require('../controllers/studentProjects.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Public routes - viewing student projects
router.get('/', studentProjectsController.getAllStudentProjects);
router.get('/:id', studentProjectsController.getStudentProjectById);

// Protected routes - faculty and admin can create/update
router.post('/', verifyToken, requireRole(['admin', 'faculty']), studentProjectsController.createStudentProject);
router.put('/:id', verifyToken, requireRole(['admin', 'faculty']), studentProjectsController.updateStudentProject);

// Admin only routes
router.delete('/:id', verifyToken, requireRole(['admin']), studentProjectsController.deleteStudentProject);

module.exports = router;
