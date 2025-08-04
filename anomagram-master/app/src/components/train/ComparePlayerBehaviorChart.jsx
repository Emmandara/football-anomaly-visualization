import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow text-sm">
        <strong>{data.player}</strong><br />
        Role Consistency: {data.consistency}<br />
        Primary Role: {data.primaryRole}<br />
        {data.roleChanges > 0 && (
          <span role="img" aria-label="role-change"></span>
        )} {data.roleChanges > 0 ? `${data.roleChanges} role change(s)` : `No changes`}
      </div>
    );
  }
  return null;
};

const ComparePlayerBehaviorChart = ({ comparisonData }) => {
  if (!comparisonData || comparisonData.length === 0) {
    return <p className="text-gray-500">No comparison data available.</p>;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Compare Player Behavior Across Matches</h3>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonData}>
          <PolarGrid />
          <PolarAngleAxis
            dataKey="player"
            tick={({ payload, x, y, textAnchor, stroke }) => {
              const player = payload.value;
              const changes = comparisonData.find(d => d.player === player)?.roleChanges || 0;
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  fill={stroke}
                  fontSize="10"
                >
                  {changes > 0 ? ` ${player}` : player}
                </text>
              );
            }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 1]} />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name="Role Consistency"
            dataKey="consistency"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
      <p className="text-sm mt-2 text-gray-600">
        <span role="img" aria-label="role-change"></span> indicates a player who changed roles during the match.
      </p>
    </div>
  );
};

export default ComparePlayerBehaviorChart;
