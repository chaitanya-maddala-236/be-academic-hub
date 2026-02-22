const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');
const researchCentersController = require('../controllers/researchCenters.controller');

// Public routes
router.get('/', researchCentersController.getAllResearchCenters);
router.get('/:id', researchCentersController.getResearchCenterById);

// Protected routes - Admin only
router.post('/', verifyToken, authorizeRole(['admin']), researchCentersController.createResearchCenter);
router.put('/:id', verifyToken, authorizeRole(['admin']), researchCentersController.updateResearchCenter);
router.delete('/:id', verifyToken, authorizeRole(['admin']), researchCentersController.deleteResearchCenter);

module.exports = router;
