import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
import os


CSV_PATH = "all_matches_csv/ARG_CRO_000737.csv"  
OUTPUT_PATH = "player_features_for_labeling.csv"
FRAME_WIDTH = 1920
FRAME_HEIGHT = 1080
MAX_PLAYERS = 21


df = pd.read_csv(CSV_PATH)
data = df.values


avg_x = np.nanmean(data[:, ::2], axis=0)
valid_mask = ~np.isnan(avg_x)
kmeans_input = avg_x[valid_mask].reshape(-1, 1)
team_labels = KMeans(n_clusters=2, random_state=42).fit_predict(kmeans_input)
flip_cluster = np.argmax([kmeans_input[team_labels == i].mean() for i in range(2)])
full_labels = np.full(MAX_PLAYERS, -1)
full_labels[valid_mask] = team_labels

for i in range(MAX_PLAYERS):
    if full_labels[i] == flip_cluster:
        data[:, i*2] = FRAME_WIDTH - data[:, i*2]

df_norm = pd.DataFrame(data, columns=df.columns)


clean_data = []
for i in range(MAX_PLAYERS):
    x = df_norm.iloc[:, i*2].copy()
    y = df_norm.iloc[:, i*2 + 1].copy()
    x[x == 0] = np.nan
    y[y == 0] = np.nan
    x = x.interpolate(limit_direction='both')
    y = y.interpolate(limit_direction='both')
    clean_data.append(x)
    clean_data.append(y)

clean_df = pd.concat(clean_data, axis=1).T.T
clean_df.columns = df.columns


def extract_player_features(df, num_players=21):
    data = df.values
    features = []
    for i in range(num_players):
        x = data[:, i*2]
        y = data[:, i*2 + 1]
        mask = ~(np.isnan(x) | np.isnan(y))
        if mask.sum() == 0:
            features.append([np.nan] * 5)
            continue
        avg_x = np.nanmean(x[mask])
        avg_y = np.nanmean(y[mask])
        var_x = np.nanvar(x[mask])
        var_y = np.nanvar(y[mask])
        dist = np.nansum(np.sqrt(np.diff(x[mask])**2 + np.diff(y[mask])**2))
        features.append([avg_x / FRAME_WIDTH, avg_y / FRAME_HEIGHT, var_x, var_y, dist])
    return np.array(features)

features = extract_player_features(clean_df)
features_df = pd.DataFrame(features, columns=["avg_x", "avg_y", "var_x", "var_y", "total_distance"])
features_df["player_id"] = range(MAX_PLAYERS)


kmeans = KMeans(n_clusters=3, random_state=42)
kmeans_labels = kmeans.fit_predict(features_df[["avg_x", "avg_y"]].fillna(0))


cluster_centers = kmeans.cluster_centers_[:, 0]  
sorted_roles = np.argsort(cluster_centers)  
role_map = {sorted_roles[0]: 0, sorted_roles[1]: 1, sorted_roles[2]: 2}  
suggested_roles = [role_map[c] for c in kmeans_labels]
features_df["suggested_role"] = suggested_roles
features_df["role"] = -1  


features_df.to_csv(OUTPUT_PATH, index=False)
print(f" Player feature CSV with suggested roles saved to: {OUTPUT_PATH}")
