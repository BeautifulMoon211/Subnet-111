#!/usr/bin/env python3
"""
Test Miner - Simulates Python miner sending requests to Node.js miner on port 3001

This script simulates the communication between the Python miner and Node.js miner
by sending periodic requests to the /fetch endpoint.

Usage:
    python test_miner.py <TYPE> <PERIOD> [--host HOST] [--port PORT]

Examples:
    python test_miner.py X 20                     # Test X tweets every 20 minutes
    python test_miner.py GM 5                     # Test Google Maps every 5 minutes
    python test_miner.py X 1 --once               # Test X tweets once
"""

import os
import time
import asyncio
import aiohttp
import argparse
import logging
from datetime import datetime
from typing import Dict, Any, List
import random

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


class TestMiner:
    """Test miner that simulates requests to Node.js miner"""

    def __init__(self, job_type: str, host: str = "localhost", port: int = 3001):
        """
        Initialize test miner

        Args:
            job_type: Type of job to test ('X' or 'GM')
            host: Node.js miner host
            port: Node.js miner port
        """
        self.job_type = job_type.upper()
        self.host = host
        self.port = port
        self.api_url = f"http://{host}:{port}"
        self.request_count = 0

        # Sample test data for different job types
        self.test_jobs = self._initialize_test_jobs()

    def _initialize_test_jobs(self) -> List[Dict[str, Any]]:
        """Initialize sample test jobs based on job type"""
        if self.job_type == "GM":
            # Google Maps Reviews jobs
            return [
                {
                    "typeId": "google-maps-reviews",
                    "metadata": {
                        "dataId": "0x89c258f97bdb102b:0xea9f8fc0b3ffff55",
                        "id": "ChIJN1t_t254w4AR4PVM_67p73Y",
                        "name": "Golden Gate Bridge",
                        "language": "en",
                        "sort": "newest"
                    },
                    "timeout": 120
                },
                {
                    "typeId": "google-maps-reviews",
                    "metadata": {
                        "dataId": "0x808fb9fe2f8fffff:0x4d23e84ea33480cd",
                        "id": "ChIJ-zW8SFuAhYARzTBI6k7kI00",
                        "name": "Alcatraz Island",
                        "language": "en",
                        "sort": "newest"
                    },
                    "timeout": 120
                },
                {
                    "typeId": "google-maps-reviews",
                    "metadata": {
                        "dataId": "0x886d8c0d3c3fffff:0x3a65f06df231a61f",
                        "id": "ChIJ_____zwNjYgRH6Yx8m3wZTo",
                        "name": "Statue of Liberty",
                        "language": "en",
                        "sort": "newest"
                    },
                    "timeout": 120
                }
            ]
        elif self.job_type == "X":
            # X Tweets jobs
            return [
                {
                    "typeId": "x-tweets",
                    "metadata": {
                        "keyword": "\"bitcoin\""
                    },
                    "timeout": 120
                },
                {
                    "typeId": "x-tweets",
                    "metadata": {
                        "keyword": "\"ethereum\""
                    },
                    "timeout": 120
                },
                {
                    "typeId": "x-tweets",
                    "metadata": {
                        "keyword": "\"AI technology\""
                    },
                    "timeout": 120
                },
                {
                    "typeId": "x-tweets",
                    "metadata": {
                        "keyword": "\"machine learning\""
                    },
                    "timeout": 120
                }
            ]
        else:
            raise ValueError(f"Invalid job type: {self.job_type}. Use 'X' or 'GM'")
    
    async def send_request(self, job: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send a single request to the Node.js miner
        
        Args:
            job: Job configuration with typeId, metadata, and timeout
            
        Returns:
            Response data from the miner
        """
        url = f"{self.api_url}/fetch"
        
        logger.info(f"Sending request #{self.request_count + 1}")
        logger.info(f"  Type ID: {job['typeId']}")
        logger.info(f"  Metadata: {job['metadata']}")
        logger.info(f"  Timeout: {job['timeout']}s")
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url,
                    json=job,
                    timeout=aiohttp.ClientTimeout(total=job['timeout'])
                ) as response:
                    status = response.status
                    data = await response.json()
                    
                    if status == 200:
                        responses_count = len(data.get('responses', []))
                        logger.info(f"✓ Success: Received {responses_count} responses")
                        logger.info(f"  Status: {data.get('status')}")
                        logger.info(f"  Timestamp: {data.get('timestamp')}")
                    else:
                        logger.error(f"✗ Error: HTTP {status}")
                        logger.error(f"  Response: {data}")
                    
                    self.request_count += 1
                    return data
                    
        except asyncio.TimeoutError:
            logger.error(f"✗ Request timeout after {job['timeout']}s")
            self.request_count += 1
            return {"error": "timeout"}
        except aiohttp.ClientError as e:
            logger.error(f"✗ Connection error: {e}")
            self.request_count += 1
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"✗ Unexpected error: {e}")
            self.request_count += 1
            return {"error": str(e)}

    async def run_single_test(self):
        """Run a single test cycle with a random job"""
        job = random.choice(self.test_jobs)
        logger.info("=" * 60)
        logger.info(f"Starting test cycle at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"Job Type: {self.job_type}")
        logger.info("=" * 60)

        result = await self.send_request(job)

        logger.info("=" * 60)
        logger.info(f"Test cycle completed. Total requests sent: {self.request_count}")
        logger.info("=" * 60)

        return result

    async def run_continuous(self, interval_minutes: int):
        """
        Run continuous testing with periodic requests

        Args:
            interval_minutes: Minutes between requests
        """
        logger.info("=" * 60)
        logger.info("Test Miner Started")
        logger.info(f"Job Type: {self.job_type} ({'Google Maps' if self.job_type == 'GM' else 'X Tweets'})")
        logger.info(f"Target: {self.api_url}")
        logger.info(f"Period: {interval_minutes} minutes")
        logger.info(f"Available test jobs: {len(self.test_jobs)}")
        logger.info("=" * 60)

        while True:
            try:
                await self.run_single_test()

                # Wait for the specified interval
                logger.info(f"\nWaiting {interval_minutes} minutes until next request...")
                logger.info(f"Next request at: {datetime.fromtimestamp(time.time() + interval_minutes * 60).strftime('%Y-%m-%d %H:%M:%S')}\n")

                await asyncio.sleep(interval_minutes * 60)

            except KeyboardInterrupt:
                logger.info("\n\nTest miner stopped by user")
                break
            except Exception as e:
                logger.error(f"Error in continuous run: {e}")
                logger.info(f"Retrying in 60 seconds...")
                await asyncio.sleep(60)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Test Miner - Simulates Python miner requests to Node.js miner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s X 20                         # Test X tweets every 20 minutes
  %(prog)s GM 5                         # Test Google Maps every 5 minutes
  %(prog)s X 1 --once                   # Test X tweets once
  %(prog)s GM 10 --host 127.0.0.1       # Custom host
        """
    )

    parser.add_argument(
        'type',
        type=str,
        choices=['X', 'GM', 'x', 'gm'],
        help='Job type to test: X (X tweets) or GM (Google Maps)'
    )

    parser.add_argument(
        'period',
        type=int,
        help='Period in minutes between requests'
    )

    parser.add_argument(
        '--host',
        type=str,
        default=os.getenv('MINER_NODE_HOST', 'localhost'),
        help='Node.js miner host (default: localhost)'
    )

    parser.add_argument(
        '--port',
        type=int,
        default=int(os.getenv('MINER_NODE_PORT', 3001)),
        help='Node.js miner port (default: 3001)'
    )

    parser.add_argument(
        '--once',
        action='store_true',
        help='Run once and exit (for testing)'
    )

    args = parser.parse_args()

    # Validate period
    if args.period < 1:
        logger.error("Period must be at least 1 minute")
        return 1

    # Create test miner instance
    try:
        test_miner = TestMiner(job_type=args.type, host=args.host, port=args.port)
    except ValueError as e:
        logger.error(str(e))
        return 1

    # Run the test miner
    try:
        if args.once:
            # Run once and exit
            asyncio.run(test_miner.run_single_test())
        else:
            # Run continuously
            asyncio.run(test_miner.run_continuous(interval_minutes=args.period))
    except KeyboardInterrupt:
        logger.info("\nTest miner stopped")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())

