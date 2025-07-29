import React, { useState, useEffect } from 'react';
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
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  
  // Data and streak state
  const [vitalsData, setVitalsData] = useState({
    water: {},
    sleep: {},
    steps: {},
    meditation: {},
    mood: {}
  });
  const [streaks, setStreaks] = useState({
    water: 5,
    sleep: 3,
    steps: 7,
    meditation: 2,
    mood: 4
  });
  const [todayProgress, setTodayProgress] = useState({
    water: '68.0 oz',
    sleep: '7.5 hours',
    steps: '8,500 steps',
    meditation: '15 minutes',
    mood: '8/10'
  });

  // Get today's date as string for data storage
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Get yesterday's date as string
  const getYesterdayString = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  // Check if data was logged for a specific date
  const hasDataForDate = (metric, dateString) => {
    return vitalsData[metric] && vitalsData[metric][dateString];
  };

  // Calculate streak for a metric
  const calculateStreak = (metric) => {
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateString = currentDate.toISOString().split('T')[0];
      
      if (hasDataForDate(metric, dateString)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break; // Stop counting when we find a day without data
      }
    }
    
    return streak;
  };

  // Update streak for a metric with proper logic
  const updateStreak = (metric, date) => {
    const yesterday = getYesterdayString();
    const hadDataYesterday = hasDataForDate(metric, yesterday);
    
    setStreaks(prev => {
      const newStreaks = { ...prev };
      
      if (hadDataYesterday) {
        // If we had data yesterday, increment the streak
        newStreaks[metric] = (prev[metric] || 0) + 1;
      } else {
        // If we missed yesterday, reset to 1 (for today's entry)
        newStreaks[metric] = 1;
      }
      
      return newStreaks;
    });
  };

  // Recalculate all streaks when data changes
  useEffect(() => {
    const newStreaks = {};
    METRICS.forEach(metric => {
      newStreaks[metric.key] = calculateStreak(metric.key);
    });
    setStreaks(newStreaks);
  }, [vitalsData]);

  // Handle form submission and update data
  const handleVitalsSubmit = (data) => {
    const today = getTodayString();
    const metric = selectedMetric;
    
    // Update vitals data
    setVitalsData(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [today]: data
      }
    }));

    // Update today's progress display
    let progressText = '';
    if (metric === 'water') {
      progressText = `${data.amount} ${data.unit}`;
    } else if (metric === 'sleep') {
      const totalHours = data.hours + (data.minutes / 60);
      progressText = `${totalHours.toFixed(1)} hours`;
    } else if (metric === 'steps') {
      progressText = `${data.steps.toLocaleString()} steps`;
    }
    
    setTodayProgress(prev => ({
      ...prev,
      [metric]: progressText
    }));

    // Update streak logic
    updateStreak(metric, today);
    
    console.log('Logged vitals data:', { metric, data, date: today });
  };

  // Get current streak for selected metric
  const getCurrentStreak = () => {
    return streaks[selectedMetric] || 0;
  };

  // Get current progress for selected metric
  const getCurrentProgress = () => {
    return todayProgress[selectedMetric] || '0';
  };

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
            {getCurrentStreak()} days
          </div>
        </div>
        <div className="vitals-summary-card">
          <div className="vitals-summary-card-label">Today's Progress</div>
          <div className="vitals-summary-card-value vitals-summary-progress">
            <span className="vitals-summary-progress-badge">Today</span>
            {getCurrentProgress()}
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
        <VitalsChart metric={selectedMetric} range={selectedRange} data={vitalsData[selectedMetric]} />
      </div>

      {/* Input Form Area */}
      <div className="vitals-input-form-area">
        {/* Timileyin: Adjust card layout or add theme logic here for dark/light mode */}
        <VitalsInputForm
          metric={selectedMetric}
          onSubmit={handleVitalsSubmit}
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
