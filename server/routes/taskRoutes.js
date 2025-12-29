const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTasksByDate,
  updateTask,
  markTaskDone,
  deleteTask
} = require('../controllers/taskController');
const verifyToken = require('../middleware/authMiddleware');

// All routes are protected
router.use(verifyToken);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/date/:date', getTasksByDate);
router.put('/:id', updateTask);
router.patch('/:id/done', markTaskDone);
router.delete('/:id', deleteTask);

module.exports = router;