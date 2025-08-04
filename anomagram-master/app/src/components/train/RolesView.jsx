import React, { useEffect, useState } from "react";
import "./RolesView.css";
import PlayerAnomalyChart from "./PlayerAnomalyChart";
import AnomaliesByRoleChart from "./AnomaliesByRoleChart";
import ComparePlayerBehaviorChart from "./ComparePlayerBehaviorChart";
import TacticalChangeChart from "./TacticalChangeChart";
import AnomalyHeatmap from "./AnomalyHeatmap";
import { loadAndSortMatchData } from "../../utils/loaders";

function computeRoleConsistencyFromFrames(frames) {
  const totalFrames = frames.length;
  const allPlayerIds = new Set();

  frames.forEach(frame => {
    const roles = frame.roles || {};
    Object.keys(roles).forEach(pid => allPlayerIds.add(pid));
  });

  const consistencyData = [];

  for (const pid of allPlayerIds) {
    const roleTimeline = [];

    for (let i = 0; i < totalFrames; i++) {
      const roles = frames[i].roles || {};
      roleTimeline.push(roles[pid] ?? null);
    }

    const filtered = roleTimeline.filter(r => r !== null);
    if (filtered.length < 2) continue;

    let changes = 0;
    let lastRole = filtered[0];

    for (let i = 1; i < filtered.length; i++) {
      if (filtered[i] !== lastRole) {
        changes++;
        lastRole = filtered[i];
      }
    }

    const roleCounts = {};
    filtered.forEach(role => {
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    const mostFrequentRole = Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])[0][0];

    const consistencyScore = 1 - changes / (filtered.length - 1);

    consistencyData.push({
      player: `Player ${pid}`,
      consistency: parseFloat(consistencyScore.toFixed(2)),
      primaryRole: mostFrequentRole,
      roleChanges: changes,
      roleTimeline: filtered
    });
  }

  return consistencyData;
}

function computeAnomaliesByRole(frames) {
  const roleSums = {};
  const roleCounts = {};

  frames.forEach(frame => {
    const { anomalies, roles } = frame;
    for (const pid in anomalies) {
      const role = roles[pid];
      const score = anomalies[pid];
      if (role) {
        if (!roleSums[role]) {
          roleSums[role] = 0;
          roleCounts[role] = 0;
        }
        roleSums[role] += score;
        roleCounts[role] += 1;
      }
    }
  });

  return Object.keys(roleSums).map(role => ({
    role,
    averageAnomaly: parseFloat((roleSums[role] / roleCounts[role]).toFixed(2))
  }));
}

const matchFiles = [
  "ARG_CRO_000737_combined.json",
  "ARG_CRO_225412_combined.json",
  "ARG_FRA_183303_combined.json",
  "ARG_FRA_184210_combined.json",
  "BRA_KOR_230503_combined.json",
  "CRO_MOR_190500_combined.json",
  "FRA_MOR_220726_combined.json",
  "NET_ARG_004041_combined.json",
  "MOR_POR_180940_combined.json",
  "MOR_POR_184642_combined.json",
  "MOR_POR_193202_combined.json",
  "ENG_FRA_223104_combined.json",
  "ENG_FRA_231427_combined.json"
];

