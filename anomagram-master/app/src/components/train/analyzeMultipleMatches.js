export default async function analyzeMultipleMatches(testFiles, fetchData,inMemoryTestData  ) {
  const results = {};

  for (const file of testFiles) {
    try {
      let matchData;
if (inMemoryTestData[file]) {
  console.log(` Using in-memory data for ${file}`);
  matchData = inMemoryTestData[file];
} else {
  matchData = await fetchData(`/data/ecg/output_normalized/${file}`);
}


      
      const hasAnomalies = matchData.some(
        (f) => f.anomalies && Object.keys(f.anomalies).length > 0
      );
      if (!hasAnomalies) {
        console.warn(` Skipping ${file} — no anomalies found`);
        continue;
      }

      const playerAnomalies = {};
      const rolesOverTime = [];

      matchData.forEach((frame, idx) => {
        if (!frame.anomalies || Object.keys(frame.anomalies).length === 0) {
          console.warn(`⚠️ No anomalies in frame ${idx} of ${file}`);
        }

        if (frame.anomalies) {
          for (const [playerId, score] of Object.entries(frame.anomalies)) {
            if (!playerAnomalies[playerId]) playerAnomalies[playerId] = [];
            playerAnomalies[playerId][idx] = score;
          }
        }

        
        rolesOverTime.push({
          frame: idx,
          roles: frame.roles || {}
        });
      });

      const flatRoles = rolesOverTime.map((entry) => entry.roles);

      //  Average anomaly score per player
      const comparisonData = [];
      for (const [playerId, scores] of Object.entries(playerAnomalies)) {
        const valid = scores.filter((s) => s !== undefined);
        const avg =
          valid.length > 0
            ? valid.reduce((sum, v) => sum + v, 0) / valid.length
            : 0;
        comparisonData.push({
          matchId: file.replace("_normalized.json", ""),
          playerId,
          averageScore: parseFloat(avg.toFixed(3))
        });
      }

      results[file] = {
        playerAnomalies,
        rolesOverTime,
        flatRoles,
        comparisonData
      };

      console.log(" Attached comparisonData to", file, comparisonData);
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }

  return results;
}
