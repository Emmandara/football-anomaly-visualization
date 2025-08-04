// utils/loaders.js

export async function loadAndSortMatchData(path) {
    const res = await fetch(path);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`❌ Failed to fetch ${path} (${res.status}):\n${text.slice(0, 300)}`);
    }
  
    let data = await res.json();
  
    if (!data[0]?.frame && Array.isArray(data)) {
      data = data.map((frame, i) => ({ ...frame, frame: i }));
      console.warn("⚠️ Frame numbers missing — auto-numbered frames from 0.");
    }
  
    data.sort((a, b) => a.frame - b.frame);
  
    console.log(`✅ Loaded and sorted ${data.length} frames from ${path}`);
    return data;
  }
  