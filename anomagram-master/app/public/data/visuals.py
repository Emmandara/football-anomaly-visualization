import json
import matplotlib.pyplot as plt

# Load training data
with open('train1.json', 'r') as f:
    train_data = json.load(f)

# Load test data
with open('test1.json', 'r') as f:
    test_data = json.load(f)

# Extract player 1's (x, y) positions across all frames
train_player1 = [(frame['data'][0], frame['data'][1]) for frame in train_data]
test_player1 = [(frame['data'][0], frame['data'][1]) for frame in test_data]

# Split x and y for plotting
train_x, train_y = zip(*train_player1)
test_x, test_y = zip(*test_player1)

# Plot
plt.figure(figsize=(10, 5))
plt.plot(train_x, train_y, label='Player 1 - Training', alpha=0.7)
plt.plot(test_x, test_y, label='Player 1 - Test', alpha=0.7)
plt.legend()
plt.title("Player 1 Trajectory (Training vs Test)")
plt.xlabel("X Position (normalized)")
plt.ylabel("Y Position (normalized)")
plt.grid(True)
plt.show()
