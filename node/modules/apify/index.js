import { ApifyClient } from 'apify-client';
import logger from '#modules/logger/index.js';
import ApifyTokenManager, { getCurrentToken } from './token-manager.js';

// Initialize token manager with tokens from environment
let tokenManager = null;

/**
 * Initialize the token manager
 */
function initializeTokenManager() {
  if (!tokenManager) {
    const tokens = process.env.APIFY_TOKENS || process.env.APIFY_TOKEN;
    if (!tokens) {
      throw new Error('No Apify tokens found in environment variables (APIFY_TOKENS or APIFY_TOKEN)');
    }
    tokenManager = new ApifyTokenManager(tokens);
  }
  return tokenManager;
}

/**
 * Run any Apify actor and get the results
 * First it calls the actor with the parameters
 * Then it gets the results from the dataset
 *
 * @example
 * const results = await runActorAndGetResults('agents/google-maps-reviews', {
 *   placeFIDs: ['1234567890'],
 *   maxItems: 10,
 *   language: 'en',
 *   sort: 'newest'
 * });
 *
 * @param {string} actorId - The ID of the actor to run
 * @param {Object} parameters - The parameters to pass to the actor
 * @returns {Promise<Object>} - The results of the actor run
 */
async function runActorAndGetResults(actorId, parameters) {
  // Initialize token manager if not already done
  const manager = initializeTokenManager();

  // Get the current token (cached, no checking)
  const token = await manager.getCurrentToken();

  // Initialize Apify client with selected token
  const apifyClient = new ApifyClient({
    token: token,
  });

  // Run the actor with specified parameters
  const run = await apifyClient.actor(actorId).call(parameters);

  // Get the scraped results from Apify dataset
  const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

  logger.info(`Successfully fetched ${items.length} items`);

  // Check token and rotate if needed (non-blocking, runs in background)
  // This happens AFTER we got the results, so it doesn't slow down the response
  manager.checkAndRotateToken().catch(err => {
    logger.error(`Background token check failed: ${err.message}`);
  });

  return items;
}

export default {
  runActorAndGetResults,
  initializeTokenManager,
  getCurrentToken
};
