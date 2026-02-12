import dotenv from 'dotenv';
import express from 'express';
import logger from '#modules/logger/index.js';
import config from '#config';
import fetchRoute from '#routes/miner/fetch.js';
import localhostOnly from '#modules/middlewares/localhost-only.js';
import apify from '#modules/apify/index.js';

dotenv.config();

const app = express();
const PORT = process.env.MINER_NODE_PORT || 3001;

// Middleware
app.use(localhostOnly);
app.use(express.json());

// Routes
app.post('/fetch', fetchRoute.execute);

// Start server and log configuration
app.listen(PORT, async () => {
  const tweetLimit = process.env.TWEET_LIMIT || config.MINER.X_TWEETS.DEFAULT_TWEET_LIMIT;

  logger.info('='.repeat(70));
  logger.info(`[Miner] Node running on port ${PORT}`);
  logger.info(`[Miner] Fetch endpoint: POST /fetch`);
  logger.info(`[Miner] Tweet limit: ${tweetLimit}`);
  logger.info('='.repeat(70));

  // Check Apify token configuration and display credits
  try {
    const tokenManager = apify.initializeTokenManager();
    const tokens = process.env.APIFY_TOKENS || process.env.APIFY_TOKEN;

    if (!tokens) {
      logger.warning('[Apify] No tokens configured');
      logger.info('='.repeat(70));
      return;
    }

    const tokenList = tokens.split(',').map(t => t.trim()).filter(t => t);
    logger.info(`[Apify] Found ${tokenList.length} token(s) in environment`);
    logger.info('='.repeat(70));
    logger.info('[Apify] Checking credits for all tokens...');
    logger.info('');

    // Check all tokens and display credits
    const results = await tokenManager.checkAllTokens();

    logger.info('');
    logger.info('='.repeat(70));
    logger.info('[Apify] Token Credits Summary:');
    logger.info('='.repeat(70));

    // Display detailed summary
    let totalRemaining = 0;
    let validCount = 0;

    results.forEach((result, index) => {
      const tokenPreview = result.token.substring(0, 30) + '...';

      if (result.isValid) {
        validCount++;
        totalRemaining += result.remainingCredits;

        logger.info(`Token ${index + 1}: ${tokenPreview}`);
        logger.info(`  ├─ Status: ✓ VALID`);
        logger.info(`  └─ Remaining: $${result.remainingCredits.toFixed(4)}`);

        if (result.remainingCredits < 0.1) {
          logger.warning(`     ⚠ WARNING: Below $0.1 threshold!`);
        }
        logger.info('');
      } else {
        logger.error(`Token ${index + 1}: ${tokenPreview}`);
        logger.error(`  └─ Status: ✗ INVALID - ${result.error || 'Unknown error'}`);
        logger.info('');
      }
    });

    logger.info('='.repeat(70));
    logger.info(`[Apify] Total valid tokens: ${validCount}/${results.length}`);
    logger.info(`[Apify] Total remaining credits: $${totalRemaining.toFixed(4)}`);
    logger.info('='.repeat(70));

    // Select first available token
    await tokenManager.getCurrentToken();

  } catch (error) {
    logger.error(`[Apify] Error checking tokens: ${error.message}`);
    logger.info('='.repeat(70));
  }
});
