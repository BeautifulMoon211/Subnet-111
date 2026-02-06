#!/bin/bash
# Script to run the test miner with common configurations

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Subnet-111 Test Miner Launcher${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if Python is available
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python is not installed${NC}"
    exit 1
fi

# Use python3 if available, otherwise python
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

# Check if aiohttp is installed
if ! $PYTHON_CMD -c "import aiohttp" 2>/dev/null; then
    echo -e "${YELLOW}Warning: aiohttp not installed${NC}"
    echo -e "${YELLOW}Installing aiohttp...${NC}"
    pip install aiohttp
    echo ""
fi

# Select job type
echo -e "${BLUE}Select job type:${NC}"
echo "  1) X (X tweets)"
echo "  2) GM (Google Maps reviews)"
echo ""
read -p "Enter choice [1-2]: " type_choice

case $type_choice in
    1)
        JOB_TYPE="X"
        echo -e "${GREEN}Selected: X (X tweets)${NC}"
        ;;
    2)
        JOB_TYPE="GM"
        echo -e "${GREEN}Selected: GM (Google Maps reviews)${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""

# Select test mode
echo -e "${BLUE}Select test mode:${NC}"
echo "  1) Run once (single test)"
echo "  2) Run every 1 minute (quick testing)"
echo "  3) Run every 5 minutes"
echo "  4) Run every 20 minutes"
echo "  5) Custom period"
echo ""
read -p "Enter choice [1-5]: " mode_choice

case $mode_choice in
    1)
        echo -e "${GREEN}Running single test...${NC}"
        $PYTHON_CMD neurons/test_miner.py $JOB_TYPE 1 --once
        ;;
    2)
        echo -e "${GREEN}Running test miner every 1 minute...${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        $PYTHON_CMD neurons/test_miner.py $JOB_TYPE 1
        ;;
    3)
        echo -e "${GREEN}Running test miner every 5 minutes...${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        $PYTHON_CMD neurons/test_miner.py $JOB_TYPE 5
        ;;
    4)
        echo -e "${GREEN}Running test miner every 20 minutes...${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        $PYTHON_CMD neurons/test_miner.py $JOB_TYPE 20
        ;;
    5)
        read -p "Enter period in minutes: " period
        echo -e "${GREEN}Running test miner every $period minutes...${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
        $PYTHON_CMD neurons/test_miner.py $JOB_TYPE $period
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

