import requests
import json

INSTANCES = [
    "https://y.com.sb",
    "https://invidious.slipfox.xyz",
    "https://invidious.projectsegfau.lt",
    "https://invidious.privacyredirect.com",
]

channel_id = "UCJ0Y3WUgX0eqgQ76mz1PaFA"  # SoulCalibur VI Game Channel

print(f"Testing SoulCalibur VI Game Channel: {channel_id}\n")

for instance in INSTANCES:
    url = f"{instance}/api/v1/channels/{channel_id}/streams"
    print(f"Trying {instance}...")
    
    try:
        response = requests.get(url, headers={"Accept": "application/json"}, timeout=15)
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            videos = []
            if isinstance(data, list):
                videos = data
            elif isinstance(data, dict) and 'videos' in data:
                videos = data['videos']
            
            print(f"  ✅ Found {len(videos)} videos")
            
            # Check for live streams
            live = [v for v in videos if v.get('liveNow')]
            recent = [v for v in videos if v.get('publishedText', '').lower().find('second') >= 0 or v.get('publishedText', '').lower().find('minute') >= 0]
            
            print(f"  Live (liveNow=true): {len(live)}")
            print(f"  Recent (seconds/minutes ago): {len(recent)}")
            
            if videos:
                print(f"\n  First 3 videos:")
                for i, v in enumerate(videos[:3]):
                    print(f"    {i+1}. {v.get('title', 'N/A')[:60]}")
                    print(f"       liveNow: {v.get('liveNow')}, published: {v.get('publishedText')}")
            
            break  # Success, stop trying other instances
        else:
            print(f"  ❌ Error: {response.status_code}")
            if response.status_code == 500:
                print(f"     {response.text[:200]}")
    except Exception as e:
        print(f"  ❌ Exception: {str(e)[:100]}")
    
    print()
