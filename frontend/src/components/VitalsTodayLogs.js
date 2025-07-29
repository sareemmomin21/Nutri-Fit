import React, { useState, useEffect } from 'react';
import vitalsApi from '../services/vitalsApi';
import '../components/styles/Vitals.css';

const VitalsTodayLogs = ({ userId, metricType }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const metricIcons = {
    water: '💧',
    sleep: '🌙',
    steps: '👟',
    meditation: '🧘',
    mood: '😊'
  };

  const metricLabels = {
    water: 'Water',
    sleep: 'Sleep',
    steps: 'Steps',
    meditation: 'Meditation',
    mood: 'Mood'
  };

  const formatValue = (value, metricType) => {
    switch (metricType) {
      case 'water':
        return `${value} oz`;
      case 'sleep':
        return `${value} hours`;
      case 'steps':
        return `${value} steps`;
      case 'meditation':
        return `${value} minutes`;
      case 'mood':
        return `${value}/10`;
      default:
        return value;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const loadTodayLogs = async () => {
    if (!userId || !metricType) return;

    setLoading(true);
    setError(null);

    try {
      const response = await vitalsApi.getTodayVitalsLogs(userId, metricType);
      if (response.success) {
        setLogs(response.logs);
      } else {
        setError('Failed to load today\'s logs');
      }
    } catch (err) {
      console.error('Error loading today\'s logs:', err);
      setError('Failed to load today\'s logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayLogs();
  }, [userId, metricType]);

  if (loading) {
    return (
      <div className="vitals-today-logs">
        <div className="vitals-today-logs-header">
          <span className="vitals-today-logs-icon">{metricIcons[metricType]}</span>
          <span className="vitals-today-logs-title">Today's {metricLabels[metricType]} Logs</span>
        </div>
        <div className="vitals-today-logs-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vitals-today-logs">
        <div className="vitals-today-logs-header">
          <span className="vitals-today-logs-icon">{metricIcons[metricType]}</span>
          <span className="vitals-today-logs-title">Today's {metricLabels[metricType]} Logs</span>
        </div>
        <div className="vitals-today-logs-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="vitals-today-logs">
      <div className="vitals-today-logs-header">
        <span className="vitals-today-logs-icon">{metricIcons[metricType]}</span>
        <span className="vitals-today-logs-title">Today's {metricLabels[metricType]} Logs</span>
        <span className="vitals-today-logs-count">({logs.length} entries)</span>
      </div>
      
      {logs.length === 0 ? (
        <div className="vitals-today-logs-empty">
          <span className="vitals-today-logs-empty-icon">📝</span>
          <span className="vitals-today-logs-empty-text">No {metricLabels[metricType].toLowerCase()} logged today</span>
        </div>
      ) : (
        <div className="vitals-today-logs-list">
          {logs.map((log, index) => (
            <div key={index} className="vitals-today-logs-entry">
              <div className="vitals-today-logs-entry-time">
                {formatTime(log.timestamp)}
              </div>
              <div className="vitals-today-logs-entry-content">
                <span className="vitals-today-logs-entry-value">
                  {formatValue(log.value, metricType)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VitalsTodayLogs; 