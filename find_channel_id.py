#!/usr/bin/env python3
"""
Find YouTube Channel ID from handle or URL
"""

import requests
import sys
import re

INVIDIOUS_INSTANCES = [
    "https://y.com.sb",
    "https://invidious.slipfox.xyz",
    "https://invidious.projectsegfau.lt",
    "https://invidious.privacyredirect.com",
]


def extract_handle(input_str):
    """Extract channel handle from various input formats"""
    # Remove @ if present
    if input_str.startswith('@'):
        return input_str[1:]
    
    # Extract from URL
    if 'youtube.com/@' in input_str:
        match = re.search(r'@([^/\s]+)', input_str)
        if match:
            return match.group(1)
    
    # If it's already a channel ID (starts with UC)
    if input_str.startswith('UC') and len(input_str) == 24:
        return None  # Already an ID
    
    return input_str


def find_channel_id(handle):
    """Find channel ID from handle using Invidious search"""
    print(f"Searching for: @{handle}\n")
    
    for instance in INVIDIOUS_INSTANCES:
        try:
            # Search for the channel
            url = f"{instance}/api/v1/search?q={handle}&type=channel"
            print(f"Trying {instance}...")
            
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    # Show all results
                    print(f"  ✅ Found {len(data)} result(s):\n")
                    
                    for i, channel in enumerate(data[:5], 1):
                        if channel.get('type') == 'channel':
                            channel_id = channel.get('authorId')
                            channel_name = channel.get('author')
                            subs = channel.get('subCount', 'Unknown')
                            
                            print(f"  {i}. {channel_name}")
                            print(f"     Channel ID: {channel_id}")
                            print(f"     Subscribers: {subs:,}" if isinstance(subs, int) else f"     Subscribers: {subs}")
                            print(f"     URL: https://youtube.com/channel/{channel_id}")
                            print()
                    
                    return data[0].get('authorId')
                else:
                    print(f"  ❌ No results found")
            else:
                print(f"  ❌ HTTP {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Error: {str(e)[:50]}")
            continue
        
        print()
    
    return None


def main():
    if len(sys.argv) < 2:
        print("Usage: python find_channel_id.py <channel_handle_or_url>")
        print("\nExamples:")
        print("  python find_channel_id.py @JingleBells_Gaming")
        print("  python find_channel_id.py JingleBells_Gaming")
        print("  python find_channel_id.py https://youtube.com/@JingleBells_Gaming")
        print("  python find_channel_id.py UCxxxxxxxxxxxxxxxxxxxxxx")
        return
    
    input_str = sys.argv[1]
    
    print("="*80)
    print("YOUTUBE CHANNEL ID FINDER")
    print("="*80)
    print()
    
    # Check if it's already a channel ID
    if input_str.startswith('UC') and len(input_str) == 24:
        print(f"✅ This is already a channel ID: {input_str}")
        print(f"   URL: https://youtube.com/channel/{input_str}")
        return
    
    # Extract handle from input
    handle = extract_handle(input_str)
    if not handle:
        print("❌ Could not extract channel handle from input")
        return
    
    # Find the channel ID
    channel_id = find_channel_id(handle)
    
    if channel_id:
        print("="*80)
        print("✅ SUCCESS!")
        print("="*80)
        print(f"\nChannel ID: {channel_id}")
        print(f"\nAdd to your code:")
        print(f'  "{channel_id}", // {handle}')
    else:
        print("="*80)
        print("❌ Could not find channel ID")
        print("="*80)
        print("\nTry:")
        print("  1. Check the spelling of the channel handle")
        print("  2. Visit the channel page and use Method 2 (View Page Source)")
        print("  3. Use a different Invidious instance")


if __name__ == "__main__":
    main()
