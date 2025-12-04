#!/usr/bin/env python3
"""
Test script for Invidious API - test a specific channel by handle
"""

import requests
import json
import sys
from typing import Optional

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


def resolve_channel_handle(handle: str) -> Optional[str]:
    """
    Try to resolve a YouTube channel handle to channel ID using Invidious
    
    Args:
        handle: YouTube handle (e.g., @JingleBells_Gaming)
        
    Returns:
        Channel ID if found, None otherwise
    """
    # Remove @ if present
    clean_handle = handle.lstrip('@')
    
    print(f"Resolving channel handle: @{clean_handle}")
    
    for instance in INVIDIOUS_INSTANCES:
        try:
            # Try searching for the channel
            search_url = f"{instance}/api/v1/search?q={clean_handle}&type=channel"
            print(f"  Trying {instance}...")
            
            response = requests.get(search_url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Get the first channel result
                    for item in data:
                        if item.get('type') == 'channel':
                            channel_id = item.get('authorId')
                            channel_name = item.get('author')
                            if channel_id:
                                print(f"  [OK] Found: {channel_name} (ID: {channel_id})")
                                return channel_id
        except Exception as e:
            continue
    
    print(f"  [FAIL] Could not resolve channel handle")
    return None


def test_channel_streams(instance: str, channel_id: str):
    """Test fetching streams from a channel"""
    url = f"{instance}/api/v1/channels/{channel_id}/streams"
    
    print(f"\nTesting: {instance}")
    print(f"URL: {url}")
    
    try:
        response = requests.get(url, headers={"Accept": "application/json"}, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Handle both list and dict response formats
            videos = []
            if isinstance(data, list):
                videos = data
            elif isinstance(data, dict) and 'videos' in data:
                videos = data['videos']
            
            print(f"[OK] SUCCESS - Found {len(videos)} videos")
            
            # Filter for live streams
            live_streams = [v for v in videos if v.get("liveNow") == True]
            print(f"   Live streams: {len(live_streams)}")
            
            if live_streams:
                print(f"\n   [LIVE] LIVE STREAMS:")
                for i, stream in enumerate(live_streams[:5], 1):
                    print(f"   {i}. {stream.get('title', 'N/A')}")
                    print(f"      Author: {stream.get('author', 'N/A')}")
                    print(f"      Viewers: {stream.get('viewCount', 0)}")
                    print(f"      URL: https://youtube.com/watch?v={stream.get('videoId', '')}")
                    print()
            
            # Show some recent videos too
            if videos and not live_streams:
                print(f"\n   [VIDEO] Recent videos (not live):")
                for i, video in enumerate(videos[:3], 1):
                    print(f"   {i}. {video.get('title', 'N/A')}")
                    print(f"      Published: {video.get('publishedText', 'N/A')}")
            
            return True
        else:
            print(f"[FAIL] HTTP {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            
    except Exception as e:
        print(f"[FAIL] Error: {str(e)}")
    
    return False


def main():
    if len(sys.argv) > 1:
        channel_input = sys.argv[1]
    else:
        channel_input = "@JingleBells_Gaming"
    
    print("="*80)
    print("INVIDIOUS CHANNEL STREAMS TESTER")
    print("="*80)
    print(f"Channel: {channel_input}\n")
    
    # If it starts with @, it's a handle - resolve it
    if channel_input.startswith('@'):
        channel_id = resolve_channel_handle(channel_input)
        if not channel_id:
            print("\n[FAIL] Could not resolve channel handle to ID")
            print("   Try providing the channel ID directly (starts with UC)")
            return
    else:
        channel_id = channel_input
    
    print(f"\nChannel ID: {channel_id}")
    print("="*80)
    
    # Test each instance
    success_count = 0
    for instance in INVIDIOUS_INSTANCES:
        if test_channel_streams(instance, channel_id):
            success_count += 1
    
    print("\n" + "="*80)
    print(f"SUMMARY: {success_count}/{len(INVIDIOUS_INSTANCES)} instances worked")
    print("="*80)


if __name__ == "__main__":
    main()