const RolesView = () => {
  const [selectedMatch, setSelectedMatch] = useState(matchFiles[0]);
  const [playerAnomalyScores, setPlayerAnomalyScores] = useState({});
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [anomaliesByRole, setAnomaliesByRole] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [playerRolesOverTime, setPlayerRolesOverTime] = useState([]);
  const [roleChangeSummary, setRoleChangeSummary] = useState(null);

  useEffect(() => {
    const loadMatchData = async (path) => {
      try {
        const data = await loadAndSortMatchData(`/data/ecg/output_combined/${path}`);

        const anomalyScores = {};
        data.forEach(frame => {
          const anomalies = frame.anomalies || {};
          for (const [pid, score] of Object.entries(anomalies)) {
            if (!anomalyScores[pid]) anomalyScores[pid] = [];
            anomalyScores[pid].push(score);
          }
        });

        setPlayerAnomalyScores(anomalyScores);
        setSelectedPlayerId(Object.keys(anomalyScores)[0] || null);
        setAnomaliesByRole(computeAnomaliesByRole(data));
        setComparisonData(computeRoleConsistencyFromFrames(data));
        setPlayerRolesOverTime(data);

        const roleChanges = {};
        data.forEach((frame, idx) => {
          const roles = frame.roles || {};
          Object.entries(roles).forEach(([pid, role]) => {
            if (!roleChanges[pid]) roleChanges[pid] = [];
            roleChanges[pid].push({ frame: idx, role });
          });
        });

        const changesSummary = [];
        for (const [pid, history] of Object.entries(roleChanges)) {
          const seen = new Set();
          const changes = [];
          let lastRole = null;
          history.forEach(({ frame, role }) => {
            if (role !== lastRole) {
              seen.add(role);
              changes.push(`f${frame}: ${role}`);
              lastRole = role;
            }
          });
          if (seen.size > 1) {
            changesSummary.push(`Player ${pid} → ${Array.from(seen).join(", ")} at ${changes.join(", ")}`);
          }
        }

        setRoleChangeSummary(
          changesSummary.length > 0
            ? `🔁 ${changesSummary.length} player(s) changed roles:\n` + changesSummary.join("\n")
            : "❌ No players changed roles in this match."
        );

      } catch (err) {
        console.error("Failed to load or parse match data:", err);
      }
    };

    loadMatchData(selectedMatch);
  }, [selectedMatch]);

  return (
    <div className="roles-view-container">
      <h2 className="text-xl font-bold mb-4">Roles View</h2>

      <div className="mb-4">
        <label className="mr-2 font-medium">Select Match:</label>
        <select
          value={selectedMatch}
          onChange={(e) => setSelectedMatch(e.target.value)}
          className="border p-1 rounded"
        >
          {matchFiles.map((file) => (
            <option key={file} value={file}>
              {file.replace("_combined.json", "")}
            </option>
          ))}
        </select>
      </div>

      {Object.keys(playerAnomalyScores).length > 0 && (
        <div className="mb-4">
          <label className="mr-2 font-medium">Select Player:</label>
          <select
            value={selectedPlayerId || ""}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="border p-1 rounded"
          >
            {Object.keys(playerAnomalyScores).map(pid => (
              <option key={pid} value={pid}>Player {pid}</option>
            ))}
          </select>
        </div>
      )}

      {roleChangeSummary && (
        <pre className="mb-4 text-sm text-blue-700 bg-blue-100 p-2 rounded whitespace-pre-wrap font-mono">
          {roleChangeSummary.split('\n').map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </pre>
      )}

      {selectedPlayerId && (
        <div className="chart-wrapper">
          <PlayerAnomalyChart
            playerId={selectedPlayerId}
            scores={playerAnomalyScores[selectedPlayerId]}
          />
        </div>
      )}

      {anomaliesByRole && (
        <div className="chart-wrapper">
          <AnomaliesByRoleChart anomaliesByRole={anomaliesByRole} />
        </div>
      )}

      {comparisonData && comparisonData.length > 0 && (
        <div className="chart-wrapper">
          <ComparePlayerBehaviorChart comparisonData={comparisonData} />
        </div>
      )}

      {playerRolesOverTime && playerRolesOverTime.length > 0 && (
        <div className="tactical-chart-container">
          <TacticalChangeChart rolesOverTime={playerRolesOverTime} />
        </div>
      )}

      {selectedMatch && (
        <div className="chart-wrapper">
          <AnomalyHeatmap matchFile={selectedMatch} />
        </div>
      )}
    </div>
  );
};

export default RolesView;
