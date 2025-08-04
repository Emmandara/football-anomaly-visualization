import React from 'react';
import { Line } from 'react-chartjs-2';  

function PlayerAnomalyChart({ scores, playerId, threshold = 0.02 }) {
  const labels = scores.map((_, idx) => idx); /
  const data = {
    labels,
    datasets: [
      {
        label: `Player ${playerId} Anomaly Score`,
        data: scores,
        borderColor: 'blue',
        backgroundColor: 'lightblue',
        tension: 0.2,
      },
      {
        label: 'Threshold',
        data: Array(scores.length).fill(threshold),
        borderColor: 'red',
        borderDash: [5, 5],
        pointRadius: 0,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Anomaly Detection for Player ${playerId}` },
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  };

  return (
    <div className="p-4">
      <Line data={data} options={options} />
    </div>
  );
}

export default PlayerAnomalyChart;
