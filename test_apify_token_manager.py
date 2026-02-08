#!/usr/bin/env python3
"""
Test script for Apify Token Manager

Tests the token rotation and credit checking functionality.
"""

import asyncio
import sys
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from node/.env (relative to this script)
REPO_ROOT = Path(__file__).resolve().parent
dotenv_path = REPO_ROOT / "node" / ".env"

# Load environment variables
load_dotenv(dotenv_path=dotenv_path)

# Add parent directory to path
sys.path.insert(0, '/home/ubuntu/Workspace/Subnet-111')

from oneoneone.utils.apify_token_manager import get_token_manager


async def test_token_manager():
    """
    Test the Apify token manager functionality.
    """
    print("=" * 70)
    print("Testing Apify Token Manager")
    print("=" * 70)
    print()

    # Check if tokens are configured
    tokens = os.getenv("APIFY_TOKENS") or os.getenv("APIFY_TOKEN")
    if not tokens:
        print("❌ No APIFY_TOKENS or APIFY_TOKEN found in environment")
        print()
        print("Please set APIFY_TOKENS in your .env file:")
        print("APIFY_TOKENS=token1,token2,token3")
        return 1

    token_list = [t.strip() for t in tokens.split(',') if t.strip()]
    print(f"📋 Found {len(token_list)} token(s) in environment")
    for i, token in enumerate(token_list):
        print(f"   Token {i + 1}: {token[:25]}...")
    print()

    # Get token manager instance
    print("🔧 Initializing token manager...")
    token_manager = get_token_manager()
    print()

    # Test 1: Check all tokens
    print("=" * 70)
    print("Test 1: Check Credits for All Tokens")
    print("=" * 70)
    print()

    results = await token_manager.check_all_tokens()
    print()

    # Display summary
    print("📊 Summary:")
    print("-" * 70)
    valid_count = sum(1 for r in results if r["is_valid"])
    print(f"   Total tokens: {len(results)}")
    print(f"   Valid tokens: {valid_count}")
    print(f"   Invalid tokens: {len(results) - valid_count}")
    print()

    # Test 2: Select best token
    print("=" * 70)
    print("Test 2: Select Best Token")
    print("=" * 70)
    print()

    best_token = await token_manager.select_best_token()
    print()
    print(f"✅ Best token selected: {best_token[:25]}...")
    print()

    # Test 3: Get current token (should use cache)
    print("=" * 70)
    print("Test 3: Get Current Token (Cached)")
    print("=" * 70)
    print()

    current_token = await token_manager.get_current_token()
    print(f"✅ Current token: {current_token[:25]}...")
    print()

    # Display detailed info for each token
    print("=" * 70)
    print("Detailed Token Information")
    print("=" * 70)
    print()

    for i, result in enumerate(results):
        token_preview = result["token"][:30] + "..."
        print(f"Token {i + 1}: {token_preview}")
        print("-" * 70)
        
        if result["is_valid"]:
            print(f"   Status: ✅ VALID")
            print(f"   Included Credits: ${result['included_credits']:.2f}")
            print(f"   Used Credits: ${result['used_credits']:.4f}")
            print(f"   Remaining Credits: ${result['remaining_credits']:.4f}")
            
            # Calculate percentage
            if result['included_credits'] > 0:
                usage_pct = (result['used_credits'] / result['included_credits']) * 100
                print(f"   Usage: {usage_pct:.1f}%")
            
            # Check if below threshold
            if result['remaining_credits'] < 0.1:
                print(f"   ⚠️  WARNING: Below $0.1 threshold!")
        else:
            print(f"   Status: ❌ INVALID")
            print(f"   Error: {result.get('error', 'Unknown error')}")
        
        print()

    print("=" * 70)
    print("Test Completed!")
    print("=" * 70)
    
    return 0


async def main():
    """
    Main test function.
    """
    exit_code = await test_token_manager()
    sys.exit(exit_code)


if __name__ == "__main__":
    asyncio.run(main())

