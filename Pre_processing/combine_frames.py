import os
import json
import joblib
import numpy as np


model_path = "C:/Users/emman/Downloads/anomagram-master/anomagram-master/app/src/components/train/role_model_retrained.pkl"
input_folder = "C:/Users/emman/Downloads/anomagram-master/anomagram-master/app/public/data/ecg/output_visual"
output_folder = "C:/Users/emman/Downloads/anomagram-master/anomagram-master/app/public/data/ecg/output_combined_roles"

os.makedirs(output_folder, exist_ok=True)


print(f" Loading model from {model_path}")
model = joblib.load(model_path)


for filename in os.listdir(input_folder):
    if not filename.endswith(".json"):
        continue

    input_path = os.path.join(input_folder, filename)
    output_path = os.path.join(output_folder, filename)

    print(f" Processing {filename}...")

    with open(input_path, "r") as f:
        data = json.load(f)

    for frame in data:
        raw_positions = frame.get("unnormalized_data", [])
        if not raw_positions or len(raw_positions) != 42:
            frame["roles"] = {}
            continue

        
        X = np.array(raw_positions).reshape(1, -1)
        predicted_roles = model.predict(X)[0]  

       
        frame["roles"] = {str(pid): int(predicted_roles[pid]) for pid in range(21)}

 
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f" Saved: {output_path}")

print(" All matches processed with dynamic roles injected.")
