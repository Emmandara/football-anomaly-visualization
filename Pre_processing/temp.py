import numpy as np
import matplotlib.pyplot as plt

# Load annotation and camera data
skeleton_data = np.load("annotations/ARG_CRO_000737.npz")
camera_data = np.load("cameras/ARG_CRO_000737.npz")

# Get skeletons: shape (num_frames, num_players, num_joints, 3)
positions_3d = skeleton_data["positions_3d"]

# Camera matrices
K = camera_data["K"]
R = camera_data["R"]
t = camera_data["t"]
Rt = np.hstack((R, t))
P = K @ Rt

# Pick a frame and a player
frame_idx = 0
player_idx = 0
joints = positions_3d[frame_idx, player_idx]  # shape: (17, 3)

# Convert to homogeneous coordinates
joints_hom = np.hstack([joints, np.ones((joints.shape[0], 1))])  # (17, 4)

# Project to 2D
joints_2d = (P @ joints_hom.T).T  # (17, 3)
joints_2d /= joints_2d[:, 2][:, None]  # Normalize

# Plot
plt.figure(figsize=(6, 6))
plt.scatter(joints_2d[:, 0], joints_2d[:, 1])
plt.gca().invert_yaxis()  # Match image coordinate system
plt.title("2D Projection of Player Skeleton")
plt.show()
