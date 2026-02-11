"""
Weight Checker Module for Subnet-111 Miner

This module checks the validator type weights from the GitHub repository
and alerts if Google Maps Reviews weight changes from 0.

GitHub Source: https://github.com/oneoneone-io/subnet-111/blob/main/node/utils/validator/types/index.js
"""

import re
import aiohttp
import asyncio
from typing import Dict, Optional, Tuple


class WeightChecker:
    """
    Checks validator type selection weights from GitHub repository.
    """
    
    GITHUB_RAW_URL = "https://raw.githubusercontent.com/oneoneone-io/subnet-111/main/node/utils/validator/types/index.js"
    
    # ANSI color codes
    YELLOW = '\033[93m'
    RED = '\033[91m'
    GREEN = '\033[92m'
    RESET = '\033[0m'
    BOLD = '\033[1m'
    
    def __init__(self):
        self.last_gm_weight: Optional[int] = None
        self.last_x_weight: Optional[int] = None
    
    async def fetch_weights_from_github(self) -> Optional[Dict[str, int]]:
        """
        Fetch the weights from GitHub repository.
        
        Returns:
            Dictionary with 'GoogleMapsReviews' and 'XTweets' weights, or None if failed
        """
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.GITHUB_RAW_URL, timeout=10) as response:
                    if response.status != 200:
                        return None
                    
                    content = await response.text()
                    return self._parse_weights(content)
        
        except asyncio.TimeoutError:
            return None
        except Exception:
            return None
    
    def _parse_weights(self, content: str) -> Optional[Dict[str, int]]:
        """
        Parse the JavaScript file content to extract weights.
        
        Args:
            content: The JavaScript file content
            
        Returns:
            Dictionary with weights or None if parsing failed
        """
        try:
            # Pattern to match: { func: GoogleMapsReviews, weight: 0 },
            gm_pattern = r'\{\s*func:\s*GoogleMapsReviews\s*,\s*weight:\s*(\d+)\s*\}'
            x_pattern = r'\{\s*func:\s*XTweets\s*,\s*weight:\s*(\d+)\s*\}'
            
            gm_match = re.search(gm_pattern, content)
            x_match = re.search(x_pattern, content)
            
            if gm_match and x_match:
                return {
                    'GoogleMapsReviews': int(gm_match.group(1)),
                    'XTweets': int(x_match.group(1))
                }
            
            return None
        
        except Exception:
            return None
    
    def print_weights(self, weights: Dict[str, int]) -> None:
        """
        Print the weights in yellow color.
        
        Args:
            weights: Dictionary containing the weights
        """
        gm_weight = weights.get('GoogleMapsReviews', 0)
        x_weight = weights.get('XTweets', 0)
    
    def check_gm_weight_alert(self, weights: Dict[str, int]) -> None:
        """
        Check if Google Maps weight changed from 0 and print alert.
        
        Args:
            weights: Dictionary containing the weights
        """
        gm_weight = weights.get('GoogleMapsReviews', 0)
        
        if gm_weight != 0:
            # Alert: GM weight is not 0
            print(f"{self.RED}{self.BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{self.RESET}")
            print(f"{self.RED}{self.BOLD}⚠️  ALERT: GM WEIGHT CHANGED!{self.RESET}")
            print(f"{self.RED}{self.BOLD}⚠️  CURRENT GM WEIGHT IS {gm_weight}{self.RESET}")
            print(f"{self.RED}{self.BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{self.RESET}")
        else:
            # Normal: GM weight remains 0
            print(f"{self.GREEN}{self.BOLD}✓ GM WEIGHT REMAINS 0{self.RESET}")
    
    async def check_and_display_weights(self) -> Tuple[bool, Optional[Dict[str, int]]]:
        """
        Main method to check weights from GitHub and display them.
        
        Returns:
            Tuple of (success, weights_dict)
        """
        weights = await self.fetch_weights_from_github()
        
        if weights is None:
            return False, None
        
        # Print weights in yellow
        self.print_weights(weights)
        
        # Check and alert for GM weight
        self.check_gm_weight_alert(weights)
        
        # Store for future reference
        self.last_gm_weight = weights.get('GoogleMapsReviews')
        self.last_x_weight = weights.get('XTweets')
        
        return True, weights


# Singleton instance
_weight_checker_instance = None


def get_weight_checker() -> WeightChecker:
    """
    Get the singleton WeightChecker instance.
    
    Returns:
        WeightChecker instance
    """
    global _weight_checker_instance
    if _weight_checker_instance is None:
        _weight_checker_instance = WeightChecker()
    return _weight_checker_instance

