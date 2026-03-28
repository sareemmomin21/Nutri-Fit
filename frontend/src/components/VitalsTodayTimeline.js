import React, { useState, useEffect } from 'react';
import vitalsApi from '../services/vitalsApi';
import '../components/styles/Vitals.css';

const VitalsTodayTimeline = ({ userId }) => {
  const [todayData, setTodayData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Metric definitions with icons
  const METRICS = [
    { key: 'water', label: 'Water', icon: '💧', color: '#3B82F6' },
    { key: 'sleep', label: 'Sleep', icon: '🌙', color: '#8B5CF6' },
    { key: 'steps', label: 'Steps', icon: '👟', color: '#10B981' },
    { key: 'meditation', label: 'Meditation', icon: '🧘', color: '#F59E0B' },
    { key: 'mood', label: 'Mood', icon: '😊', color: '#EC4899' },
  ];

  const loadTodayData = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const allData = [];
      
      // Load data for each metric
      for (const metric of METRICS) {
        const response = await vitalsApi.getVitalsData(userId, metric.key, today, today);
        if (response.success && response.data && response.data[today]) {
          // Handle new data structure with multiple entries per day
          if (Array.isArray(response.data[today])) {
            // Multiple entries - add each one
            response.data[today].forEach(entry => {
              allData.push({
                metric: metric.key,
                label: metric.label,
                icon: metric.icon,
                color: metric.color,
                value: entry.value,
                timestamp: entry.timestamp
              });
            });
          } else {
            // Single entry (backward compatibility)
            allData.push({
              metric: metric.key,
              label: metric.label,
              icon: metric.icon,
              color: metric.color,
              value: response.data[today].value,
              timestamp: response.data[today].timestamp
            });
          }
        }
      }
      
      // Sort by timestamp (most recent first)
      allData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setTodayData(allData);
    } catch (err) {
      console.error('Error loading today data:', err);
      setError('Failed to load today\'s data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayData();
  }, [userId]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatValue = (metric, value) => {
    switch (metric) {
      case 'water':
        return `${value.amount} ${value.unit}`;
      case 'sleep':
        return `${value.hours} hours ${value.minutes} minutes`;
      case 'steps':
        return `${value.count} steps`;
      case 'meditation':
        return `${value.duration} minutes`;
      case 'mood':
        return `${value.rating}/10`;
      default:
        return JSON.stringify(value);
    }
  };

  const getEmptyState = () => (
    <div className="vitals-today-empty">
      <div className="vitals-today-empty-icon">📅</div>
      <h3>No data logged today</h3>
      <p>Start tracking your vitals to see your daily timeline here!</p>
    </div>
  );

  if (loading) {
    return (
      <div className="vitals-today-container">
        <div className="vitals-today-header">
          <h2>Today's Timeline</h2>
          <span className="vitals-today-date">{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
        <div className="vitals-loading">Loading today's data...</div>
      </div>
    );
  }

  return (
    <div className="vitals-today-container">
      <div className="vitals-today-header">
        <h2>Today's Timeline</h2>
        <span className="vitals-today-date">{new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</span>
      </div>
      
      {error && (
        <div className="vitals-error">
          {error}
        </div>
      )}

      {todayData.length === 0 ? (
        getEmptyState()
      ) : (
        <div className="vitals-today-timeline">
          {todayData.map((entry, index) => (
            <div key={index} className="vitals-today-entry">
              <div className="vitals-today-entry-time">
                {formatTime(entry.timestamp)}
              </div>
              <div className="vitals-today-entry-content">
                <div className="vitals-today-entry-icon" style={{ backgroundColor: entry.color }}>
                  {entry.icon}
                </div>
                <div className="vitals-today-entry-details">
                  <div className="vitals-today-entry-label">{entry.label}</div>
                  <div className="vitals-today-entry-value">
                    {formatValue(entry.metric, entry.value)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VitalsTodayTimeline; 