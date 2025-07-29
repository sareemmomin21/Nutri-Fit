import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import vitalsApi from '../services/vitalsApi';
import VitalsChart from '../components/VitalsChart';
import VitalsInputForm from '../components/VitalsInputForm';
import VitalsTodayTimeline from '../components/VitalsTodayTimeline';
import VitalsTodayLogs from '../components/VitalsTodayLogs';
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
  const navigate = useNavigate();
  const userId = localStorage.getItem("nutrifit_user_id");
  const [selectedMetric, setSelectedMetric] = useState('water');
  const [selectedRange, setSelectedRange] = useState('1w');
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' or 'timeline'
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Test date navigation state
  const [testDate, setTestDate] = useState(new Date());
  const [isTestMode, setIsTestMode] = useState(false);
  
  // Data and streak state
  const [vitalsData, setVitalsData] = useState({
    water: {}, sleep: {}, steps: {}, meditation: {}, mood: {}
  });
  const [streaks, setStreaks] = useState({
    water: 0, sleep: 0, steps: 0, meditation: 0, mood: 0
  });
  const [todayProgress, setTodayProgress] = useState({
    water: '0 oz', sleep: '0 hours', steps: '0 steps', meditation: '0 minutes', mood: '0/10'
  });

  // Day navigation functions
  const goToPreviousDay = () => {
    const newDate = new Date(testDate);
    newDate.setDate(testDate.getDate() - 1);
    setTestDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(testDate);
    newDate.setDate(testDate.getDate() + 1);
    setTestDate(newDate);
  };

  const resetToToday = () => {
    setTestDate(new Date());
    setIsTestMode(false);
  };

  const formatTestDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const loadVitalsData = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await vitalsApi.getVitalsChartData(userId, selectedMetric, selectedRange);
      if (response.success) {
        // Convert chart data back to the format expected by the chart component
        const data = {};
        response.chart_data.forEach(item => {
          if (item.has_data && item.value) {
            data[item.date] = item.value;
          }
        });
        
        setVitalsData(prev => ({
          ...prev,
          [selectedMetric]: data
        }));
      } else {
        setError('Failed to load vitals data');
      }
    } catch (err) {
      console.error('Error loading vitals data:', err);
      setError('Failed to load vitals data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [userId, selectedMetric, selectedRange]);

  const loadStreaks = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await vitalsApi.getAllVitalsStreaks(userId);
      if (response.success) {
        const newStreaks = {};
        METRICS.forEach(metric => {
          const streakInfo = response.streaks[metric.key];
          newStreaks[metric.key] = streakInfo ? streakInfo.current_streak : 0;
        });
        setStreaks(newStreaks);
      } else {
        console.error('Failed to load streaks:', response.error);
      }
    } catch (err) {
      console.error('Error loading streaks:', err);
      // Don't set error state for streaks as it's not critical
    }
  }, [userId]);

  const loadTodayProgress = useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await vitalsApi.getVitalsSummary(userId, selectedMetric, 1);
      if (response.success && response.summary.today_value) {
        let progressText = '';
        const todayValue = response.summary.today_value;
        
        if (selectedMetric === 'water') {
          progressText = `${todayValue.amount || 0} ${todayValue.unit || 'oz'}`;
        } else if (selectedMetric === 'sleep') {
          const totalHours = (todayValue.hours || 0) + (todayValue.minutes || 0) / 60;
          progressText = `${totalHours.toFixed(1)} hours`;
        } else if (selectedMetric === 'steps') {
          progressText = `${(todayValue.steps || 0).toLocaleString()} steps`;
        } else if (selectedMetric === 'meditation') {
          progressText = `${todayValue.minutes || 0} minutes`;
        } else if (selectedMetric === 'mood') {
          progressText = `${todayValue.rating || 0}/10`;
        }
        
        setTodayProgress(prev => ({
          ...prev,
          [selectedMetric]: progressText
        }));
      }
    } catch (err) {
      console.error('Error loading today progress:', err);
      // Don't set error state for today progress as it's not critical
    }
  }, [userId, selectedMetric]);

  // Load initial data
  useEffect(() => {
    if (!userId) {
      navigate("/auth");
      return;
    }
    loadVitalsData();
    loadStreaks();
    loadTodayProgress();
  }, [userId, navigate, loadVitalsData, loadStreaks, loadTodayProgress]);

  // Load vitals data when metric or range changes
  useEffect(() => {
    if (userId && selectedMetric) {
      loadVitalsData();
      loadTodayProgress();
    }
  }, [userId, selectedMetric, selectedRange, loadVitalsData, loadTodayProgress]);

  // Handle form submission and update data
  const handleVitalsSubmit = async (data) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use test date if in test mode, otherwise use current date
      const dateToUse = isTestMode ? testDate : new Date();
      // Format date as YYYY-MM-DD for backend
      const formattedDate = dateToUse.toISOString().split('T')[0];
      const response = await vitalsApi.logVitalsData(userId, selectedMetric, data, formattedDate);
      if (response.success) {
        // Reload data
        await loadVitalsData();
        await loadStreaks();
        await loadTodayProgress();
        
        console.log('Logged vitals data:', { metric: selectedMetric, data, date: formattedDate });
      }
    } catch (err) {
      console.error('Error logging vitals data:', err);
      setError('Failed to log vitals data');
    } finally {
      setLoading(false);
    }
  };

  // Get current streak for selected metric
  const getCurrentStreak = () => {
    return streaks[selectedMetric] || 0;
  };

  // Get current progress for selected metric
  const getCurrentProgress = () => {
    return todayProgress[selectedMetric] || '0';
  };

  if (!userId) {
    return <div className="vitals-page-container">Please log in to view vitals.</div>;
  }

  return (
    <div className="vitals-page-container">
      {/* Page Title and Subtitle */}
      <div className="vitals-header-section">
        <h1 className="vitals-title">Daily Vitals</h1>
        <p className="vitals-subtitle">Track your daily health metrics and build healthy habits</p>
        <button className="vitals-manage-metrics-btn" onClick={() => setIsManageModalOpen(true)}>⚙️ Manage Metrics</button>
      </div>

      {error && (
        <div className="vitals-error-message">
          {error}
        </div>
      )}

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

      {/* Today's Logs Section */}
      <div className="vitals-today-logs-section">
        <VitalsTodayLogs userId={userId} metricType={selectedMetric} key={`${userId}-${selectedMetric}`} />
      </div>

      {/* Test Mode Day Navigation */}
      <div className="vitals-test-navigation">
        <div className="vitals-test-controls">
          <button 
            className={`vitals-test-mode-btn${isTestMode ? ' active' : ''}`}
            onClick={() => setIsTestMode(!isTestMode)}
          >
            🧪 Test Mode
          </button>
          {isTestMode && (
            <>
              <button 
                className="vitals-day-nav-btn"
                onClick={goToPreviousDay}
                title="Previous Day"
              >
                ◀️
              </button>
              <div className="vitals-test-date-display">
                <span className="vitals-test-date-label">
                  {isToday(testDate) ? 'Today' : 'Test Date'}:
                </span>
                <span className="vitals-test-date-value">
                  {formatTestDate(testDate)}
                </span>
              </div>
              <button 
                className="vitals-day-nav-btn"
                onClick={goToNextDay}
                title="Next Day"
              >
                ▶️
              </button>
              <button 
                className="vitals-reset-btn"
                onClick={resetToToday}
                title="Reset to Today"
              >
                🔄
              </button>
            </>
          )}
        </div>
        {isTestMode && (
          <div className="vitals-test-info">
            <span className="vitals-test-info-icon">ℹ️</span>
            <span className="vitals-test-info-text">
              Test Mode: Data will be logged for the selected date instead of today
            </span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="vitals-tab-navigation">
        <button
          className={`vitals-tab-btn${activeTab === 'chart' ? ' active' : ''}`}
          onClick={() => setActiveTab('chart')}
        >
          📊 Chart
        </button>
        <button
          className={`vitals-tab-btn${activeTab === 'timeline' ? ' active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          📅 Timeline
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'chart' ? (
        <>
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
            {loading ? (
              <div className="vitals-loading">Loading chart data...</div>
            ) : (
              <VitalsChart metric={selectedMetric} range={selectedRange} data={vitalsData[selectedMetric]} />
            )}
          </div>
        </>
              ) : (
          <VitalsTodayTimeline userId={userId} />
        )}

      {/* Input Form Area */}
      <div className="vitals-input-form-area">
        {/* Timileyin: Adjust card layout or add theme logic here for dark/light mode */}
        <VitalsInputForm
          metric={selectedMetric}
          onSubmit={handleVitalsSubmit}
          loading={loading}
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
