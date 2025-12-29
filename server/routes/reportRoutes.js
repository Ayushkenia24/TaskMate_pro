const express = require('express');
const router = express.Router();
const {
  getDailyReport,
  getWeeklyReport,
  getOverallStats
} = require('../controllers/reportController');
const verifyToken = require('../middleware/authMiddleware');

// All routes are protected
router.use(verifyToken);

router.get('/daily/:date', getDailyReport);
router.get('/weekly', getWeeklyReport);
router.get('/stats', getOverallStats);

module.exports = router;