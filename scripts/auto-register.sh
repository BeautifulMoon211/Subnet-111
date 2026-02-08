#!/bin/bash

################################################################################
# Automatic Subnet Registration Script
# 
# This script automatically runs the subnet registration command at regular
# intervals to ensure continuous registration on the Bittensor network.
#
# Usage:
#   ./auto-register.sh
#
# Configuration:
#   Edit the parameters below to customize wallet, netuid, and interval
################################################################################

# =============================================================================
# CONFIGURATION PARAMETERS (will be prompted for input)
# =============================================================================

# These will be set by user input
WALLET_NAME=""
WALLET_HOTKEY=""
NETUID=""
INTERVAL=""

# Bittensor CLI command
BTCLI_CMD="btcli"               # Path to btcli (use full path if needed)

# =============================================================================
# COLOR CODES FOR OUTPUT
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'
BOLD='\033[1m'

# =============================================================================
# FUNCTIONS
# =============================================================================

# Print colored message
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${RESET}"
}

# Print header
print_header() {
    echo ""
    echo "================================================================================"
    print_message "${CYAN}${BOLD}" "  Bittensor Subnet Auto-Registration"
    echo "================================================================================"
    echo ""
}

# Get user input for parameters
get_user_input() {
    print_message "${CYAN}${BOLD}" "Please enter the following parameters:"
    echo ""

    # Get wallet name
    while [ -z "$WALLET_NAME" ]; do
        read -p "$(echo -e ${YELLOW}Wallet Name: ${RESET})" WALLET_NAME
        if [ -z "$WALLET_NAME" ]; then
            print_message "${RED}" "Error: Wallet name cannot be empty!"
        fi
    done

    # Get wallet hotkey
    while [ -z "$WALLET_HOTKEY" ]; do
        read -p "$(echo -e ${YELLOW}Wallet Hotkey: ${RESET})" WALLET_HOTKEY
        if [ -z "$WALLET_HOTKEY" ]; then
            print_message "${RED}" "Error: Wallet hotkey cannot be empty!"
        fi
    done

    # Get netuid
    while [ -z "$NETUID" ]; do
        read -p "$(echo -e ${YELLOW}Subnet UID [default: 111]: ${RESET})" NETUID
        # Set default if empty
        if [ -z "$NETUID" ]; then
            NETUID="111"
        fi
        # Validate it's a number
        if ! [[ "$NETUID" =~ ^[0-9]+$ ]]; then
            print_message "${RED}" "Error: Subnet UID must be a number!"
            NETUID=""
        fi
    done

    # Get interval
    while [ -z "$INTERVAL" ]; do
        read -p "$(echo -e ${YELLOW}Registration Interval in seconds [default: 5]: ${RESET})" INTERVAL
        # Set default if empty
        if [ -z "$INTERVAL" ]; then
            INTERVAL="5"
        fi
        # Validate it's a number
        if ! [[ "$INTERVAL" =~ ^[0-9]+$ ]]; then
            print_message "${RED}" "Error: Interval must be a number!"
            INTERVAL=""
        fi
    done

    echo ""
    print_message "${GREEN}" "✓ Parameters received successfully!"
    echo ""
}

# Print configuration
print_config() {
    print_message "${BLUE}${BOLD}" "Configuration:"
    echo "  Wallet Name:  ${WALLET_NAME}"
    echo "  Wallet Hotkey: ${WALLET_HOTKEY}"
    echo "  Subnet UID:   ${NETUID}"
    echo "  Interval:     ${INTERVAL} seconds"
    echo ""
}

# Check if btcli is installed
check_btcli() {
    if ! command -v ${BTCLI_CMD} &> /dev/null; then
        print_message "${RED}" "ERROR: btcli command not found!"
        print_message "${YELLOW}" "Please install Bittensor CLI or specify the full path in BTCLI_CMD variable"
        exit 1
    fi
    print_message "${GREEN}" "✓ btcli found: $(which ${BTCLI_CMD})"
    echo ""
}

# Run registration command
run_registration() {
    local attempt=$1
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    print_message "${CYAN}" "────────────────────────────────────────────────────────────────────────────────"
    print_message "${BOLD}" "Attempt #${attempt} - ${timestamp}"
    print_message "${CYAN}" "────────────────────────────────────────────────────────────────────────────────"
    
    # Build the command
    local cmd="${BTCLI_CMD} subnet register --no_prompt --wallet.name \"${WALLET_NAME}\" --wallet.hotkey \"${WALLET_HOTKEY}\" --netuid \"${NETUID}\""
    
    print_message "${YELLOW}" "Running: ${cmd}"
    echo ""
    
    # Execute the command
    eval ${cmd}
    local exit_code=$?
    
    echo ""
    
    # Check result
    if [ $exit_code -eq 0 ]; then
        print_message "${GREEN}${BOLD}" "✓ Registration command completed successfully"
    else
        print_message "${RED}${BOLD}" "✗ Registration command failed with exit code: ${exit_code}"
    fi
    
    echo ""
    
    return $exit_code
}

# Main loop
main() {
    # Print header
    print_header

    # Get user input for parameters
    get_user_input

    # Print configuration
    print_config

    # Check if btcli is installed
    check_btcli
    
    # Confirmation
    print_message "${YELLOW}${BOLD}" "Starting auto-registration loop..."
    print_message "${YELLOW}" "Press Ctrl+C to stop"
    echo ""
    sleep 2
    
    # Counter for attempts
    local attempt=0
    
    # Infinite loop
    while true; do
        attempt=$((attempt + 1))
        
        # Run registration
        run_registration ${attempt}
        
        # Wait for interval
        print_message "${BLUE}" "Waiting ${INTERVAL} seconds before next attempt..."
        echo ""
        sleep ${INTERVAL}
    done
}

# =============================================================================
# SIGNAL HANDLING
# =============================================================================

# Handle Ctrl+C gracefully
trap ctrl_c INT

ctrl_c() {
    echo ""
    echo ""
    print_message "${YELLOW}${BOLD}" "Interrupted by user (Ctrl+C)"
    print_message "${CYAN}" "Auto-registration stopped."
    echo ""
    exit 0
}

# =============================================================================
# SCRIPT EXECUTION
# =============================================================================

# Run main function
main

