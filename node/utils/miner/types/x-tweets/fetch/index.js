import logger from '#modules/logger/index.js';
import apify from '#modules/apify/index.js';
import config from '#config';
import retryable from '#modules/retryable/index.js';
import { transformTweets } from '../transform.js';

/**
 * Fetches X/Twitter tweets for a given keyword using the Apify actor.
 *
 * This function retrieves tweets for a specific keyword using the configured Apify actor.
 * It uses retry logic for reliability and transforms the data to Subnet-111 format.
 * The number of tweets fetched is determined by the TWEET_LIMIT environment variable.
 *
 * @example
 * ```javascript
 * const tweets = await fetch({
 *   keyword: 'bitcoin'
 * });
 * ```
 *
 * @param {Object} parameters - The parameters for fetching tweets
 * @param {string} parameters.keyword - The keyword to search for tweets
 * @returns {Promise<Array>} A promise that resolves to an array of tweet objects in Subnet-111 format
 * @throws {Error} Throws an error if the Apify scraper fails or if there are network issues
 *
 * @description
 * - Uses retryable wrapper with up to 10 retry attempts for reliability
 * - Logs detailed information about the fetch process
 * - Tweet count is configured via TWEET_LIMIT environment variable or uses default
 * - Utilizes the configured Apify actor from `config.MINER.X_TWEETS.APIFY_ACTORS.X_TWEETS`
 * - Transforms Apify response to Subnet-111 format with all 12 required fields
 */
const fetch = async ({ keyword }) => {
  try {
    // Get tweet limit from environment variable or use default from config
    const tweetLimit = process.env.TWEET_LIMIT
      ? Number.parseInt(process.env.TWEET_LIMIT, 10)
      : config.MINER.X_TWEETS.DEFAULT_TWEET_LIMIT;

    logger.info(`[Miner] Fetching tweets - Keyword: ${keyword}, Limit: ${tweetLimit}`);

    // Run the Apify actor and get the results
    logger.info(`[Miner] Starting Apify actor for tweets fetch...`);
    const items = await retryable(async () => {
      const rawTweets = await apify.runActorAndGetResults(
        config.MINER.X_TWEETS.APIFY_ACTORS.X_TWEETS,
        {
          twitterContent: keyword,
          lang: config.MINER.X_TWEETS.DEFAULT_PARAMS.lang,
          url: "",
          maxItems: tweetLimit,
          queryType: config.MINER.X_TWEETS.DEFAULT_PARAMS.queryType
        }
      );

      // Transform tweets to Subnet-111 format
      const tweets = transformTweets(rawTweets);

      return tweets;
    }, 10);

    // Return structured response with tweets
    return items;
  } catch (error) {
    logger.error(`[Miner] Error fetching tweets:`, error);
    throw error;
  }
}

export default fetch

