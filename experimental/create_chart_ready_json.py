import os
import pandas as pd
import numpy as np
import json


input_folder = "all_matches_csv"
roles_folder = "role_predictions"
normalized_output_folder = "output_normalized"
visual_output_folder = "output_visual"
pitch_length = 105.0
pitch_width = 68.0
placeholder = -1.0

os.makedirs(normalized_output_folder, exist_ok=True)
os.makedirs(visual_output_folder, exist_ok=True)


def load_role_dict(roles_path):
    role_map = {0: "Defender", 1: "Midfielder", 2: "Forward"}

    try:
        df = pd.read_csv(roles_path, encoding="utf-8")
    except UnicodeDecodeError:
        df = pd.read_csv(roles_path, encoding="ISO-8859-1", errors="ignore")

    role_dict = {}
    for _, row in df.iterrows():
        if pd.isna(row["player_id"]) or pd.isna(row["predicted_role"]):
            continue
        player_id = str(int(row["player_id"]) + 1)
        role = role_map.get(int(row["predicted_role"]), "Unknown")
        role_dict[player_id] = role

    return role_dict

# === Main Conversion Loop ===
for filename in os.listdir(input_folder):
    if not filename.endswith(".csv"):
        continue

    match_id = filename.replace(".csv", "")
    csv_path = os.path.join(input_folder, filename)
    roles_path = os.path.join(roles_folder, f"{match_id}_roles.csv")

    if not os.path.exists(roles_path):
        print(f"⚠️ Missing roles file for: {match_id}")
        continue

    # Load tracking CSV with encoding fallback
    try:
        df = pd.read_csv(csv_path, encoding="utf-8")
    except UnicodeDecodeError:
        print(f"⚠️ Encoding issue in {filename}, switching to ISO-8859-1")
        df = pd.read_csv(csv_path, encoding="ISO-8859-1", errors="ignore")

    frame_ids = df.iloc[:, 0].values
    data = df.iloc[:, 1:].values
    num_players = data.shape[1] // 2
    player_roles = load_role_dict(roles_path)

    normalized_frames = []
    visual_frames = []

    for idx, row in zip(frame_ids, data):
        if pd.isna(idx):
            continue  # Skip bad frame IDs

        frame_norm = {"frame": int(idx), "data": [], "roles": {}}
        frame_real = {"frame": int(idx), "data": [], "roles": {}}
        valid = True

        for i in range(num_players):
            pid = str(i + 1)
            x, y = row[i * 2], row[i * 2 + 1]

            if np.isnan(x) or np.isnan(y):
                frame_norm["data"].extend([placeholder, placeholder])
                frame_real["data"].extend([placeholder, placeholder])
                valid = False
            else:
                x_norm = x / pitch_length
                y_norm = y / pitch_width
                frame_norm["data"].extend([x_norm, y_norm])
                frame_real["data"].extend([x, y])

                if pid in player_roles:
                    frame_norm["roles"][pid] = player_roles[pid]
                    frame_real["roles"][pid] = player_roles[pid]

        if valid:  # Option A: skip frames with any -1s or NaNs
            normalized_frames.append(frame_norm)
            visual_frames.append(frame_real)

    # Save output JSONs
    with open(os.path.join(normalized_output_folder, f"{match_id}_normalized.json"), "w") as f:
        json.dump(normalized_frames, f, indent=2)

    with open(os.path.join(visual_output_folder, f"{match_id}_visual.json"), "w") as f:
        json.dump(visual_frames, f, indent=2)

    print(f"✅ Created JSONs for {match_id}")
