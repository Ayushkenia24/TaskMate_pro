const cron = require('node-cron');
const db = require('../config/db');
const { sendFirstAlert, sendSecondAlert, sendThirdAlert, sendEndOfDayReminder } = require('./alertService');

// Check for tasks that need first alert (runs every minute)
const startFirstAlertScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS format
      const currentDate = now.toISOString().slice(0, 10); // YYYY-MM-DD format
      
      // Find tasks that need first alert (exactly at scheduled time)
      const [tasks] = await db.query(
        `SELECT t.*, u.phone, u.name 
         FROM tasks t
         JOIN users u ON t.user_id = u.id
         WHERE t.task_date = ? 
         AND t.task_time <= ? 
         AND t.alert_count = 0 
         AND t.status = 'pending'`,
        [currentDate, currentTime]
      );
      
      // Send first alerts
      for (const task of tasks) {
        await sendFirstAlert(task.id, task.phone, task.name, task.task_name, task.task_time);
      }
      
      if (tasks.length > 0) {
        console.log(`✅ Sent ${tasks.length} first alert(s)`);
      }
      
    } catch (error) {
      console.error('❌ First alert scheduler error:', error.message);
    }
  });
  
  console.log('✅ First alert scheduler started - checking every minute');
};

// Check for tasks that need second alert - 10 minutes after first (runs every minute)
const startSecondAlertScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      // Find tasks where exactly 10 minutes have passed since first alert
      const [tasks] = await db.query(
        `SELECT t.*, u.phone, u.name 
         FROM tasks t
         JOIN users u ON t.user_id = u.id
         WHERE t.alert_count = 1 
         AND t.status = 'pending'
         AND t.first_alert_sent_at IS NOT NULL
         AND TIMESTAMPDIFF(MINUTE, t.first_alert_sent_at, NOW()) >= 10`
      );
      
      // Send second alerts
      for (const task of tasks) {
        await sendSecondAlert(task.id, task.phone, task.name, task.task_name);
      }
      
      if (tasks.length > 0) {
        console.log(`✅ Sent ${tasks.length} second alert(s)`);
      }
      
    } catch (error) {
      console.error('❌ Second alert scheduler error:', error.message);
    }
  });
  
  console.log('✅ Second alert scheduler started - checking every minute');
};

// Check for tasks that need third alert - 10 minutes after second (runs every minute)
const startThirdAlertScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      // Find tasks where exactly 10 minutes have passed since second alert
      const [tasks] = await db.query(
        `SELECT t.*, u.phone, u.name 
         FROM tasks t
         JOIN users u ON t.user_id = u.id
         WHERE t.alert_count = 2 
         AND t.status = 'pending'
         AND t.second_alert_sent_at IS NOT NULL
         AND TIMESTAMPDIFF(MINUTE, t.second_alert_sent_at, NOW()) >= 10`
      );
      
      // Send third alerts (task stays pending)
      for (const task of tasks) {
        await sendThirdAlert(task.id, task.phone, task.name, task.task_name);
      }
      
      if (tasks.length > 0) {
        console.log(`✅ Sent ${tasks.length} third alert(s)`);
      }
      
    } catch (error) {
      console.error('❌ Third alert scheduler error:', error.message);
    }
  });
  
  console.log('✅ Third alert scheduler started - checking every minute');
};

// Check for completed daily tasks and send end-of-day reminder ONCE (runs every 30 minutes)
const startEndOfDayChecker = () => {
  cron.schedule('*/30 * * * *', async () => {
    try {
      const currentDate = new Date().toISOString().slice(0, 10);
      
      // Find users who completed all tasks for today (no pending tasks)
      const [users] = await db.query(
        `SELECT DISTINCT u.id, u.name, u.phone
         FROM users u
         WHERE EXISTS (
           SELECT 1 FROM tasks t1 
           WHERE t1.user_id = u.id 
           AND t1.task_date = ?
         )
         AND NOT EXISTS (
           SELECT 1 FROM tasks t2 
           WHERE t2.user_id = u.id 
           AND t2.task_date = ? 
           AND t2.status = 'pending'
         )`,
        [currentDate, currentDate]
      );
      
      // Send end-of-day reminders (only once per user per day)
      for (const user of users) {
        const result = await sendEndOfDayReminder(user.phone, user.name, user.id, currentDate);
        if (!result.alreadySent && result.success) {
          console.log(`✅ Sent end-of-day reminder to ${user.name}`);
        }
      }
      
    } catch (error) {
      console.error('❌ End-of-day checker error:', error.message);
    }
  });
  
  console.log('✅ End-of-day checker started - checking every 30 minutes');
};

// Start all schedulers
const startAllSchedulers = () => {
  startFirstAlertScheduler();
  startSecondAlertScheduler();
  startThirdAlertScheduler();
  startEndOfDayChecker();
};

module.exports = { startAllSchedulers };