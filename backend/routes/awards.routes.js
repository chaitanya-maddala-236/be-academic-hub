const express = require('express');
const router = express.Router();
const awardsController = require('../controllers/awards.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Public routes - viewing awards
router.get('/', awardsController.getAllAwards);
router.get('/:id', awardsController.getAwardById);

// Protected routes - admin and faculty can create/update
router.post('/', verifyToken, requireRole(['admin', 'faculty']), awardsController.createAward);
router.put('/:id', verifyToken, requireRole(['admin', 'faculty']), awardsController.updateAward);

// Admin only routes
router.delete('/:id', verifyToken, requireRole(['admin']), awardsController.deleteAward);

module.exports = router;
