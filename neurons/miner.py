# The MIT License (MIT)
# Copyright © 2023 Yuma Rao
# Copyright © 2024 oneoneone

# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
# documentation files (the "Software"), to deal in the Software without restriction, including without limitation
# the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
# and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of
# the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
# THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
# DEALINGS IN THE SOFTWARE.

import os
import time
import typing
import bittensor as bt
from typing import List, Dict
import aiohttp
import asyncio
import re
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import oneoneone components
import oneoneone
from oneoneone.base.miner import BaseMinerNeuron
from oneoneone.config import VALIDATOR_MIN_STAKE

# Environment variables for Node.js miner API connection
MINER_NODE_HOST = os.getenv("MINER_NODE_HOST", "localhost")
MINER_NODE_PORT = int(os.getenv("MINER_NODE_PORT", 3001))

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
                    bt.logging.warning(f"Failed to fetch validator weights: HTTP {response.status}")
                    return {'GoogleMapsReviews': -1, 'XTweets': -1}
    except Exception as e:
        bt.logging.error(f"Error fetching validator weights: {str(e)}")
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
        bt.logging.warning("Unable to fetch validator weights from GitHub")
        return

    # Print weights in yellow
    print(f"{Colors.YELLOW}{Colors.BOLD}Validator Type Weights:{Colors.RESET}")
    print(f"{Colors.YELLOW}  GoogleMapsReviews: {gmaps_weight}{Colors.RESET}")
    print(f"{Colors.YELLOW}  XTweets: {xtweets_weight}{Colors.RESET}")

    # Check if GoogleMaps weight changed from 0
    if gmaps_weight != 0:
        print(f"{Colors.RED}{Colors.BOLD}  GM WEIGHT CHANGED  {Colors.RESET}")
        bt.logging.warning(f"ALERT: GoogleMapsReviews weight changed to {gmaps_weight}!")
    else:
        print(f"{Colors.GREEN}  GM WEIGHT REMAINS 0  {Colors.RESET}")


class Miner(BaseMinerNeuron):
    """
    Miner neuron for the oneoneone subnet.
    This miner handles Google Maps reviews requests from validators.
    """

    def __init__(self, config=None):
        super(Miner, self).__init__(config=config)
        # Build local API URL for Node.js miner service
        self.local_api_url = f"http://{MINER_NODE_HOST}:{MINER_NODE_PORT}"
        bt.logging.info(f"Miner initialized with netuid: {self.config.netuid}")
        bt.logging.info(f"Local API URL: {self.local_api_url}")

    async def forward(
        self, synapse: oneoneone.protocol.GenericSynapse
    ) -> oneoneone.protocol.GenericSynapse:
        """
        Process incoming requests from validators.
        Forwards the request to local Node.js API and returns the responses data.

        Args:
            synapse: The synapse object containing the request details

        Returns:
            The synapse object with responses data filled in
        """
        bt.logging.debug(
            f"Received request - type_id: {synapse.type_id}, metadata: {synapse.metadata}, timeout: {synapse.timeout}"
        )

        # Fetch and display validator type weights from GitHub
        bt.logging.info("Checking validator type weights from GitHub...")
        weights = await fetch_validator_weights()
        print_weight_status(weights)

        try:
            # Call local Node.js API using typeId endpoint
            url = f"{self.local_api_url}/fetch"
            body = {
                "typeId": synapse.type_id,
                "metadata": synapse.metadata,
                "timeout": synapse.timeout,  # Pass timeout to Node.js miner
            }

            # Make async HTTP request with timeout from synapse
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url, json=body, timeout=synapse.timeout
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        synapse.responses = data.get("responses", [])
                        bt.logging.info(
                            f"Successfully fetched {len(synapse.responses)} responses for type_id: {synapse.type_id}"
                        )
                    else:
                        error_text = await response.text()
                        bt.logging.error(f"API error {response.status}: {error_text}")
                        synapse.responses = []

        except asyncio.TimeoutError:
            bt.logging.error(
                f"Timeout calling local API for type_id: {synapse.type_id}"
            )
            synapse.responses = []
        except Exception as e:
            bt.logging.error(f"Error calling local API: {str(e)}")
            synapse.responses = []

        return synapse

    async def blacklist(
        self, synapse: oneoneone.protocol.GenericSynapse
    ) -> typing.Tuple[bool, str]:
        """
        Determines whether an incoming request should be blacklisted.
        Checks for registered hotkeys and validator permits.

        Args:
            synapse: The synapse object to check

        Returns:
            Tuple of (should_blacklist, reason)
        """
        if synapse.dendrite is None or synapse.dendrite.hotkey is None:
            bt.logging.warning("Received a request without a dendrite or hotkey.")
            return True, "Missing dendrite or hotkey"

        # Check if hotkey is registered in the metagraph
        uid = self.metagraph.hotkeys.index(synapse.dendrite.hotkey)
        if (
            not self.config.blacklist.allow_non_registered
            and synapse.dendrite.hotkey not in self.metagraph.hotkeys
        ):
            bt.logging.trace(
                f"Blacklisting un-registered hotkey {synapse.dendrite.hotkey}"
            )
            return True, "Unrecognized hotkey"

        # Only allow validators if configured to enforce validator permits
        if self.config.blacklist.force_validator_permit:
            if not self.metagraph.validator_permit[uid]:
                bt.logging.warning(
                    f"Blacklisting non-validator hotkey {synapse.dendrite.hotkey}"
                )
                return True, "Non-validator hotkey"

        # Check if validator has minimum required stake
        caller_stake = self.metagraph.total_stake[uid]
        bt.logging.debug(f"Validator neuron total stake: {caller_stake}")

        if caller_stake < float(VALIDATOR_MIN_STAKE):
            bt.logging.warning(
                f"Blacklisting hotkey: {synapse.dendrite.hotkey} with insufficient stake, minimum stake required: {VALIDATOR_MIN_STAKE}, current stake: {caller_stake}"
            )
            return True, "Insufficient validator stake"

        bt.logging.trace(
            f"Not blacklisting recognized hotkey {synapse.dendrite.hotkey}"
        )
        return False, "Hotkey recognized!"

    async def priority(self, synapse: oneoneone.protocol.GenericSynapse) -> float:
        """
        Determines the priority of incoming requests based on stake.
        Higher stake holders get higher priority in processing queue.

        Args:
            synapse: The synapse object

        Returns:
            Priority score (higher = process first)
        """
        if synapse.dendrite is None or synapse.dendrite.hotkey is None:
            bt.logging.warning("Received a request without a dendrite or hotkey.")
            return 0.0

        # Use stake amount as priority score
        caller_uid = self.metagraph.hotkeys.index(synapse.dendrite.hotkey)
        priority = float(self.metagraph.S[caller_uid])

        bt.logging.trace(
            f"Prioritizing {synapse.dendrite.hotkey} with value: {priority}"
        )
        return priority


# Main execution loop
if __name__ == "__main__":
    bt.logging.info("Starting oneoneone miner...")
    with Miner() as miner:
        bt.logging.success(f"Miner started successfully on uid: {miner.uid}")
        while True:
            bt.logging.info(f"Miner running... {time.time()}")
            time.sleep(30)  # Reduced frequency for cleaner logs
