import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Reports.css';

const Reports = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyReport, setDailyReport] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDailyReport();
    fetchWeeklyReport();
    fetchStats();
  }, [selectedDate]);

  const fetchDailyReport = async () => {
    try {
      const response = await reportAPI.getDailyReport(selectedDate);
      setDailyReport(response.data.report);
    } catch (error) {
      console.error('Failed to fetch daily report');
    }
  };

  const fetchWeeklyReport = async () => {
    try {
      const response = await reportAPI.getWeeklyReport();
      setWeeklyReport(response.data.weeklyReport);
    } catch (error) {
      console.error('Failed to fetch weekly report');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await reportAPI.getOverallStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const pieColors = ['#00ffaa', '#ffaa00', '#ff4444'];

  return (
    <div className="reports-page">
      <nav className="navbar">
        <h2>📊 Performance Reports</h2>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </nav>

      <div className="reports-content container">
        <div className="report-header">
          <h1>Your Performance</h1>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
          />
        </div>

        {dailyReport && (
          <div className="rating-card">
            <div className="rating-emoji">
              {dailyReport.rating === 'Excellent' && '🌟'}
              {dailyReport.rating === 'Better' && '👍'}
              {dailyReport.rating === 'Good' && '😊'}
            </div>
            <h2>Today's Rating: {dailyReport.rating}</h2>
            <p>Keep up the great work!</p>
          </div>
        )}

        <div className="charts-grid">
          {dailyReport && (
            <div className="chart-card">
              <h3>Daily Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Completed', value: dailyReport.completed_tasks },
                      { name: 'Pending', value: dailyReport.pending_tasks },
                      { name: 'Late', value: dailyReport.late_tasks }
                    ]}
                    cx="50%"
                    cy="50%"
                    label
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[0, 1, 2].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="chart-card">
            <h3>Weekly Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyReport}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="task_date" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed_tasks" fill="#00ffaa" name="Completed" />
                <Bar dataKey="late_tasks" fill="#ff4444" name="Late" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {stats && (
          <div className="overall-stats">
            <h3>Overall Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <h4>{stats.total_tasks}</h4>
                <p>Total Tasks</p>
              </div>
              <div className="stat-item">
                <h4>{stats.total_completed}</h4>
                <p>Completed</p>
              </div>
              <div className="stat-item">
                <h4>{stats.total_late}</h4>
                <p>Late</p>
              </div>
              <div className="stat-item">
                <h4>{stats.active_days}</h4>
                <p>Active Days</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;