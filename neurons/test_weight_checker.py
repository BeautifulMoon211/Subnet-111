#!/usr/bin/env python3
"""
Test script for validator weight checker functionality.

This script tests the weight fetching and display logic without running the full miner.

Usage:
    python test_weight_checker.py
"""

import asyncio
import aiohttp
import re
from typing import Dict

# GitHub URL for validator types configuration
VALIDATOR_TYPES_URL = "https://raw.githubusercontent.com/oneoneone-io/subnet-111/main/node/utils/validator/types/index.js"

# ANSI color codes for terminal output
class Colors:
    YELLOW = '\033[93m'
    RED = '\033[91m'
    GREEN = '\033[92m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


async def fetch_validator_weights() -> Dict[str, int]:
    """
    Fetch and parse validator type weights from GitHub.
    
    Returns:
        Dictionary with weights for GoogleMapsReviews and XTweets
    """
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(VALIDATOR_TYPES_URL, timeout=10) as response:
                if response.status == 200:
                    content = await response.text()
                    
                    # Parse the TYPES array using regex
                    # Looking for: { func: GoogleMapsReviews, weight: 0 },
                    #              { func: XTweets, weight: 100 }
                    
                    gmaps_match = re.search(r'{\s*func:\s*GoogleMapsReviews\s*,\s*weight:\s*(\d+)\s*}', content)
                    xtweets_match = re.search(r'{\s*func:\s*XTweets\s*,\s*weight:\s*(\d+)\s*}', content)
                    
                    gmaps_weight = int(gmaps_match.group(1)) if gmaps_match else 0
                    xtweets_weight = int(xtweets_match.group(1)) if xtweets_match else 0
                    
                    return {
                        'GoogleMapsReviews': gmaps_weight,
                        'XTweets': xtweets_weight
                    }
                else:
                    print(f"Failed to fetch validator weights: HTTP {response.status}")
                    return {'GoogleMapsReviews': -1, 'XTweets': -1}
    except Exception as e:
        print(f"Error fetching validator weights: {str(e)}")
        return {'GoogleMapsReviews': -1, 'XTweets': -1}


def print_weight_status(weights: Dict[str, int]):
    """
    Print validator type weights with color coding.
    
    Args:
        weights: Dictionary with GoogleMapsReviews and XTweets weights
    """
    gmaps_weight = weights.get('GoogleMapsReviews', -1)
    xtweets_weight = weights.get('XTweets', -1)
    
    if gmaps_weight == -1 or xtweets_weight == -1:
        print("Unable to fetch validator weights from GitHub")
        return
    
    # Print weights in yellow
    print(f"{Colors.YELLOW}{Colors.BOLD}Validator Type Weights:{Colors.RESET}")
    print(f"{Colors.YELLOW}  GoogleMapsReviews: {gmaps_weight}{Colors.RESET}")
    print(f"{Colors.YELLOW}  XTweets: {xtweets_weight}{Colors.RESET}")
    
    # Check if GoogleMaps weight changed from 0
    if gmaps_weight != 0:
        print(f"{Colors.RED}{Colors.BOLD}***** GM WEIGHT CHANGED *****{Colors.RESET}")
        print(f"ALERT: GoogleMapsReviews weight changed to {gmaps_weight}!")
    else:
        print(f"{Colors.GREEN}GM WEIGHT REMAINS 0{Colors.RESET}")


async def main():
    """Main test function"""
    print("=" * 80)
    print("Validator Weight Checker Test")
    print("=" * 80)
    print()
    
    print(f"Fetching weights from: {VALIDATOR_TYPES_URL}")
    print()
    
    # Fetch weights
    weights = await fetch_validator_weights()
    
    # Display results
    print_weight_status(weights)
    
    print()
    print("=" * 80)
    print("Test Complete")
    print("=" * 80)
    
    # Show raw data
    print()
    print("Raw data:")
    print(f"  {weights}")


if __name__ == "__main__":
    asyncio.run(main())

