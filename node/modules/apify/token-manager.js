/**
 * Apify Token Manager
 *
 * Manages multiple Apify API tokens and automatically selects the best one
 * based on remaining credits. Rotates to another token if credits are low.
 */

import axios from 'axios';
import logger from '#modules/logger/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
    path: path.resolve(__dirname, '../../.env'),
});

const APIFY_API_BASE = 'https://api.apify.com/v2';
const MIN_CREDITS_THRESHOLD = process.env.TWEET_LIMIT
      ? (Number.parseInt(process.env.TWEET_LIMIT, 10) + 100) * 0.00025
      : 0.1; // Minimum $0.1 USD credits required

// Global current token - can be accessed by other modules
let currentToken = null;

class ApifyTokenManager {
  constructor(tokens) {
    // Parse tokens from comma-separated string or array
    if (typeof tokens === 'string') {
      this.tokens = tokens.split(',').map(t => t.trim()).filter(t => t);
    } else if (Array.isArray(tokens)) {
      this.tokens = tokens;
    } else {
      throw new Error('Tokens must be a comma-separated string or array');
    }

    if (this.tokens.length === 0) {
      throw new Error('No valid Apify tokens provided');
    }

    // Cache for token credits
    this.tokenCredits = new Map();
    this.currentToken = null;
    this.currentTokenIndex = 0; // Track which token we're currently using
    this.failedTokens = new Set(); // Cache of tokens that failed or are depleted
  }

  /**
   * Get remaining credits for a specific token
   */
  async getTokenCredits(token) {
    try {
      // Get user info
      const userResponse = await axios.get(`${APIFY_API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });

      // Get monthly usage
      const usageResponse = await axios.get(`${APIFY_API_BASE}/users/me/usage/monthly`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });

      const includedCredits = userResponse.data.data.plan.monthlyUsageCreditsUsd || 0;
      const usedCredits = usageResponse.data.data.totalUsageCreditsUsdAfterVolumeDiscount || 0;
      const remainingCredits = Math.max(0, includedCredits - usedCredits);

      return {
        token,
        includedCredits,
        usedCredits,
        remainingCredits,
        isValid: true
      };
    } catch (error) {
      logger.error(`Failed to check credits for token ${token.substring(0, 20)}...: ${error.message}`);
      return {
        token,
        includedCredits: 0,
        usedCredits: 0,
        remainingCredits: 0,
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Check credits for all tokens and update cache
   */
  async checkAllTokens() {
    logger.info('Checking credits for all Apify tokens...');
    
    const results = await Promise.all(
      this.tokens.map(token => this.getTokenCredits(token))
    );

    // Update cache
    results.forEach(result => {
      this.tokenCredits.set(result.token, result);
    });

    this.lastCheckTime = Date.now();

    // Log results
    results.forEach((result, index) => {
      const tokenPreview = result.token.substring(0, 25) + '...';
      if (result.isValid) {
        logger.info(
          `Token ${index + 1}: ${tokenPreview} - $${result.remainingCredits.toFixed(4)} remaining (${result.usedCredits.toFixed(4)}/${result.includedCredits.toFixed(2)} used)`
        );
      } else {
        logger.error(`Token ${index + 1}: ${tokenPreview} - INVALID or ERROR`);
      }
    });

    return results;
  }

  /**
   * Select next available token in sequence (optimized - only checks one token at a time)
   */
  async selectNextToken() {
    // Try tokens in order starting from current index
    for (let i = this.currentTokenIndex; i < this.tokens.length; i++) {
      const token = this.tokens[i];

      // Skip if we already know this token failed
      if (this.failedTokens.has(token)) {
        logger.info(`Skipping token #${i + 1} (cached as failed)`);
        continue;
      }

      // Check only this token (not all tokens)
      logger.info(`Checking token #${i + 1}...`);
      const tokenInfo = await this.getTokenCredits(token);

      // Update cache
      this.tokenCredits.set(token, tokenInfo);
      this.lastCheckTime = Date.now();

      // Check if token is valid and has enough credits
      if (tokenInfo.isValid && tokenInfo.remainingCredits >= MIN_CREDITS_THRESHOLD) {
        // Found a good token!
        this.currentToken = token;
        this.currentTokenIndex = i;
        currentToken = this.currentToken;

        const tokenPreview = token.substring(0, 25) + '...';
        logger.info(`✓ Selected token #${i + 1}: ${tokenPreview} with $${tokenInfo.remainingCredits.toFixed(4)} remaining`);

        return this.currentToken;
      } else {
        // Token failed or depleted - cache it to avoid re-checking
        this.failedTokens.add(token);

        const tokenPreview = token.substring(0, 25) + '...';
        if (!tokenInfo.isValid) {
          logger.error(`✗ Token #${i + 1}: ${tokenPreview} - INVALID (cached)`);
        } else {
          logger.warning(`⚠ Token #${i + 1}: ${tokenPreview} - Below threshold $${tokenInfo.remainingCredits.toFixed(4)} (cached)`);
        }
      }
    }

    // No valid tokens found
    throw new Error('No valid Apify tokens available. All tokens are either invalid or below threshold.');
  }

  /**
   * Get the current token (returns cached token, no checking)
   */
  async getCurrentToken() {
    // If no token selected yet, select first available
    if (!this.currentToken) {
      return await this.selectNextToken();
    }

    // Return cached current token (no checking)
    currentToken = this.currentToken;
    return this.currentToken;
  }

  /**
   * Check current token after API call and switch if depleted
   * This should be called AFTER sending response to validator (non-blocking)
   */
  async checkAndRotateToken() {
    // If no token selected, nothing to check
    if (!this.currentToken) {
      return;
    }

    try {
      // Check only the current token (not all tokens)
      logger.info(`Checking current token #${this.currentTokenIndex + 1} after API call...`);
      const tokenInfo = await this.getTokenCredits(this.currentToken);

      // Update cache
      this.tokenCredits.set(this.currentToken, tokenInfo);

      // If current token is still good, keep using it
      if (tokenInfo.isValid && tokenInfo.remainingCredits >= MIN_CREDITS_THRESHOLD) {
        logger.info(`Current token still valid with $${tokenInfo.remainingCredits.toFixed(4)} remaining`);
        return;
      } else {
        // Current token failed or depleted - cache it and move to next
        this.failedTokens.add(this.currentToken);

        const tokenPreview = this.currentToken.substring(0, 25) + '...';
        if (!tokenInfo.isValid) {
          logger.warning(`Current token #${this.currentTokenIndex + 1}: ${tokenPreview} - INVALID, switching to next token`);
        } else {
          logger.warning(`Current token #${this.currentTokenIndex + 1}: ${tokenPreview} - Below threshold $${tokenInfo.remainingCredits.toFixed(4)}, switching to next token`);
        }

        // Move to next token
        this.currentTokenIndex++;
        this.currentToken = null;

        // Select next token (this will update currentToken)
        await this.selectNextToken();
      }
    } catch (error) {
      logger.error(`Error checking token: ${error.message}`);
    }
  }

  /**
   * Reset failed tokens cache (useful for testing or when tokens are refilled)
   */
  resetFailedTokens() {
    this.failedTokens.clear();
    logger.info('Failed tokens cache cleared');
  }
}

/**
 * Get the global current token (synchronous access)
 * @returns {string|null} The current token or null if not initialized
 */
export function getCurrentToken() {
  return currentToken;
}

export default ApifyTokenManager;

