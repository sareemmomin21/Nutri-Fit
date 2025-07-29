import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './styles/Vitals.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Helper function to convert vitals data to chart format
const processVitalsData = (data, metric, range) => {
  if (!data || Object.keys(data).length === 0) {
    return { labels: [], data: [] };
  }

  const today = new Date();
  let days = 7;
  if (range === '1m') days = 30;
  if (range === '3m') days = 90;
  if (range === '6m') days = 180;
  if (range === '1y') days = 365;

  const labels = [];
  const chartData = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    const label = `${date.getMonth() + 1}/${date.getDate()}`;
    
    labels.push(label);
    
    if (data[dateString]) {
      let value = 0;
      
      // Handle new data structure with multiple entries per day
      if (Array.isArray(data[dateString])) {
        // Multiple entries - aggregate them
        const values = data[dateString].map(entry => {
          const valueData = entry.value;
          if (metric === 'water') {
            return valueData.amount || 0;
          } else if (metric === 'sleep') {
            return (valueData.hours || 0) + (valueData.minutes || 0) / 60;
          } else if (metric === 'steps') {
            return valueData.steps || 0;
          } else if (metric === 'meditation') {
            return valueData.minutes || 0;
          } else if (metric === 'mood') {
            return valueData.rating || 0;
          }
          return 0;
        });
        
        if (metric === 'mood') {
          // For mood, average the values
          value = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        } else {
          // For other metrics, sum the values
          value = values.reduce((a, b) => a + b, 0);
        }
      } else {
        // Single entry (backward compatibility)
        const valueData = data[dateString].value || data[dateString];
        if (metric === 'water') {
          value = valueData.amount || 0;
        } else if (metric === 'sleep') {
          value = (valueData.hours || 0) + (valueData.minutes || 0) / 60;
        } else if (metric === 'steps') {
          value = valueData.steps || 0;
        } else if (metric === 'meditation') {
          value = valueData.minutes || 0;
        } else if (metric === 'mood') {
          value = valueData.rating || 0;
        }
      }
      
      chartData.push(value);
    } else {
      chartData.push(null); // No data for this day
    }
  }

  return { labels, data: chartData };
};

const VitalsChart = ({ metric, range, data = {} }) => {
  const { labels, data: chartData } = processVitalsData(data, metric, range);
  
  // Filter out null values for better chart display
  const filteredData = chartData.filter(val => val !== null);
  const hasData = filteredData.length > 0;

  const chartConfig = {
    labels,
    datasets: [
      {
        label: metric === 'water' ? 'Water (oz)' : 
               metric === 'sleep' ? 'Sleep (hrs)' : 
               metric === 'steps' ? 'Steps' :
               metric === 'meditation' ? 'Meditation (min)' :
               metric === 'mood' ? 'Mood Rating' : 'Value',
        data: chartData,
        fill: false,
        borderColor: '#4f8cff',
        backgroundColor: '#4f8cff',
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        spanGaps: true, // Connect points even with null values
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            if (metric === 'water') {
              return `Water: ${value} ${data.unit || 'oz'}`;
            } else if (metric === 'sleep') {
              return `Sleep: ${value.toFixed(1)} hours`;
            } else if (metric === 'steps') {
              return `Steps: ${value.toLocaleString()}`;
            } else if (metric === 'meditation') {
              return `Meditation: ${value} minutes`;
            } else if (metric === 'mood') {
              return `Mood: ${value}/10`;
            }
            return `${context.dataset.label}: ${value}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#888',
          maxTicksLimit: 7,
        },
      },
      y: {
        grid: {
          color: '#f0f0f0',
        },
        ticks: {
          color: '#888',
        },
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div className="vitals-chart-card">
      {hasData ? (
        <Line data={chartConfig} options={options} />
      ) : (
        <div className="vitals-no-data">
          <p>No data available for this range.</p>
          <p>Log your first {metric} entry to see your progress!</p>
        </div>
      )}
    </div>
  );
};

export default VitalsChart;
