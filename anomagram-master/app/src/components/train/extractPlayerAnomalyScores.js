export default function extractPlayerAnomalyScores(matchSummaries) {
    const scores = {};
    Object.values(matchSummaries).forEach((match) => {
      Object.entries(match.playerAnomalies || {}).forEach(([playerId, playerScores]) => {
        if (!scores[playerId]) scores[playerId] = [];
        scores[playerId] = scores[playerId].concat(playerScores);
      });
    });
    return scores;
  }
  