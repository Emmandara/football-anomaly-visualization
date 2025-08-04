import pandas as pd
import numpy as np
import json
import random
from pathlib import Path

# Load the "masked" CSV
csv_path = r"C:\Users\emman\Downloads\anomagram-master\anomagram-master\app\public\data\kdd\player_center_timeseries_masked.csv"
df = pd.read_csv(csv_path, header=None)

# Each row might have 140 features (sequence of 42 features × ~3 time steps)
num_features = 42
reshaped_rows = []

for row_idx, row in df.iterrows():
    full = row.dropna().tolist()
    for i in range(0, len(full), num_features):
        chunk = full[i:i+num_features]
        if len(chunk) == num_features:
            reshaped_rows.append(chunk)

print(f"✅ Reshaped to {len(reshaped_rows)} rows of {num_features} features")

# Convert to train/test format
train_data = [{"index": i, "data": row, "target": "1"} for i, row in enumerate(reshaped_rows[:400])]
test_data = []

# Inject 20% anomalies
normal_rows = reshaped_rows[400:800]
anomalous_rows = reshaped_rows[800:1000]

def inject_anomaly(row, severity=3.0):
    row = row.copy()
    for i in random.sample(range(len(row)), len(row)//5):
        if row[i] > 0:
            row[i] *= random.uniform(severity, severity*1.5)
            row[i] = min(row[i], 1.0)
    return row

test_data.extend([{"index": i+400, "data": row, "target": "1"} for i, row in enumerate(normal_rows)])
test_data.extend([{"index": i+800, "data": inject_anomaly(row), "target": "2"} for i, row in enumerate(anomalous_rows)])
random.shuffle(test_data)

# Save to JSON
Path("./output_json").mkdir(exist_ok=True)
with open("output_json/train11.json", 'w') as f:
    json.dump(train_data, f, indent=4)
with open("output_json/test11.json", 'w') as f:
    json.dump(test_data, f, indent=4)

print("✅ JSON files written and ready for Anomagram.")
