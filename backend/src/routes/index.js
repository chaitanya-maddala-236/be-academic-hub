const express = require('express');
const router = express.Router();
const projectRoutes = require('./project.routes');
const researchRoutes = require('./research.routes');

router.use('/projects', projectRoutes);
router.use('/research', researchRoutes);

module.exports = router;
