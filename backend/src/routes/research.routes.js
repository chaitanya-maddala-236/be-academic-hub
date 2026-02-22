const express = require('express');
const router = express.Router();
const { getResearch, getResearchStats } = require('../controllers/research.controller');

router.get('/stats', getResearchStats);
router.get('/', getResearch);

module.exports = router;
