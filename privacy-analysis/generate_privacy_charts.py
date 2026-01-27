import requests
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import sys

API_URL = "http://localhost:3000"
CSV_FILENAME = "privacy_experiment_data.csv"
TARGET_FENCE_ID = "" 

def get_target_geofence():
    try:
        response = requests.get(f"{API_URL}/geofences/{TARGET_FENCE_ID}")
        response.raise_for_status()
        fence = response.json()
        
        if not fence:
            print("Error: Geofence not found.")
            sys.exit(1)
            
        print(f"Selected target: {fence['name']} ({fence['id']})")
        return fence['id']
    except Exception as e:
        print(f"Connection error: {e}")
        sys.exit(1)

def run_simulation(fence_id):
    print("Running simulation...")
    try:
        response = requests.post(f"{API_URL}/privacy-analysis/simulate/{fence_id}")
        response.raise_for_status()
    except Exception as e:
        print(f"Simulation failed: {e}")
        sys.exit(1)

def download_data():
    print("Downloading data...")
    try:
        response = requests.get(f"{API_URL}/privacy-analysis/export")
        response.raise_for_status()
        
        with open(CSV_FILENAME, "wb") as f:
            f.write(response.content)
        return CSV_FILENAME
    except Exception as e:
        print(f"Download failed: {e}")
        sys.exit(1)

def generate_charts(csv_path):
    print("Generating charts...")
    
    try:
        df = pd.read_csv(csv_path, sep=';')
    except Exception as e:
        print(f"Error reading CSV: {e}")
        sys.exit(1)

    df['QoS_Label'] = df['QoSRetained'].apply(lambda x: 'Correct' if x == 1 else 'Logic Error')
    sns.set_theme(style="whitegrid")

    # Privacy Error Distribution
    plt.figure(figsize=(10, 6))
    sns.histplot(data=df, x='ErrorMeters', kde=True, color='teal', bins=30)
    plt.title('Distribution of Location Perturbation')
    plt.xlabel('Distance Error (meters)')
    plt.axvline(x=df['ErrorMeters'].mean(), color='red', linestyle='--', label=f'Mean: {df["ErrorMeters"].mean():.2f}m')
    plt.legend()
    plt.tight_layout()
    plt.savefig('chart_1_privacy.png', dpi=300)
    plt.close()

    # Quality of Service
    plt.figure(figsize=(8, 8))
    qos_counts = df['QoS_Label'].value_counts()
    plt.pie(qos_counts, labels=qos_counts.index, colors=['#66bb6a', '#ffa726'], autopct='%.1f%%', startangle=140)
    plt.title('Quality of Service: Geofence Logic Consistency')
    plt.tight_layout()
    plt.savefig('chart_2_qos.png', dpi=300)
    plt.close()

    # Spatial Trajectory
    plt.figure(figsize=(10, 10))
    sns.scatterplot(data=df, x='RealLon', y='RealLat', label='Real Position', color='blue', alpha=0.3, s=15)
    sns.scatterplot(data=df, x='FakeLon', y='FakeLat', label='Sent to Backend', color='red', marker='X', s=60)
    plt.title('Visualization of Spatial Cloaking')
    plt.xlabel('Longitude')
    plt.ylabel('Latitude')
    plt.legend()
    plt.tight_layout()
    plt.savefig('chart_3_trajectory.png', dpi=300)
    plt.close()

    # Privacy-QoS Trade-off
    plt.figure(figsize=(10, 6))
    sns.scatterplot(data=df, x='ErrorMeters', y='QoSRetained', 
                    hue='QoS_Label', palette={'Correct': 'green', 'Logic Error': 'red'},
                    alpha=0.6, s=100)
    plt.axvline(x=df['ErrorMeters'].mean(), color='gray', linestyle='--', alpha=0.5)
    plt.title('Privacy Perturbation vs Quality of Service Trade-off')
    plt.xlabel('Privacy Perturbation (meters)')
    plt.ylabel('QoS Maintained (1=Yes, 0=No)')
    plt.tight_layout()
    plt.savefig('chart_4_tradeoff.png', dpi=300)
    plt.close()

if __name__ == "__main__":
    fence_id = get_target_geofence()
    run_simulation(fence_id)
    file_path = download_data()
    generate_charts(file_path)
    print("Analysis completed")