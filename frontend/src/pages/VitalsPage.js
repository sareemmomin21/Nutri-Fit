import React, { useState } from 'react';
import StreakIndicator from '../components/StreakIndicator';
import VitalsChart from '../components/VitalsChart';
import VitalsInputForm from '../components/VitalsInputForm';
import '../components/styles/Vitals.css';

// Metric definitions with icons (use emoji for now, can swap for SVGs later)
const METRICS = [
  { key: 'water', label: 'Water', icon: '💧' },
  { key: 'sleep', label: 'Sleep', icon: '🌙' },
  { key: 'steps', label: 'Steps', icon: '👟' },
  { key: 'meditation', label: 'Meditation', icon: '🧘' },
  { key: 'mood', label: 'Mood', icon: '😊' },
];

const TIME_RANGES = [
  { key: '1w', label: '1 Week' },
  { key: '1m', label: '1 Month' },
  { key: '3m', label: '3 Months' },
  { key: '6m', label: '6 Months' },
  { key: '1y', label: '1 Year' },
];

const VitalsPage = () => {
  const [selectedMetric, setSelectedMetric] = useState('water');
  const [selectedRange, setSelectedRange] = useState('1w');
  const [streak, setStreak] = useState(5); // Example streak value
  const [todayProgress, setTodayProgress] = useState('68.0 oz'); // Example progress
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  // THEME: Timileyin, adjust classNames and CSS variables for dark/light mode
  return (
    <div className="vitals-page-container">
      {/* Page Title and Subtitle */}
      <div className="vitals-header-section">
        <h1 className="vitals-title">Daily Vitals</h1>
        <p className="vitals-subtitle">Track your daily health metrics and build healthy habits</p>
        <button className="vitals-manage-metrics-btn" onClick={() => setIsManageModalOpen(true)}>⚙️ Manage Metrics</button>
      </div>

      {/* Metric Toggle Bar */}
      <div className="vitals-metric-toggle-bar">
        {METRICS.map(metric => (
          <button
            key={metric.key}
            className={`vitals-metric-toggle-btn${selectedMetric === metric.key ? ' active' : ''}`}
            onClick={() => setSelectedMetric(metric.key)}
          >
            <span className="vitals-metric-icon">{metric.icon}</span> {metric.label}
          </button>
        ))}
      </div>

      {/* Summary Cards Section */}
      <div className="vitals-summary-cards-section">
        <div className="vitals-summary-card">
          <div className="vitals-summary-card-label">Current Metric</div>
          <div className="vitals-summary-card-value vitals-summary-metric">
            {/* THEME: Replace emoji with SVG/icon for production */}
            <span className="vitals-summary-icon">{METRICS.find(m => m.key === selectedMetric)?.icon}</span>
            {METRICS.find(m => m.key === selectedMetric)?.label}
          </div>
        </div>
        <div className="vitals-summary-card">
          <div className="vitals-summary-card-label">Current Streak</div>
          <div className="vitals-summary-card-value vitals-summary-streak">
            <span className="vitals-summary-icon">🔥</span>
            {streak} days
          </div>
        </div>
        <div className="vitals-summary-card">
          <div className="vitals-summary-card-label">Today's Progress</div>
          <div className="vitals-summary-card-value vitals-summary-progress">
            <span className="vitals-summary-progress-badge">Today</span>
            {todayProgress}
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="vitals-time-range-bar">
        {TIME_RANGES.map(range => (
          <button
            key={range.key}
            className={`vitals-time-range-btn${selectedRange === range.key ? ' active' : ''}`}
            onClick={() => setSelectedRange(range.key)}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="vitals-chart-card">
        <div className="vitals-chart-title-row">
          <span className="vitals-chart-title-icon">{METRICS.find(m => m.key === selectedMetric)?.icon}</span>
          <span className="vitals-chart-title">{METRICS.find(m => m.key === selectedMetric)?.label} Tracking - {TIME_RANGES.find(r => r.key === selectedRange)?.label}</span>
        </div>
        {/* Timileyin: Add target line to chart in VitalsChart.js for future expansion */}
        <VitalsChart metric={selectedMetric} range={selectedRange} />
      </div>

      {/* Input Form Area */}
      <div className="vitals-input-form-area">
        {/* Timileyin: Adjust card layout or add theme logic here for dark/light mode */}
        <VitalsInputForm
          metric={selectedMetric}
          onSubmit={(data) => {
            // For now, just log the data. Later, update chart and streak.
            console.log('Logged data:', data);
          }}
        />
      </div>

      {/* Manage Metrics Modal */}
      {isManageModalOpen && (
        <div className="vitals-modal-overlay" onClick={() => setIsManageModalOpen(false)}>
          <div className="vitals-modal-content" onClick={e => e.stopPropagation()}>
            <div className="vitals-modal-header">
              <h2>Manage Custom Metrics</h2>
              <button className="vitals-modal-close" onClick={() => setIsManageModalOpen(false)}>×</button>
            </div>
            <div className="vitals-modal-body">
              <h3>Your Custom Metrics</h3>
              {/* Timileyin: Add custom metrics list and edit/delete logic here */}
              <div className="vitals-modal-metric-card">
                <span className="vitals-modal-metric-icon">🧘</span>
                <div>
                  <div className="vitals-modal-metric-title">Meditation</div>
                  <div className="vitals-modal-metric-desc">Unit: minutes | Type: Number Input | Target: 20</div>
                  <div className="vitals-modal-metric-helper">Daily mindfulness practice</div>
                </div>
                <span className="vitals-modal-metric-streak">2 day streak</span>
                <button className="vitals-modal-metric-edit">✏️</button>
                <button className="vitals-modal-metric-delete">🗑️</button>
              </div>
              <div className="vitals-modal-metric-card">
                <span className="vitals-modal-metric-icon">😊</span>
                <div>
                  <div className="vitals-modal-metric-title">Mood</div>
                  <div className="vitals-modal-metric-desc">Unit: rating | Type: Dropdown Selection | Target: 8</div>
                  <div className="vitals-modal-metric-helper">Rate your mood (1-10)</div>
                </div>
                <span className="vitals-modal-metric-streak">4 day streak</span>
                <button className="vitals-modal-metric-edit">✏️</button>
                <button className="vitals-modal-metric-delete">🗑️</button>
              </div>
              <button className="vitals-modal-add-metric">+ Add New Metric</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VitalsPage;
