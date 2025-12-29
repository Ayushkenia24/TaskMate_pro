import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI } from '../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    task_name: '',
    description: '',
    task_date: new Date().toISOString().split('T')[0],
    task_time: ''
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) setUser(userData);
    fetchTasks();
  }, [selectedDate]);

  const fetchTasks = async () => {
    try {
      const response = await taskAPI.getTasksByDate(selectedDate);
      setTasks(response.data.tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.info('Logged out successfully');
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await taskAPI.createTask(formData);
      toast.success('Task created! 🎉');
      setShowAddModal(false);
      setFormData({ task_name: '', description: '', task_date: selectedDate, task_time: '' });
      fetchTasks();
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const markDone = async (id) => {
    try {
      await taskAPI.markTaskDone(id);
      toast.success('Task completed! ✅');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to mark task done');
    }
  };

  const deleteTask = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await taskAPI.deleteTask(id);
        toast.success('Task deleted');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const isTaskLate = (task) => {
    const taskDateTime = new Date(`${task.task_date} ${task.task_time}`);
    const thirtyMinutesInMs = 30 * 60 * 1000;
    const lateThreshold = new Date(taskDateTime.getTime() + thirtyMinutesInMs);
    return new Date() > lateThreshold;
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending' && !isTaskLate(t));
  const doneTasks = tasks.filter(t => t.status === 'done');
  const lateTasks = tasks.filter(t => t.status === 'late' || (t.status === 'pending' && isTaskLate(t)));

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>📋 TaskMate Pro</h2>
        </div>
        <div className="nav-links">
          <span className="user-name">Hey, {user?.name}!</span>
          <button className="btn btn-secondary" onClick={() => navigate('/reports')}>
            📊 Reports
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content container">
        <div className="dashboard-header">
          <div>
            <h1>Today's Tasks</h1>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-picker"
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            + Add Task
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{pendingTasks.length}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{doneTasks.length}</h3>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <h3>{lateTasks.length}</h3>
              <p>Late</p>
            </div>
          </div>
        </div>

        <div className="tasks-sections">
          <TaskSection title="Pending Tasks" tasks={pendingTasks} onDone={markDone} onDelete={deleteTask} />
          <TaskSection title="Completed Tasks" tasks={doneTasks} onDelete={deleteTask} />
          <TaskSection title="Late Tasks" tasks={lateTasks} onDone={markDone} onDelete={deleteTask} />
        </div>
      </div>

      {showAddModal && (
        <div className="modal" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Task</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Task Name"
                value={formData.task_name}
                onChange={(e) => setFormData({ ...formData, task_name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <input
                type="date"
                value={formData.task_date}
                onChange={(e) => setFormData({ ...formData, task_date: e.target.value })}
                required
              />
              <input
                type="time"
                value={formData.task_time}
                onChange={(e) => setFormData({ ...formData, task_time: e.target.value })}
                required
              />
              <div className="modal-buttons">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskSection = ({ title, tasks, onDone, onDelete }) => (
  <div className="task-section">
    <h2>{title}</h2>
    {tasks.length === 0 ? (
      <p className="empty-message">No tasks here! 🎉</p>
    ) : (
      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} className={`task-card ${task.status}`}>
            <div className="task-content">
              <h3>{task.task_name}</h3>
              <p>{task.description}</p>
              <div className="task-meta">
                <span>⏰ {task.task_time}</span>
                <span className={`status-badge ${task.status}`}>{task.status}</span>
              </div>
            </div>
            <div className="task-actions">
              {task.status !== 'done' && (
                <button className="btn-icon btn-success" onClick={() => onDone(task.id)} title="Mark Done">
                  ✓
                </button>
              )}
              <button className="btn-icon btn-danger" onClick={() => onDelete(task.id)} title="Delete">
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default Dashboard;
