import requests
import json

INSTANCES = [
    "https://y.com.sb",
    "https://invidious.slipfox.xyz",
    "https://invidious.projectsegfau.lt",
    "https://invidious.privacyredirect.com",
]

channel_id = "UCJ0Y3WUgX0eqgQ76mz1PaFA"  # SoulCalibur VI Game Channel

print(f"Testing if channel exists: {channel_id}\n")

for instance in INSTANCES:
    # Try getting channel info instead of streams
    url = f"{instance}/api/v1/channels/{channel_id}"
    print(f"Trying {instance}...")
    
    try:
        response = requests.get(url, headers={"Accept": "application/json"}, timeout=15)
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Channel found!")
            print(f"     Name: {data.get('author', 'N/A')}")
            print(f"     Subscribers: {data.get('subCount', 'N/A')}")
            print(f"     Description: {data.get('description', 'N/A')[:100]}")
            
            # Check latest videos
            latest = data.get('latestVideos', [])
            print(f"     Latest videos: {len(latest)}")
            
            if latest:
                print(f"\n     First 3 latest videos:")
                for i, v in enumerate(latest[:3]):
                    print(f"       {i+1}. {v.get('title', 'N/A')[:60]}")
                    print(f"          liveNow: {v.get('liveNow')}, published: {v.get('publishedText')}")
            
            break  # Success
        elif response.status_code == 404:
            print(f"  ❌ Channel not found (404)")
        else:
            print(f"  ❌ Error: {response.status_code}")
    except Exception as e:
        print(f"  ❌ Exception: {str(e)[:100]}")
    
    print()

print("\n" + "="*80)
print("Now testing JingleBells_Gaming for comparison:")
print("="*80 + "\n")

channel_id = "UC2eOo8z3dhPbBkyqHbnxm6A"  # JingleBells_Gaming

for instance in INSTANCES:
    url = f"{instance}/api/v1/channels/{channel_id}"
    print(f"Trying {instance}...")
    
    try:
        response = requests.get(url, headers={"Accept": "application/json"}, timeout=15)
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Channel found!")
            print(f"     Name: {data.get('author', 'N/A')}")
            print(f"     Subscribers: {data.get('subCount', 'N/A')}")
            break
    except Exception as e:
        print(f"  ❌ Exception: {str(e)[:100]}")
    
    print()
