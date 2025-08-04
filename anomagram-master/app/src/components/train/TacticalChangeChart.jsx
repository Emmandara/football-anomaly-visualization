import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Helper to prepare stacked role data per frame
function computeRoleTimeline(frames) {
  const roleCountsPerFrame = frames.map((frame, index) => {
    const roleCounts = {};
    for (const pid in frame.roles) {
      const role = frame.roles[pid];
      if (!roleCounts[role]) {
        roleCounts[role] = 0;
      }
      roleCounts[role] += 1;
    }

    return { frame: index, ...roleCounts };
  });

  return roleCountsPerFrame;
}

const TacticalChangeChart = ({ rolesOverTime }) => {
  if (!rolesOverTime || rolesOverTime.length === 0) {
    return <p className="text-gray-500">No role data available.</p>;
  }

  const roleTimelineData = computeRoleTimeline(rolesOverTime);
  const allRoles = Array.from(
    new Set(roleTimelineData.flatMap((d) => Object.keys(d).filter((k) => k !== "frame")))
  );

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-2">Tactical Role Changes Over Time</h3>
      <div style={{ width: "100%", minHeight: "400px" }}>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={roleTimelineData}
            margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="frame"
              interval={Math.floor(roleTimelineData.length / 20)}
              tick={{ fontSize: 10 }}
            />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />
            {allRoles.map((role, index) => (
              <Line
                key={role}
                type="monotone"
                dataKey={role}
                stroke={`hsl(${(index * 67) % 360}, 70%, 50%)`}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TacticalChangeChart;
