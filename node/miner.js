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
app.listen(PORT, () => {
  const tweetLimit = process.env.TWEET_LIMIT || config.MINER.X_TWEETS.DEFAULT_TWEET_LIMIT;

  // Check Apify token configuration
  let apifyStatus = 'Not configured';
  try {
    apify.initializeTokenManager();
    const tokens = process.env.APIFY_TOKENS || process.env.APIFY_TOKEN;
    const tokenCount = tokens.split(',').map(t => t.trim()).filter(t => t).length;
    apifyStatus = `${tokenCount} token(s) configured`;
  } catch (error) {
    apifyStatus = 'Not configured';
  }

  logger.info('='.repeat(50));
  logger.info(`[Miner] Node running on port ${PORT}`);
  logger.info(`[Miner] Fetch endpoint: POST /fetch`);
  logger.info(`[Miner] Apify tokens: ${apifyStatus}`);
  logger.info(`[Miner] Tweet limit: ${tweetLimit}`);
  logger.info('='.repeat(50));
});
