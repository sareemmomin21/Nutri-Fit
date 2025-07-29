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

// Target values for each metric
const TARGET_VALUES = {
  water: 64, // oz
  sleep: 8,  // hours
  steps: 10000, // steps
};

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
      if (metric === 'water') {
        value = data[dateString].amount || 0;
      } else if (metric === 'sleep') {
        value = (data[dateString].hours || 0) + (data[dateString].minutes || 0) / 60;
      } else if (metric === 'steps') {
        value = data[dateString].steps || 0;
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

  // Get target value for the current metric
  const targetValue = TARGET_VALUES[metric] || 0;
  
  // Create target line data (same value for all labels)
  const targetLineData = labels.map(() => targetValue);

  const chartConfig = {
    labels,
    datasets: [
      {
        label: metric === 'water' ? 'Water (L)' : metric === 'sleep' ? 'Sleep (hrs)' : 'Steps',
        data: chartData,
        fill: false,
        borderColor: '#4f8cff',
        backgroundColor: '#4f8cff',
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 5,
        spanGaps: true, // Connect points even with null values
        order: 1, // Main data line appears on top
      },
      {
        label: 'Target',
        data: targetLineData,
        fill: false,
        borderColor: '#ff6b6b',
        backgroundColor: '#ff6b6b',
        borderDash: [5, 5], // Dashed line
        tension: 0,
        pointRadius: 0, // No points on target line
        spanGaps: false,
        order: 0, // Target line appears behind main data
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
            if (context.datasetIndex === 0) { // Main data
              if (metric === 'water') {
                return `Water: ${value} ${data.unit || 'oz'}`;
              } else if (metric === 'sleep') {
                return `Sleep: ${value.toFixed(1)} hours`;
              } else if (metric === 'steps') {
                return `Steps: ${value.toLocaleString()}`;
              }
              return `${context.dataset.label}: ${value}`;
            } else { // Target line
              if (metric === 'water') {
                return `Target: ${value} oz`;
              } else if (metric === 'sleep') {
                return `Target: ${value} hours`;
              } else if (metric === 'steps') {
                return `Target: ${value.toLocaleString()} steps`;
              }
              return `Target: ${value}`;
            }
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
          <p>Target: {metric === 'water' ? `${targetValue} oz` : metric === 'sleep' ? `${targetValue} hours` : `${targetValue.toLocaleString()} steps`}</p>
        </div>
      )}
    </div>
  );
};

export default VitalsChart;
