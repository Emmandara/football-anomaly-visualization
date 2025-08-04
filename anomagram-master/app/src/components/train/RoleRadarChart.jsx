import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

// Dummy placeholder data
const dummyData = [
  { role: "Defender", consistency: 80 },
  { role: "Midfielder", consistency: 65 },
  { role: "Forward", consistency: 70 }
];

export default function RoleRadarChart() {
  return (
    <div className="w-full h-64">
      <h2 className="text-xl font-semibold mb-2">Role Consistency Radar</h2>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dummyData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="role" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar name="Player" dataKey="consistency" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
