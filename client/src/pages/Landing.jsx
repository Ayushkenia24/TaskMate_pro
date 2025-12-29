import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="new-landing gradient-bg">
      {/* Floating Decorative Elements */}
      <div className="decorative-icons">
        <div className="icon icon-target float-animation">🎯</div>
        <div className="icon icon-rocket float-animation" style={{animationDelay: '1s'}}>🚀</div>
        <div className="icon icon-bolt float-animation" style={{animationDelay: '2s'}}>⚡</div>
        <div className="icon icon-muscle float-animation" style={{animationDelay: '1.5s'}}>💪</div>
      </div>

      <div className="landing-container fade-in">
        {/* Main Card */}
        <div className="landing-card glow-effect">
          {/* App Icon */}
          <div className="app-icon bounce-animation">
            <div className="icon-check">✓</div>
          </div>

          {/* App Name */}
          <h1 className="app-title">Todoist</h1>
          <p className="app-subtitle">Crush your tasks like a boss! 💪</p>

          {/* CTA Button */}
          <button 
            className="btn btn-primary btn-large pulse-animation"
            onClick={() => navigate('/login')}
          >
            Let's Go! 🚀
          </button>

          {/* Feature Icons */}
          <div className="feature-icons-row">
            <div className="feature-icon-item">
              <div className="feature-icon">🎨</div>
              <p>Fun & Easy</p>
            </div>
            <div className="feature-icon-item">
              <div className="feature-icon">📊</div>
              <p>Track Progress</p>
            </div>
            <div className="feature-icon-item">
              <div className="feature-icon">🔔</div>
              <p>Smart Alerts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

