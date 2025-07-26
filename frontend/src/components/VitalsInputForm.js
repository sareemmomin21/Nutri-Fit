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
const VitalsInputForm = ({ metric, onSubmit }) => {
  const [waterAmount, setWaterAmount] = useState('');
  const [waterUnit, setWaterUnit] = useState('oz');
  const [sleepHours, setSleepHours] = useState('');
  const [sleepMinutes, setSleepMinutes] = useState('');
  const [steps, setSteps] = useState('');
  const [error, setError] = useState('');

  // Placeholder target values for demonstration
  const targets = {
    water: { value: 64, unit: 'oz', helper: '8 glasses = 64 oz' },
    sleep: { value: 8, unit: 'hours', helper: 'Recommended: 7-9 hours' },
    steps: { value: 10000, unit: 'steps', helper: '10,000 steps = active day' },
  };
  const target = targets[metric] || {};

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
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
            />
          </div>
          <div className="vitals-form-group">
            <label className="vitals-form-label">Unit</label>
            <select
              className="vitals-form-input-wide"
              value={waterUnit}
              onChange={e => setWaterUnit(e.target.value)}
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
            />
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
      <button type="submit" className="vitals-form-submit-wide">
        + Log {metric.charAt(0).toUpperCase() + metric.slice(1)}
      </button>
    </form>
  );
};

export default VitalsInputForm;
