#!/usr/bin/env python3
"""
Test script for Weight Checker module

This script tests the weight checker functionality by:
1. Fetching weights from GitHub
2. Displaying them in yellow
3. Alerting if GM weight is not 0
"""

import asyncio
import sys
from oneoneone.utils.weight_checker import get_weight_checker


async def test_weight_checker():
    """
    Test the weight checker functionality.
    """
    print("=" * 70)
    print("Testing Weight Checker Module")
    print("=" * 70)
    print()
    
    # Get the weight checker instance
    weight_checker = get_weight_checker()
    
    print("Fetching weights from GitHub repository...")
    print(f"URL: {weight_checker.GITHUB_RAW_URL}")
    print()
    
    # Check and display weights
    success, weights = await weight_checker.check_and_display_weights()
    
    print()
    
    if success:
        print("✓ Weight check completed successfully!")
        print()
        print("Weights retrieved:")
        print(f"  - GoogleMapsReviews: {weights.get('GoogleMapsReviews', 'N/A')}")
        print(f"  - XTweets: {weights.get('XTweets', 'N/A')}")
        print()
        
        # Calculate percentages
        total = weights.get('GoogleMapsReviews', 0) + weights.get('XTweets', 0)
        if total > 0:
            gm_pct = (weights.get('GoogleMapsReviews', 0) / total) * 100
            x_pct = (weights.get('XTweets', 0) / total) * 100
            print("Selection Probability:")
            print(f"  - GoogleMapsReviews: {gm_pct:.1f}%")
            print(f"  - XTweets: {x_pct:.1f}%")
        else:
            print("⚠️  Warning: Total weight is 0")
        
        return 0
    else:
        print("✗ Failed to fetch weights from GitHub")
        print()
        print("Possible reasons:")
        print("  - Network connection issue")
        print("  - GitHub repository not accessible")
        print("  - File format changed")
        return 1


async def test_with_mock_weights():
    """
    Test the display functionality with mock weights.
    """
    print()
    print("=" * 70)
    print("Testing with Mock Weights")
    print("=" * 70)
    print()
    
    weight_checker = get_weight_checker()
    
    # Test Case 1: GM weight is 0 (normal)
    print("Test Case 1: GM weight = 0, X weight = 100")
    print("-" * 70)
    mock_weights_1 = {'GoogleMapsReviews': 0, 'XTweets': 100}
    weight_checker.print_weights(mock_weights_1)
    weight_checker.check_gm_weight_alert(mock_weights_1)
    print()
    
    # Test Case 2: GM weight is not 0 (alert)
    print("Test Case 2: GM weight = 50, X weight = 50")
    print("-" * 70)
    mock_weights_2 = {'GoogleMapsReviews': 50, 'XTweets': 50}
    weight_checker.print_weights(mock_weights_2)
    weight_checker.check_gm_weight_alert(mock_weights_2)
    print()
    
    # Test Case 3: GM weight is high (alert)
    print("Test Case 3: GM weight = 100, X weight = 0")
    print("-" * 70)
    mock_weights_3 = {'GoogleMapsReviews': 100, 'XTweets': 0}
    weight_checker.print_weights(mock_weights_3)
    weight_checker.check_gm_weight_alert(mock_weights_3)
    print()


async def main():
    """
    Main test function.
    """
    # Test with real GitHub data
    exit_code = await test_weight_checker()
    
    # Test with mock data
    await test_with_mock_weights()
    
    print()
    print("=" * 70)
    print("Test completed!")
    print("=" * 70)
    
    return exit_code


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)

