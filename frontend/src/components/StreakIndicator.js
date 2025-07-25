import React from 'react';
import './styles/Vitals.css';

const StreakIndicator = ({ streak }) => {
  if (!streak || streak <= 0) return null;

  return (
    <div className="streak-indicator">
      <img src={process.env.PUBLIC_URL + '/fire.jpg'} alt="Streak Fire" className="streak-fire-icon" />
      <span className="streak-number">{streak}</span>
    </div>
  );
};

export default StreakIndicator;
