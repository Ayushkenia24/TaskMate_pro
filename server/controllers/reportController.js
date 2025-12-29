const db = require('../config/db');

// Get daily performance report
const getDailyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;
    
    // Get task statistics for the date
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks
      FROM tasks 
      WHERE user_id = ? AND task_date = ?`,
      [userId, date]
    );
    
    const report = stats[0];
    
    // Calculate performance rating
    let rating = 'Good';
    if (report.total_tasks > 0) {
      const completionRate = (report.completed_tasks / report.total_tasks) * 100;
      const lateRate = (report.late_tasks / report.total_tasks) * 100;
      
      if (completionRate >= 90 && lateRate <= 10) {
        rating = 'Excellent';
      } else if (completionRate >= 70 && lateRate <= 30) {
        rating = 'Better';
      } else {
        rating = 'Good';
      }
    }
    
    res.json({
      success: true,
      report: {
        date,
        total_tasks: report.total_tasks,
        completed_tasks: report.completed_tasks,
        late_tasks: report.late_tasks,
        pending_tasks: report.pending_tasks,
        rating
      }
    });
    
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating report'
    });
  }
};

// Get weekly performance summary
const getWeeklyReport = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get last 7 days statistics
    const [weeklyStats] = await db.query(
      `SELECT 
        task_date,
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_tasks
      FROM tasks 
      WHERE user_id = ? AND task_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY task_date
      ORDER BY task_date DESC`,
      [userId]
    );
    
    res.json({
      success: true,
      weeklyReport: weeklyStats
    });
    
  } catch (error) {
    console.error('Weekly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error generating weekly report'
    });
  }
};

// Get overall statistics
const getOverallStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as total_completed,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as total_late,
        COUNT(DISTINCT task_date) as active_days
      FROM tasks 
      WHERE user_id = ?`,
      [userId]
    );
    
    res.json({
      success: true,
      stats: stats[0]
    });
    
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
};

module.exports = {
  getDailyReport,
  getWeeklyReport,
  getOverallStats
};