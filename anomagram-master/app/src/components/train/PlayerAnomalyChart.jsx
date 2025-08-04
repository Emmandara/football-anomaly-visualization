import React from 'react';
import { Line } from 'react-chartjs-2';  
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale
);


function PlayerAnomalyChart({ scores, playerId, threshold = 0.02 }) {
  if (!scores || typeof scores !== 'object') {
    return <p>No player anomaly data available.</p>;
  }

  // Sort by frame index to keep order consistent
  const frameIndices = Object.keys(scores).sort((a, b) => Number(a) - Number(b));
  const values = frameIndices.map((frame) => scores[frame]);

  const labels = frameIndices.map((frame) => `Frame ${frame}`);
  const data = {
    labels,
    datasets: [
      {
        label: `Player ${playerId} Anomaly Score`,
        data: values,
        borderColor: 'blue',
        backgroundColor: 'lightblue',
        tension: 0.2,
      },
      {
        label: 'Threshold',
        data: Array(values.length).fill(threshold),
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
