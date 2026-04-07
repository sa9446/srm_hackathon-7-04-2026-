import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartsSection = ({ historyData }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
        ticks: { color: '#94a3b8' }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const dates = historyData.map(d => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }));
  
  const scoreData = {
    labels: dates,
    datasets: [
      {
        label: 'Gig Score',
        data: historyData.map(d => d.scoreImpact + 700), // simplified
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#1e293b',
        pointBorderColor: '#10b981',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const earningsData = {
    labels: dates,
    datasets: [
      {
        label: 'Daily Earnings (₹)',
        data: historyData.map(d => d.earnings),
        backgroundColor: '#06b6d4',
        borderRadius: 6,
        barPercentage: 0.6,
      }
    ]
  };

  return (
    <div className="charts-grid">
      <div className="glass-panel chart-container">
        <h3 className="chart-title">Gig Score Trend</h3>
        <div className="chart-body">
          <Line options={chartOptions} data={scoreData} />
        </div>
      </div>
      
      <div className="glass-panel chart-container">
        <h3 className="chart-title">Daily Earnings</h3>
        <div className="chart-body">
          <Bar options={chartOptions} data={earningsData} />
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
