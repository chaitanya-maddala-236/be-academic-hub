const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { authorizeRole } = require('../middleware/role.middleware');
const {
  getAllIpAssets,
  getIpAssetById,
  createIpAsset,
  updateIpAsset,
  deleteIpAsset
} = require('../controllers/ipAssets.controller');

// Public routes
router.get('/', getAllIpAssets);
router.get('/:id', getIpAssetById);

// Protected routes - Admin only
router.post('/', verifyToken, authorizeRole('admin'), createIpAsset);
router.put('/:id', verifyToken, authorizeRole('admin'), updateIpAsset);
router.delete('/:id', verifyToken, authorizeRole('admin'), deleteIpAsset);

module.exports = router;
