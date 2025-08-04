import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

# === Config ===
TRAIN_DATA_PATH = "player_features_for_labeling.csv"  # Must include role column
MODEL_OUTPUT_PATH = "role_model.pkl"

# === Load Data ===
df = pd.read_csv(TRAIN_DATA_PATH)

# Features and labels
X = df[["avg_x", "avg_y", "var_x", "var_y", "total_distance"]].values
y = df["role"].values  # 0 = DEF, 1 = MID, 2 = FWD

# Impute missing values
imputer = SimpleImputer(strategy="mean")
X = imputer.fit_transform(X)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train classifier
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

# Evaluate
y_pred = clf.predict(X_test)
print("=== Classification Report ===")
print(classification_report(y_test, y_pred))

# Save model
joblib.dump(clf, MODEL_OUTPUT_PATH)
print(f" Model saved to: {MODEL_OUTPUT_PATH}")
