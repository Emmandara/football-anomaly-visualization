import React from 'react';
import { Line } from 'react-chartjs-2';

const PlayerComparisonChart = ({ data }) => {
  if (!data || data.length === 0) return <p>No data available for comparison.</p>;

  // Compute per-player average scores across the match
  const matchSummaries = {
    currentMatch: data.reduce((acc, frame) => {
      for (let i = 0; i < 21; i++) {
        const x = frame[i * 2];
        const y = frame[i * 2 + 1];
        const dist = Math.sqrt(x * x + y * y);
        acc[i] = (acc[i] || 0) + dist;
      }
      return acc;
    }, Array(21).fill(0)).map((sum) => sum / data.length),
  };

  const playerIds = [...Array(21).keys()];
  const labels = playerIds.map((id) => `Player ${id}`);

  const datasets = Object.entries(matchSummaries).map(([matchName, scores], idx) => ({
    label: matchName,
    data: playerIds.map((id) => scores[id] ?? null),
    fill: false,
    tension: 0.4,
  }));

  return (
    <div className="my-6">
      <h3 className="text-lg font-semibold mb-2">Compare Player Behavior</h3>
      <Line
        data={{
          labels,
          datasets,
        }}
      />
    </div>
  );
};

export default PlayerComparisonChart;
