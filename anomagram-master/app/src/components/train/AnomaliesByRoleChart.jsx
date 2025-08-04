import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const AnomaliesByRoleChart = ({ anomaliesByRole }) => {
  // Log received prop for debug (optional)
  console.log(" anomaliesByRole prop received:", anomaliesByRole);

  // Prepare data for chart using correct structure (array of objects)
  const chartData = anomaliesByRole.map(entry => ({
    role: entry.role,
    avgScore: parseFloat(entry.averageAnomaly.toFixed(4))
  }));

  return (
    <div className="my-8">
      <h3 className="text-lg font-semibold mb-4">Anomalies by Role</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="role" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="avgScore" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnomaliesByRoleChart;
