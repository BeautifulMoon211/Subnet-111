/**
 * X/Twitter Scraper using Apify - Subnet-111 Compatible Module
 * 
 * This module provides tweet scraping functionality using Apify's Twitter scraper
 * and returns data in Subnet-111 x-tweets response format.
 */

import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from /node/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Read Apify token from environment variable
const APIFY_TOKEN = process.env.APIFY_TOKEN;

// Validate that APIFY_TOKEN is loaded
if (!APIFY_TOKEN) {
    throw new Error('APIFY_TOKEN not found in environment variables');
}

// Initialize the ApifyClient with Apify API token
const client = new ApifyClient({
    token: APIFY_TOKEN,
});

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
 * Fetch tweets using Apify for a given keyword
 * 
 * @param {Object} parameters - The parameters for fetching tweets
 * @param {string} parameters.keyword - The keyword to search for tweets
 * @returns {Promise<Array>} A promise that resolves to an array of tweet objects in Subnet-111 format
 * @throws {Error} Throws an error if the Apify actor fails or if there are network issues
 * 
 * @example
 * ```javascript
 * const tweets = await fetchTweets({ keyword: 'bitcoin' });
 * ```
 */
async function fetchTweets({ keyword }) {
    try {
        // Clean keyword (remove quotes if present)
        const cleanKeyword = keyword.replace(/^"|"$/g, '');
        
        // Get tweet limit from environment variable
        const tweetLimit = Number(process.env.GRAVITY_TWEET_LIMIT) || 100;

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

        return tweets;

    } catch (error) {
        throw new Error(`Apify scraper error: ${error.message}`);
    }
}

export default fetchTweets;

