const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');
const {
  getAllPatents,
  getPatentById,
  createPatent,
  updatePatent,
  deletePatent
} = require('../controllers/patents.controller');

// Public routes
router.get('/', getAllPatents);
router.get('/:id', getPatentById);

// Protected routes - Admin only
router.post('/', verifyToken, authorizeRole('admin'), createPatent);
router.put('/:id', verifyToken, authorizeRole('admin'), updatePatent);
router.delete('/:id', verifyToken, authorizeRole('admin'), deletePatent);

module.exports = router;
