"""
Apify Token Manager for Python Miner

Manages multiple Apify API tokens and automatically selects the best one
based on remaining credits. Rotates to another token if credits are low.

This runs in the background after sending responses to validators to avoid
slowing down response time.
"""

import os
import asyncio
import aiohttp
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
import bittensor as bt

APIFY_API_BASE = "https://api.apify.com/v2"
MIN_CREDITS_THRESHOLD = 0.1  # Minimum $0.1 USD credits required


class ApifyTokenManager:
    """
    Manages multiple Apify tokens and selects the best one based on credits.
    """

    def __init__(self, tokens: str):
        """
        Initialize token manager with comma-separated tokens.
        
        Args:
            tokens: Comma-separated string of Apify tokens
        """
        # Parse tokens from comma-separated string
        if isinstance(tokens, str):
            self.tokens = [t.strip() for t in tokens.split(',') if t.strip()]
        elif isinstance(tokens, list):
            self.tokens = tokens
        else:
            raise ValueError("Tokens must be a comma-separated string or list")

        if not self.tokens:
            raise ValueError("No valid Apify tokens provided")

        # Cache for token credits
        self.token_credits: Dict[str, Dict] = {}
        self.current_token: Optional[str] = None
        self.last_check_time: Optional[datetime] = None
        self.check_interval = timedelta(minutes=5)  # Check every 5 minutes

    async def get_token_credits(self, token: str) -> Dict:
        """
        Get remaining credits for a specific token.
        
        Args:
            token: Apify API token
            
        Returns:
            Dictionary with token info and credits
        """
        try:
            headers = {"Authorization": f"Bearer {token}"}
            timeout = aiohttp.ClientTimeout(total=10)

            async with aiohttp.ClientSession(timeout=timeout) as session:
                # Get user info
                async with session.get(
                    f"{APIFY_API_BASE}/users/me",
                    headers=headers
                ) as user_response:
                    if user_response.status != 200:
                        raise Exception(f"HTTP {user_response.status}")
                    user_data = await user_response.json()

                # Get monthly usage
                async with session.get(
                    f"{APIFY_API_BASE}/users/me/usage/monthly",
                    headers=headers
                ) as usage_response:
                    if usage_response.status != 200:
                        raise Exception(f"HTTP {usage_response.status}")
                    usage_data = await usage_response.json()

            included_credits = user_data["data"]["plan"]["monthlyUsageCreditsUsd"] or 0
            used_credits = usage_data["data"]["totalUsageCreditsUsdAfterVolumeDiscount"] or 0
            remaining_credits = max(0, included_credits - used_credits)

            return {
                "token": token,
                "included_credits": included_credits,
                "used_credits": used_credits,
                "remaining_credits": remaining_credits,
                "is_valid": True,
                "error": None
            }

        except Exception as e:
            token_preview = token[:20] + "..."
            bt.logging.error(f"Failed to check credits for token {token_preview}: {str(e)}")
            return {
                "token": token,
                "included_credits": 0,
                "used_credits": 0,
                "remaining_credits": 0,
                "is_valid": False,
                "error": str(e)
            }

    async def check_all_tokens(self) -> List[Dict]:
        """
        Check credits for all tokens and update cache.
        
        Returns:
            List of token info dictionaries
        """
        bt.logging.info("Checking credits for all Apify tokens...")

        # Check all tokens in parallel
        results = await asyncio.gather(
            *[self.get_token_credits(token) for token in self.tokens],
            return_exceptions=True
        )

        # Filter out exceptions and update cache
        valid_results = []
        for result in results:
            if isinstance(result, dict):
                self.token_credits[result["token"]] = result
                valid_results.append(result)

        self.last_check_time = datetime.now()

        # Log results with colors
        YELLOW = '\033[93m'
        RED = '\033[91m'
        GREEN = '\033[92m'
        RESET = '\033[0m'

        for i, result in enumerate(valid_results):
            token_preview = result["token"][:25] + "..."
            if result["is_valid"]:
                remaining = result["remaining_credits"]
                color = GREEN if remaining >= MIN_CREDITS_THRESHOLD else RED
                bt.logging.info(
                    f"{YELLOW}Token {i + 1}: {token_preview} - "
                    f"{color}${remaining:.4f}{RESET} remaining "
                    f"({result['used_credits']:.4f}/${result['included_credits']:.2f} used)"
                )
            else:
                bt.logging.error(f"{RED}Token {i + 1}: {token_preview} - INVALID or ERROR{RESET}")

        return valid_results

    async def select_best_token(self) -> str:
        """
        Select the best token based on remaining credits.
        
        Returns:
            The best available token
        """
        # Check if we need to refresh token credits
        should_check = (
            not self.last_check_time or
            (datetime.now() - self.last_check_time) > self.check_interval or
            not self.token_credits
        )

        if should_check:
            await self.check_all_tokens()

        # Get all valid tokens sorted by remaining credits
        valid_tokens = [
            info for info in self.token_credits.values()
            if info["is_valid"]
        ]
        valid_tokens.sort(key=lambda x: x["remaining_credits"], reverse=True)

        if not valid_tokens:
            raise Exception("No valid Apify tokens available")

        # Select token with most credits
        best_token_info = valid_tokens[0]
        token_preview = best_token_info["token"][:25] + "..."
        remaining = best_token_info["remaining_credits"]

        GREEN = '\033[92m'
        YELLOW = '\033[93m'
        RESET = '\033[0m'

        if remaining >= MIN_CREDITS_THRESHOLD:
            bt.logging.info(
                f"{GREEN}✓ Selected token {token_preview} with ${remaining:.4f} remaining{RESET}"
            )
        else:
            bt.logging.warning(
                f"{YELLOW}⚠ All tokens below ${MIN_CREDITS_THRESHOLD} threshold. "
                f"Using {token_preview} with ${remaining:.4f} remaining{RESET}"
            )

        self.current_token = best_token_info["token"]
        return self.current_token

    async def get_current_token(self) -> str:
        """
        Get the current best token (cached or fresh).
        
        Returns:
            The current best token
        """
        if not self.current_token:
            return await self.select_best_token()

        # Check if current token still has enough credits
        current_token_info = self.token_credits.get(self.current_token)
        if current_token_info and current_token_info["remaining_credits"] < MIN_CREDITS_THRESHOLD:
            bt.logging.warning(
                f"Current token below threshold (${current_token_info['remaining_credits']:.4f}), "
                "selecting new token..."
            )
            return await self.select_best_token()

        return self.current_token


# Singleton instance
_token_manager_instance = None


def get_token_manager() -> ApifyTokenManager:
    """
    Get the singleton ApifyTokenManager instance.
    
    Returns:
        ApifyTokenManager instance
    """
    global _token_manager_instance
    if _token_manager_instance is None:
        tokens = os.getenv("APIFY_TOKENS") or os.getenv("APIFY_TOKEN")
        if not tokens:
            raise RuntimeError("No Apify tokens found in environment (APIFY_TOKENS or APIFY_TOKEN)")
        _token_manager_instance = ApifyTokenManager(tokens)
    return _token_manager_instance

