import logger from '#modules/logger/index.js';
import retryable from '#modules/retryable/index.js';
import { ApifyClient } from 'apify-client';

/**
 * Transform Apify tweet data to Subnet-111 format
 * @param {object} apifyTweet - Raw tweet data from Apify
 * @returns {object} - Tweet in Subnet-111 format
 */
function transformTweetToSubnet111Format(apifyTweet) {
  return {
    tweetId: apifyTweet.id || String(Date.now()),
    username: apifyTweet.author?.userName || "unknown",
    text: apifyTweet.text || "",
    createdAt: apifyTweet.createdAt || new Date().toISOString(),
    tweetUrl: apifyTweet.url || `https://twitter.com/${apifyTweet.username}/status/${apifyTweet.id}`,
    hashtags: apifyTweet.entities?.hashtags?.map(h => h.text) || [],
    userId: apifyTweet.author?.id || "unknown",
    displayName: apifyTweet.author?.name || "Unknown User",
    followersCount: apifyTweet.author?.followers || 0,
    followingCount: apifyTweet.author?.following || 0,
    verified: apifyTweet.author?.isVerified || false,
    userDescription: apifyTweet.author?.profile_bio?.description || apifyTweet.author?.description || ""
  };
}

/**
 * Fetches X/Twitter tweets for a given keyword using Apify.
 *
 * This function retrieves tweets for a specific keyword using the KaitoEasyAPI Apify actor.
 * It uses retry logic for reliability and transforms the data to Subnet-111 format.
 * The number of tweets fetched is determined by the GRAVITY_TWEET_LIMIT environment variable.
 *
 * @example
 * ```javascript
 * const tweets = await fetchTweets({
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
 * - Tweet count is configured via GRAVITY_TWEET_LIMIT environment variable
 * - Uses Apify actor: kaitoeasyapi/twitter-x-data-tweet-scraper-pay-per-result-cheapest
 * - Transforms Apify response to Subnet-111 format with all 12 required fields
 */
const fetchTweets = async ({ keyword }) => {
  try {
    // Check for required environment variables
    if (!process.env.APIFY_TOKEN) {
      throw new Error('APIFY_TOKEN not configured');
    }

    if (!process.env.GRAVITY_TWEET_LIMIT) {
      throw new Error('GRAVITY_TWEET_LIMIT not configured');
    }

    const tweetLimit = Number.parseInt(process.env.GRAVITY_TWEET_LIMIT, 10);

    logger.info(`[Miner] Fetching tweets using Apify - Keyword: ${keyword}, Limit: ${tweetLimit}`);

    // Run the Apify scraper with retry logic
    logger.info(`[Miner] Starting Apify actor for tweets fetch...`);
    const items = await retryable(async () => {
      // Initialize the ApifyClient
      const client = new ApifyClient({
        token: process.env.APIFY_TOKEN,
      });

      // Prepare Apify Actor input
      const input = {
        "twitterContent": keyword,
        "lang": "en",
        "url": "",
        "maxItems": tweetLimit,
        "queryType": "Latest"
      };

      // Run the Actor and wait for it to finish
      const run = await client.actor("kaitoeasyapi/twitter-x-data-tweet-scraper-pay-per-result-cheapest").call(input);

      // Fetch results from the dataset
      const { items } = await client.dataset(run.defaultDatasetId).listItems();

      // Transform tweets to Subnet-111 format
      const tweets = items.map(item => transformTweetToSubnet111Format(item));

      logger.info(`[Miner] Successfully fetched ${tweets.length} tweets from Apify`);

      return tweets;
    }, 10);

    // Return structured response with tweets
    return items;
  } catch (error) {
    logger.error(`[Miner] Error fetching tweets:`, error);
    throw error;
  }
}

export default fetchTweets

