#!/usr/bin/env python3
"""
Test script for Invidious API channel streams endpoint
Tests fetching live streams from SoulCalibur VI game channel
"""

import requests
import json
from typing import List, Dict, Any
from datetime import datetime

# SoulCalibur VI game channel ID on YouTube
SC6_GAME_CHANNEL_ID = "UCJ0Y3WUgX0eqgQ76mz1PaFA"

# Public Invidious instances to test
INVIDIOUS_INSTANCES = [
    "https://y.com.sb",
    "https://invidious.slipfox.xyz",
    "https://invidious.projectsegfau.lt",
    "https://invidious.privacyredirect.com",
    "https://inv.riverside.rocks",
    "https://invidious.snopyta.org",
    "https://yewtu.be",
    "https://invidious.kavin.rocks",
]


def test_channel_streams(instance: str, channel_id: str) -> Dict[str, Any]:
    """
    Test fetching streams from a channel via Invidious instance
    
    Args:
        instance: Invidious instance URL
        channel_id: YouTube channel ID
        
    Returns:
        Dictionary with test results
    """
    url = f"{instance}/api/v1/channels/{channel_id}/streams"
    
    result = {
        "instance": instance,
        "url": url,
        "success": False,
        "status_code": None,
        "error": None,
        "total_videos": 0,
        "live_streams": 0,
        "stream_titles": [],
    }
    
    try:
        print(f"\n{'='*80}")
        print(f"Testing: {instance}")
        print(f"URL: {url}")
        
        response = requests.get(
            url,
            headers={"Accept": "application/json"},
            timeout=10
        )
        
        result["status_code"] = response.status_code
        
        if response.status_code == 200:
            data = response.json()
            
            if isinstance(data, list):
                result["success"] = True
                result["total_videos"] = len(data)
                
                # Filter for live streams
                live_streams = [v for v in data if v.get("liveNow") == True]
                result["live_streams"] = len(live_streams)
                result["stream_titles"] = [
                    {
                        "title": stream.get("title", "N/A"),
                        "author": stream.get("author", "N/A"),
                        "viewCount": stream.get("viewCount", 0),
                        "videoId": stream.get("videoId", "N/A"),
                    }
                    for stream in live_streams[:5]  # Show first 5
                ]
                
                print(f"✅ SUCCESS")
                print(f"   Total videos: {result['total_videos']}")
                print(f"   Live streams: {result['live_streams']}")
                
                if live_streams:
                    print(f"\n   Live Streams Found:")
                    for i, stream in enumerate(live_streams[:5], 1):
                        print(f"   {i}. {stream.get('author', 'N/A')} - {stream.get('title', 'N/A')}")
                        print(f"      Viewers: {stream.get('viewCount', 0)}")
                        print(f"      URL: https://youtube.com/watch?v={stream.get('videoId', '')}")
                else:
                    print(f"   No live streams currently")
            else:
                result["error"] = f"Unexpected response format: {type(data)}"
                print(f"❌ FAILED: {result['error']}")
        else:
            result["error"] = f"HTTP {response.status_code}"
            print(f"❌ FAILED: HTTP {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            
    except requests.exceptions.Timeout:
        result["error"] = "Request timeout"
        print(f"❌ FAILED: Timeout")
    except requests.exceptions.ConnectionError as e:
        result["error"] = f"Connection error: {str(e)}"
        print(f"❌ FAILED: Connection error")
    except requests.exceptions.RequestException as e:
        result["error"] = f"Request error: {str(e)}"
        print(f"❌ FAILED: {str(e)}")
    except Exception as e:
        result["error"] = f"Unexpected error: {str(e)}"
        print(f"❌ FAILED: {str(e)}")
    
    return result


def main():
    """Main test function"""
    print("="*80)
    print("INVIDIOUS CHANNEL STREAMS API TESTER")
    print("="*80)
    print(f"Channel ID: {SC6_GAME_CHANNEL_ID}")
    print(f"Game: SoulCalibur VI")
    print(f"Testing {len(INVIDIOUS_INSTANCES)} instances...")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = []
    
    # Test each instance
    for instance in INVIDIOUS_INSTANCES:
        result = test_channel_streams(instance, SC6_GAME_CHANNEL_ID)
        results.append(result)
    
    # Summary
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    
    print(f"\n✅ Successful: {len(successful)}/{len(results)}")
    print(f"❌ Failed: {len(failed)}/{len(results)}")
    
    if successful:
        print("\n✅ Working Instances:")
        for r in successful:
            print(f"   - {r['instance']}")
            print(f"     Total videos: {r['total_videos']}, Live: {r['live_streams']}")
    
    if failed:
        print("\n❌ Failed Instances:")
        for r in failed:
            error_msg = r['error'] or f"HTTP {r['status_code']}"
            print(f"   - {r['instance']}: {error_msg}")
    
    # Find best instance with live streams
    live_instances = [r for r in successful if r["live_streams"] > 0]
    if live_instances:
        best = max(live_instances, key=lambda x: x["live_streams"])
        print(f"\n🎯 Best Instance (most live streams):")
        print(f"   {best['instance']}")
        print(f"   Live streams: {best['live_streams']}")
        print(f"\n   Recommended for use in your app!")
    else:
        print(f"\n⚠️  No live streams found on any instance")
        print(f"   (This might be because no one is streaming SC6 right now)")
    
    # Save results to JSON
    output_file = "invidious_test_results.json"
    with open(output_file, "w") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "channel_id": SC6_GAME_CHANNEL_ID,
            "results": results
        }, f, indent=2)
    
    print(f"\n📄 Full results saved to: {output_file}")
    print("="*80)


if __name__ == "__main__":
    main()
