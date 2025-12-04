import requests
import json

instance = "https://y.com.sb"
channel_id = "UCJ0Y3WUgX0eqgQ76mz1PaFA"  # SoulCalibur VI Game Channel
url = f"{instance}/api/v1/channels/{channel_id}/streams"



print(f"Testing {url}")
try:
    response = requests.get(url, headers={"Accept": "application/json"}, timeout=15)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        videos = []
        if isinstance(data, list):
            videos = data
        elif isinstance(data, dict) and 'videos' in data:
            videos = data['videos']
            
        if videos:
            first_video = videos[0]
            video_id = first_video.get('videoId')
            print(f"First video ID: {video_id}")
            print(f"Title: {first_video.get('title')}")
            
            # Fetch video details
            video_url = f"{instance}/api/v1/videos/{video_id}"
            print(f"Fetching details: {video_url}")
            v_resp = requests.get(video_url, headers={"Accept": "application/json"}, timeout=15)
            if v_resp.status_code == 200:
                v_data = v_resp.json()
                print("Video Details:")
                print(f"liveNow: {v_data.get('liveNow')}")
                print(f"isUpcoming: {v_data.get('isUpcoming')}")
                print(f"published: {v_data.get('published')}")
                print(f"publishedText: {v_data.get('publishedText')}")
                print(f"viewCount: {v_data.get('viewCount')}")
            else:
                print(f"Failed to fetch video details: {v_resp.status_code}")




    else:
        print(response.text[:500])
except Exception as e:
    print(f"Error: {e}")
