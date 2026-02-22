const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');
const teachingMaterialsController = require('../controllers/teachingMaterials.controller');

// Protected routes - Students and Faculty can view
router.get('/', verifyToken, teachingMaterialsController.getAllTeachingMaterials);
router.get('/:id', verifyToken, teachingMaterialsController.getTeachingMaterialById);

// Faculty can create/update their own materials
router.post('/', verifyToken, authorizeRole(['admin', 'faculty']), teachingMaterialsController.createTeachingMaterial);
router.put('/:id', verifyToken, authorizeRole(['admin', 'faculty']), teachingMaterialsController.updateTeachingMaterial);
router.delete('/:id', verifyToken, authorizeRole(['admin', 'faculty']), teachingMaterialsController.deleteTeachingMaterial);

module.exports = router;
