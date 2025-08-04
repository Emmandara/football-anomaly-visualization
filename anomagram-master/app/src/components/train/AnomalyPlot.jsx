import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Card = ({ children }) => <div className="p-4 rounded-xl shadow bg-white mb-4">{children}</div>;
const CardContent = ({ children }) => <div>{children}</div>;

export default function AnomalyPlot({ anomalyData }) {
  if (!anomalyData || Object.keys(anomalyData).length === 0) {
    return <div>No anomaly data available.</div>;
  }

  const data = Object.entries(anomalyData)
    .map(([file, summary]) => {
      const playerAnomalies = summary?.playerAnomalies || {};
      const values = Object.values(playerAnomalies).flat().filter(x => !isNaN(x));
      const avg = values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;
      return {
        match: file.split("/").pop().replace(".json", ""),
        avgAnomaly: parseFloat(avg.toFixed(3))
      };
    })
    .filter(d => d.avgAnomaly > 0); // hide zero-value matches

  return (
    <Card className="mt-6">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4">Average Anomaly Score per Match</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis
              dataKey="match"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={60}
              tick={{ fontSize: 10 }}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avgAnomaly" fill="rgba(106, 90, 205, 0.7)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
