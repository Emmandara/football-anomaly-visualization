import os
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# === Config ===
model_path = "role_model.pkl"  
input_folder = "all_matches_csv"
exclude_file = "ARG_CRO_000737.csv"
new_model_path = "role_model_retrained_v1.pkl"

# === Load original (x, y) → role model ===
clf = joblib.load(model_path)

X_all = []  # 42D full-frame vectors
y_all = []  # Corresponding predicted player roles

for filename in os.listdir(input_folder):
    if not filename.endswith(".csv") or filename.startswith("~$"):
        continue
    if filename == exclude_file:
        continue

    print(f" Predicting roles in {filename}")
    filepath = os.path.join(input_folder, filename)

    try:
        df = pd.read_csv(filepath, encoding='utf-8')
    except UnicodeDecodeError:
        df = pd.read_csv(filepath, encoding='latin1')
    except Exception as e:
        print(f" Skipping {filename} due to read error: {e}")
        continue

    # Extract last 42 columns for player positions
    position_data = df.iloc[:, -42:]
    position_data = position_data.dropna()

    print(f"Usable frames: {len(position_data)}")

    for _, row in position_data.iterrows():
        full_frame = row.values.astype(float)

        # Sanity check
        if len(full_frame) != 42 or np.isnan(full_frame).any():
            continue

        frame_vector = full_frame.tolist()
        players_xy = full_frame.reshape(21, 2)

        try:
            frame_roles = clf.predict(players_xy)
        except Exception as e:
            print(f" Skipping frame due to prediction error: {e}")
            continue

        for pid in range(21):
            X_all.append(frame_vector)
            y_all.append(frame_roles[pid])

# === Final dataset conversion
X_all = np.array(X_all)
y_all = np.array(y_all)

print(f"\nTotal samples collected: {len(X_all)}")

if len(X_all) == 0:
    raise ValueError(" No valid data found. Check your CSV files and data quality.")

# === Train model
X_train, X_test, y_train, y_test = train_test_split(X_all, y_all, test_size=0.2, random_state=42)

clf_retrained = RandomForestClassifier(n_estimators=100, random_state=42)
clf_retrained.fit(X_train, y_train)

# === Save model
joblib.dump(clf_retrained, new_model_path)
print(f" New role model saved to {new_model_path}")

# === Evaluate
print("\n Evaluation on held-out test set:")
print(classification_report(y_test, clf_retrained.predict(X_test)))
