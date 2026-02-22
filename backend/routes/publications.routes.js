const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');
const {
  getAllPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication
} = require('../controllers/publications.controller');

// Public routes
router.get('/', getAllPublications);
router.get('/:id', getPublicationById);

// Protected routes - Admin only
router.post('/', verifyToken, authorizeRole('admin'), createPublication);
router.put('/:id', verifyToken, authorizeRole('admin'), updatePublication);
router.delete('/:id', verifyToken, authorizeRole('admin'), deletePublication);

module.exports = router;
