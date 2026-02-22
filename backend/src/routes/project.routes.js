const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/project.controller');
const { verifyToken, authorizeRole } = require('../middleware/auth.middleware');

router.get('/dashboard', ctrl.dashboard);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.post('/', verifyToken, authorizeRole('admin', 'faculty'), ctrl.create);
router.put('/:id', verifyToken, authorizeRole('admin', 'faculty'), ctrl.update);
router.delete('/:id', verifyToken, authorizeRole('admin'), ctrl.remove);

module.exports = router;
