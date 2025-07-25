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

// Mock data for demonstration
const MOCK_DATA = {
  water: {
    '1w': [2, 2.5, 3, 2.8, 2.2, 3, 2.7],
    '1m': Array(30).fill().map(() => 2 + Math.random()),
    '3m': Array(90).fill().map(() => 2 + Math.random()),
    '6m': Array(180).fill().map(() => 2 + Math.random()),
    '1y': Array(365).fill().map(() => 2 + Math.random()),
  },
  sleep: {
    '1w': [7, 6.5, 8, 7.2, 7.8, 6.9, 7.5],
    '1m': Array(30).fill().map(() => 6 + Math.random() * 2),
    '3m': Array(90).fill().map(() => 6 + Math.random() * 2),
    '6m': Array(180).fill().map(() => 6 + Math.random() * 2),
    '1y': Array(365).fill().map(() => 6 + Math.random() * 2),
  },
};

const getLabels = (range) => {
  const today = new Date();
  let days = 7;
  if (range === '1m') days = 30;
  if (range === '3m') days = 90;
  if (range === '6m') days = 180;
  if (range === '1y') days = 365;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
};

const VitalsChart = ({ metric, range }) => {
  const dataArr = MOCK_DATA[metric]?.[range] || [];
  const labels = getLabels(range);

  const chartData = {
    labels,
    datasets: [
      {
        label: metric === 'water' ? 'Water (L)' : 'Sleep (hrs)',
        data: dataArr,
        fill: false,
        borderColor: '#4f8cff',
        backgroundColor: '#4f8cff',
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
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
      },
    },
  };

  return (
    <div className="vitals-chart-card">
      {dataArr.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <div className="vitals-no-data">No data available for this range.</div>
      )}
    </div>
  );
};

export default VitalsChart;
