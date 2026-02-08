/**
 * Apify Token Manager
 * 
 * Manages multiple Apify API tokens and automatically selects the best one
 * based on remaining credits. Rotates to another token if credits are low.
 */

import axios from 'axios';
import logger from '#modules/logger/index.js';

const APIFY_API_BASE = 'https://api.apify.com/v2';
const MIN_CREDITS_THRESHOLD = 0.1; // Minimum $0.1 USD credits required

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
    this.lastCheckTime = null;
    this.checkInterval = 5 * 60 * 1000; // Check every 5 minutes
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
   * Select the best token based on remaining credits
   */
  async selectBestToken() {
    // Check if we need to refresh token credits
    const shouldCheck = !this.lastCheckTime || 
                       (Date.now() - this.lastCheckTime) > this.checkInterval;

    if (shouldCheck || this.tokenCredits.size === 0) {
      await this.checkAllTokens();
    }

    // Get all valid tokens with their credits
    const validTokens = Array.from(this.tokenCredits.values())
      .filter(t => t.isValid)
      .sort((a, b) => b.remainingCredits - a.remainingCredits);

    if (validTokens.length === 0) {
      throw new Error('No valid Apify tokens available');
    }

    // Select token with most credits
    const bestToken = validTokens[0];
    const tokenPreview = bestToken.token.substring(0, 25) + '...';

    if (bestToken.remainingCredits >= MIN_CREDITS_THRESHOLD) {
      logger.info(`✓ Selected token ${tokenPreview} with $${bestToken.remainingCredits.toFixed(4)} remaining`);
      this.currentToken = bestToken.token;
    } else {
      logger.warn(`⚠ All tokens below $${MIN_CREDITS_THRESHOLD} threshold. Using ${tokenPreview} with $${bestToken.remainingCredits.toFixed(4)} remaining`);
      this.currentToken = bestToken.token;
    }

    return this.currentToken;
  }

  /**
   * Get the current best token (cached or fresh)
   */
  async getCurrentToken() {
    if (!this.currentToken) {
      return await this.selectBestToken();
    }

    // Check if current token still has enough credits
    const currentTokenInfo = this.tokenCredits.get(this.currentToken);
    if (currentTokenInfo && currentTokenInfo.remainingCredits < MIN_CREDITS_THRESHOLD) {
      logger.warn(`Current token below threshold ($${currentTokenInfo.remainingCredits.toFixed(4)}), selecting new token...`);
      return await this.selectBestToken();
    }

    return this.currentToken;
  }
}

export default ApifyTokenManager;

