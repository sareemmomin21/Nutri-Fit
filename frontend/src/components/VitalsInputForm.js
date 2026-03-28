import React, { useState } from 'react';
import './styles/Vitals.css';

const WATER_UNITS = ['oz', 'ml', 'L'];

/**
 * VitalsInputForm
 * Props:
 *   - metric: string ('water', 'sleep', 'steps', etc.)
 *   - onSubmit: function(data) => void
 *
 * Timileyin: To support dark mode, adjust the classNames and CSS variables in Vitals.css.
 * Look for comments marked with 'THEME' for easy changes.
 */
const VitalsInputForm = ({ metric, onSubmit, loading = false }) => {
  const [waterAmount, setWaterAmount] = useState('');
  const [waterUnit, setWaterUnit] = useState('oz');
  const [sleepHours, setSleepHours] = useState('');
  const [sleepMinutes, setSleepMinutes] = useState('');
  const [steps, setSteps] = useState('');
  const [meditationMinutes, setMeditationMinutes] = useState('');
  const [moodRating, setMoodRating] = useState('');
  const [error, setError] = useState('');

  // Placeholder target values for demonstration
  const targets = {
    water: { value: 64, unit: 'oz', helper: '8 glasses = 64 oz' },
    sleep: { value: 8, unit: 'hours', helper: 'Recommended: 7-9 hours' },
    steps: { value: 10000, unit: 'steps', helper: '10,000 steps = active day' },
    meditation: { value: 20, unit: 'minutes', helper: 'Daily mindfulness practice' },
    mood: { value: 8, unit: 'rating', helper: 'Rate your mood (1-10)' },
  };
  const target = targets[metric] || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (loading) return;
    
    if (metric === 'water') {
      if (!waterAmount || isNaN(waterAmount) || Number(waterAmount) <= 0) {
        setError('Please enter a valid amount of water.');
        return;
      }
      onSubmit({ amount: Number(waterAmount), unit: waterUnit });
      setWaterAmount('');
    } else if (metric === 'sleep') {
      if (
        (sleepHours === '' && sleepMinutes === '') ||
        isNaN(sleepHours) ||
        isNaN(sleepMinutes) ||
        Number(sleepHours) < 0 ||
        Number(sleepMinutes) < 0 ||
        Number(sleepMinutes) > 59
      ) {
        setError('Please enter valid hours and minutes for sleep.');
        return;
      }
      onSubmit({
        hours: Number(sleepHours) || 0,
        minutes: Number(sleepMinutes) || 0,
      });
      setSleepHours('');
      setSleepMinutes('');
    } else if (metric === 'steps') {
      if (!steps || isNaN(steps) || Number(steps) < 0) {
        setError('Please enter a valid step count.');
        return;
      }
      onSubmit({ steps: Number(steps) });
      setSteps('');
    } else if (metric === 'meditation') {
      if (!meditationMinutes || isNaN(meditationMinutes) || Number(meditationMinutes) < 0) {
        setError('Please enter a valid meditation duration.');
        return;
      }
      onSubmit({ minutes: Number(meditationMinutes) });
      setMeditationMinutes('');
    } else if (metric === 'mood') {
      if (!moodRating || isNaN(moodRating) || Number(moodRating) < 1 || Number(moodRating) > 10) {
        setError('Please enter a valid mood rating between 1 and 10.');
        return;
      }
      onSubmit({ rating: Number(moodRating) });
      setMoodRating('');
    }
  };

  let formFields = null;
  if (metric === 'water') {
    formFields = (
      <>
        <div className="vitals-form-row-wide">
          <div className="vitals-form-group">
            <label className="vitals-form-label">Amount</label>
            <input
              type="number"
              min="0"
              step="0.1"
              className="vitals-form-input-wide"
              value={waterAmount}
              onChange={e => setWaterAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={loading}
            />
          </div>
          <div className="vitals-form-group">
            <label className="vitals-form-label">Unit</label>
            <select
              className="vitals-form-input-wide"
              value={waterUnit}
              onChange={e => setWaterUnit(e.target.value)}
              disabled={loading}
            >
              {WATER_UNITS.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="vitals-form-helper-row">
          <span className="vitals-form-helper">Target: {target.value} {target.unit} daily</span>
          <span className="vitals-form-helper">{target.helper}</span>
        </div>
      </>
    );
  } else if (metric === 'sleep') {
    formFields = (
      <>
        <div className="vitals-form-row-wide">
          <div className="vitals-form-group">
            <label className="vitals-form-label">Hours</label>
            <input
              type="number"
              min="0"
              max="24"
              className="vitals-form-input-wide"
              value={sleepHours}
              onChange={e => setSleepHours(e.target.value)}
              placeholder="Hours"
              disabled={loading}
            />
          </div>
          <div className="vitals-form-group">
            <label className="vitals-form-label">Minutes</label>
            <input
              type="number"
              min="0"
              max="59"
              className="vitals-form-input-wide"
              value={sleepMinutes}
              onChange={e => setSleepMinutes(e.target.value)}
              placeholder="Minutes"
              disabled={loading}
            />
          </div>
        </div>
        <div className="vitals-form-helper-row">
          <span className="vitals-form-helper">Target: {target.value} {target.unit}</span>
          <span className="vitals-form-helper">{target.helper}</span>
        </div>
      </>
    );
  } else if (metric === 'steps') {
    formFields = (
      <>
        <div className="vitals-form-row-wide">
          <div className="vitals-form-group">
            <label className="vitals-form-label">Steps</label>
            <input
              type="number"
              min="0"
              className="vitals-form-input-wide"
              value={steps}
              onChange={e => setSteps(e.target.value)}
              placeholder="e.g. 10000"
              disabled={loading}
            />
          </div>
        </div>
        <div className="vitals-form-helper-row">
          <span className="vitals-form-helper">Target: {target.value} {target.unit}</span>
          <span className="vitals-form-helper">{target.helper}</span>
        </div>
      </>
    );
  } else if (metric === 'meditation') {
    formFields = (
      <>
        <div className="vitals-form-row-wide">
          <div className="vitals-form-group">
            <label className="vitals-form-label">Minutes</label>
            <input
              type="number"
              min="0"
              max="480"
              className="vitals-form-input-wide"
              value={meditationMinutes}
              onChange={e => setMeditationMinutes(e.target.value)}
              placeholder="e.g. 20"
              disabled={loading}
            />
          </div>
        </div>
        <div className="vitals-form-helper-row">
          <span className="vitals-form-helper">Target: {target.value} {target.unit}</span>
          <span className="vitals-form-helper">{target.helper}</span>
        </div>
      </>
    );
  } else if (metric === 'mood') {
    formFields = (
      <>
        <div className="vitals-form-row-wide">
          <div className="vitals-form-group">
            <label className="vitals-form-label">Mood Rating (1-10)</label>
            <select
              className="vitals-form-input-wide"
              value={moodRating}
              onChange={e => setMoodRating(e.target.value)}
              disabled={loading}
            >
              <option value="">Select your mood</option>
              <option value="1">1 - Very Poor</option>
              <option value="2">2 - Poor</option>
              <option value="3">3 - Below Average</option>
              <option value="4">4 - Average</option>
              <option value="5">5 - Neutral</option>
              <option value="6">6 - Above Average</option>
              <option value="7">7 - Good</option>
              <option value="8">8 - Very Good</option>
              <option value="9">9 - Excellent</option>
              <option value="10">10 - Outstanding</option>
            </select>
          </div>
        </div>
        <div className="vitals-form-helper-row">
          <span className="vitals-form-helper">Target: {target.value} {target.unit}</span>
          <span className="vitals-form-helper">{target.helper}</span>
        </div>
      </>
    );
  } else {
    formFields = <div>Tracking for this metric coming soon!</div>;
  }

  return (
    <form className="vitals-form-card-wide" onSubmit={handleSubmit}>
      {/* THEME: Card background, border, and shadow can be adjusted for dark/light mode */}
      <h3 className="vitals-form-title">Log {metric.charAt(0).toUpperCase() + metric.slice(1)}</h3>
      {formFields}
      {error && <div className="vitals-form-error">{error}</div>}
      <button 
        type="submit" 
        className="vitals-form-submit-wide"
        disabled={loading}
      >
        {loading ? 'Logging...' : `+ Log ${metric.charAt(0).toUpperCase() + metric.slice(1)}`}
      </button>
    </form>
  );
};

export default VitalsInputForm;
