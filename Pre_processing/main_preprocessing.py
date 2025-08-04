import os
import numpy as np
import pandas as pd

input_folder = "cameras"        # Folder containing NPZ files
output_folder = "all_matches_csv"  # Folder to save CSVs
os.makedirs(output_folder, exist_ok=True)

for file in os.listdir(input_folder):
    if file.endswith(".npz"):
        match_name = file.replace(".npz", "")
        npz_path = os.path.join(input_folder, file)
        
        data = np.load(npz_path, allow_pickle=True)
        # Inspect keys to find the correct array
        print(f"Processing {file}, keys: {list(data.keys())}")

        # Example: assume array key is "boxes" or default arr_0
        if "boxes" in data:
            frames = data["boxes"]
        else:
            frames = data["arr_0"]

        # Convert to DataFrame
        # Shape assumption: (num_frames, num_players, 2)
        num_frames = frames.shape[0]
        num_players = frames.shape[1]
        columns = ["frame"]
        for p in range(num_players):
            columns += [f"p{p+1}_x", f"p{p+1}_y"]

        rows = []
        for frame_idx in range(num_frames):
            frame_data = frames[frame_idx].flatten()  # flatten x,y pairs
            rows.append([frame_idx] + frame_data.tolist())

        df = pd.DataFrame(rows, columns=columns)
        csv_path = os.path.join(output_folder, f"{match_name}.csv")
        df.to_csv(csv_path, index=False)
        print(f"Saved {csv_path}")
