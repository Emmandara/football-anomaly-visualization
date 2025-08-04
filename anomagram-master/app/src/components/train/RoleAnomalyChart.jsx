import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Dummy placeholder data
const dummyData = [
  { role: "Defender", score: 0.1 },
  { role: "Midfielder", score: 0.25 },
  { role: "Forward", score: 0.18 }
];

export default function RoleAnomalyChart() {
  return (
    <div className="w-full h-64">
      <h2 className="text-xl font-semibold mb-2">Anomalies by Role</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dummyData}>
          <XAxis dataKey="role" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="score" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
