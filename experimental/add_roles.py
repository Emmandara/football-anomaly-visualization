import os
import pandas as pd
import numpy as np


input_folder = "all_matches_csv"  
output_file = "all_frames_features.npy"  


all_features = []

for filename in os.listdir(input_folder):
    if filename.endswith(".csv") and not filename.startswith("~$"):
        filepath = os.path.join(input_folder, filename)
        print(f" Loading {filename}")
        try:
           
            try:
                df = pd.read_csv(filepath, encoding='utf-8')
            except UnicodeDecodeError:
                df = pd.read_csv(filepath, encoding='latin1')
        except Exception as e:
            print(f"Skipping {filename}: {e}")
            continue

        pos_columns = df.columns[-42:] 
        frame_features = df[pos_columns].dropna().values
        all_features.append(frame_features)




X = np.vstack(all_features)
print(f" Total frames collected: {X.shape[0]}")
print(f" Feature shape per frame: {X.shape[1]}")


np.save(output_file, X)
print(f"Saved role training data to {output_file}")
