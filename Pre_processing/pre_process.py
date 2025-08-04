import os
import pandas as pd
import numpy as np
import json

# === Config ===
CSV_FOLDER = "all_matches_csv"
JSON_OUTPUT_FOLDER = "json_output"
FRAME_WIDTH = 1920
FRAME_HEIGHT = 1080
os.makedirs(JSON_OUTPUT_FOLDER, exist_ok=True)

# === Inject synthetic anomalies ===
def inject_anomalies(data, severity=0.25, anomaly_rate=0.15):
    data = data.copy()
    num_anomalies = int(len(data) * anomaly_rate)
    indices = np.random.choice(len(data), size=num_anomalies, replace=False)

    for idx in indices:
        noise = np.random.normal(0, severity, size=data.shape[1])
        data[idx] += noise
    return data, indices

# === Convert data row to JSON-safe structure ===
def row_to_json(index, row, target="1"):
    return {
        "index": index,
        "data": [None if np.isnan(v) else float(v) for v in row],
        "target": target
    }

# === Convert CSV to JSON ===
def convert_csv_to_json(csv_path=None, inject=False, synthetic=False):
    if synthetic:
        num_frames = 1000
        synthetic_data = np.sin(np.linspace(0, 30 * np.pi, num_frames)).reshape(-1, 1)
        synthetic_data = np.repeat(synthetic_data, 42, axis=1)
        data = synthetic_data
        return [row_to_json(i, row, target="1") for i, row in enumerate(data)]

    df = pd.read_csv(csv_path)
    data = df.values
    data[:, ::2] /= FRAME_WIDTH    # normalize x
    data[:, 1::2] /= FRAME_HEIGHT  # normalize y

    if inject:
        data, anomaly_indices = inject_anomalies(data)
        return [row_to_json(i, row, target="0" if i in anomaly_indices else "1") for i, row in enumerate(data)]
    else:
        return [row_to_json(i, row, target="1") for i, row in enumerate(data)]

# === Main Loop ===
csv_files = sorted(os.listdir(CSV_FOLDER))
for i, filename in enumerate(csv_files):
    if not filename.endswith(".csv"):
        continue

    base = os.path.splitext(filename)[0]
    csv_path = os.path.join(CSV_FOLDER, filename)

    # Save clean version
    normal = convert_csv_to_json(csv_path)
    with open(os.path.join(JSON_OUTPUT_FOLDER, f"{base}.json"), "w") as f:
        json.dump(normal, f)
    print(f"✅ Saved: {base}.json")

    # Save anomaly-injected version for first file only
    if i == 0:
        anomalous = convert_csv_to_json(csv_path, inject=True)
        with open(os.path.join(JSON_OUTPUT_FOLDER, f"{base}_anomalous.json"), "w") as f:
            json.dump(anomalous, f)
        print(f"✅ Saved: {base}_anomalous.json")

# === Synthetic test set ===
synthetic = convert_csv_to_json(synthetic=True)
with open(os.path.join(JSON_OUTPUT_FOLDER, "synthetic_test.json"), "w") as f:
    json.dump(synthetic, f)
print("✅ Saved: synthetic_test1.json")
