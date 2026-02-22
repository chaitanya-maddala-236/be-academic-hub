const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');
const iprController = require('../controllers/ipr.controller');

// Public routes
router.get('/', iprController.getAllIPR);
router.get('/:id', iprController.getIPRById);

// Protected routes - Admin only
router.post('/', verifyToken, authorizeRole(['admin']), iprController.createIPR);
router.put('/:id', verifyToken, authorizeRole(['admin']), iprController.updateIPR);
router.delete('/:id', verifyToken, authorizeRole(['admin']), iprController.deleteIPR);

module.exports = router;
