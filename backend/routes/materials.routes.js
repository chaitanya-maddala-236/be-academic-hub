const express = require('express');
const router = express.Router();
const materialsController = require('../controllers/materials.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter.middleware');

// Public routes - students and public can view
router.get('/', materialsController.getAllMaterials);
router.get('/:id', materialsController.getMaterialById);

// Protected routes - faculty and admin can create (with upload rate limiting)
router.post('/', verifyToken, requireRole(['admin', 'faculty']), uploadLimiter, materialsController.upload, materialsController.createMaterial);

// Admin and faculty can delete (faculty can delete own materials)
router.delete('/:id', verifyToken, requireRole(['admin', 'faculty']), materialsController.deleteMaterial);

module.exports = router;
