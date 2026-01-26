import sys
import pandas as pd
import json
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

input_csv = sys.argv[1]
try:
    df = pd.read_csv(input_csv)
except Exception as e:
    print(json.dumps({"error": f"CSV Error: {str(e)}"}))
    sys.exit(1)

if len(df) < 3:
    print(json.dumps({"error": "Not enough data points (need min 3 fences)"}))
    sys.exit(0)

df['conversion'] = df.apply(lambda row: row['views'] / row['entries'] if row['entries'] > 0 else 0, axis=1) # views / entries

features = ['entries', 'conversion', 'dwell']
X = df[features]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
df['cluster'] = kmeans.fit_predict(X_scaled)

cluster_stats = df.groupby('cluster')[features].mean()

sorted_clusters = cluster_stats.sort_values(by='entries', ascending=False).index

label_map = {}
label_map[sorted_clusters[0]] = 'HOTSPOT'
label_map[sorted_clusters[1]] = 'STANDARD'
label_map[sorted_clusters[2]] = 'COLD'

output = {}
for index, row in df.iterrows():
    cluster_id = row['cluster']
    category = label_map[cluster_id]

    output[row['fenceId']] = category

print(json.dumps(output))