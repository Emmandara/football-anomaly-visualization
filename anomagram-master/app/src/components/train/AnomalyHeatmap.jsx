import React, { useEffect, useRef } from "react";

const AnomalyHeatmap = ({ matchFile }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const loadAndRender = async () => {
      console.log(" Fetching match file:", matchFile);
      let res, frames;
      try {
        res = await fetch(`/data/ecg/output_combined/${matchFile}`);
        frames = await res.json();
        frames.sort((a, b) => a.frame - b.frame);
        console.log(" Loaded match file:", matchFile);
        console.log(" Total frames:", frames.length);
      } catch (err) {
        const text = await res.text();
        console.error(" Failed to parse JSON — file is not valid.");
        console.error("Response content preview:", text.slice(0, 300));
        return;
      }

      const pitchWidth = 700;
      const pitchHeight = 450;
      const gridX = 70, gridY = 45;
      const heatmap = Array.from({ length: gridY }, () => Array(gridX).fill(0));
      const counts = Array.from({ length: gridY }, () => Array(gridX).fill(0));
      let totalValidFrames = 0;
      let totalSkipped = 0;

      let rightSideDominance = 0;
      let detectionSamples = 0;

      for (const frame of frames) {
        const data = frame.unnormalized_data;
        const anomalies = frame.anomalies;
        if (!data || !anomalies) {
          totalSkipped++;
          continue;
        }

        totalValidFrames++;
        let rightCount = 0;

        for (let i = 0; i < 21; i++) {
          const x = data[i * 2];
          const y = data[i * 2 + 1];
          const scoreRaw = anomalies[i.toString()];

          if (
            x < 0 || y < 0 ||
            isNaN(x) || isNaN(y) ||
            scoreRaw === undefined || isNaN(scoreRaw)
          ) {
            continue;
          }

          if (x > 960) rightCount++; 

          const scaledX = (x / 1920) * pitchWidth;
          const scaledY = (y / 1080) * pitchHeight;

          const gx = Math.floor((scaledX * gridX) / pitchWidth);
          const gy = Math.floor((scaledY * gridY) / pitchHeight);

          if (gx >= 0 && gx < gridX && gy >= 0 && gy < gridY) {
            heatmap[gy][gx] += scoreRaw;
            counts[gy][gx] += 1;
          }
        }

        if (rightCount > 0) {
          detectionSamples++;
          if (rightCount > 10) rightSideDominance++;
        }
      }

      const flipHorizontally = rightSideDominance < detectionSamples / 2;
      console.log("Flip pitch left-to-right?", flipHorizontally);

      console.log(" Total valid frames used:", totalValidFrames);
      console.log(" Skipped frames:", totalSkipped);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const cellWidth = canvas.width / gridX;
      const cellHeight = canvas.height / gridY;

      ctx.fillStyle = "#006400";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let painted = 0;
      for (let y = 0; y < gridY; y++) {
        for (let x = 0; x < gridX; x++) {
          const avg = counts[y][x] > 0 ? heatmap[y][x] / counts[y][x] : 0;
          const intensity = Math.min(255, Math.floor(avg * 100));
          const alpha = intensity / 255;
          if (alpha > 0) {
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
            const drawX = flipHorizontally ? canvas.width - (x + 1) * cellWidth : x * cellWidth;
            ctx.fillRect(drawX, y * cellHeight, cellWidth, cellHeight);
            painted++;
          }
        }
      }

      console.log(" Total heatmap cells painted:", painted);

      // Midline
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      // Arrow for attack direction
      ctx.fillStyle = "white";
      ctx.strokeStyle = "white";
      ctx.font = "16px Arial";

      const arrowStartX = flipHorizontally ? canvas.width - 150 : 50;
      const arrowEndX = flipHorizontally ? canvas.width - 50 : 150;

      ctx.beginPath();
      ctx.moveTo(arrowStartX, canvas.height - 30);
      ctx.lineTo(arrowEndX, canvas.height - 30);
      ctx.lineTo(arrowEndX - 10, canvas.height - 35);
      ctx.moveTo(arrowEndX, canvas.height - 30);
      ctx.lineTo(arrowEndX - 10, canvas.height - 25);
      ctx.stroke();
      ctx.fillText("→ Attacking Direction", arrowEndX - 20, canvas.height - 40);
    };

    loadAndRender();
  }, [matchFile]);

  return (
    <div className="chart-wrapper">
      <h3 className="text-lg font-semibold mb-2">Pitch Heatmap (Anomaly)</h3>
      <canvas ref={canvasRef} width={700} height={450} style={{ border: "1px solid #ccc" }} />
    </div>
  );
};

export default AnomalyHeatmap;
