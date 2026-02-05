/**
 * X/Twitter Scraper using Apify - Subnet-111 Compatible
 *
 * Usage: node test_kaito.js
 *
 * Environment Variables:
 *   APIFY_TOKEN - Your Apify API token
 *
 * This script scrapes tweets using Apify's Twitter scraper and returns them
 * in Subnet-111 x-tweets response format.
 */

const { ApifyClient } = require('apify-client');
const fs = require('fs');
const path = require('path');

// Load environment variables from /node/.env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Read Apify token from environment variable
const APIFY_TOKEN = process.env.APIFY_TOKEN;

// Validate that APIFY_TOKEN is loaded
if (!APIFY_TOKEN) {
    console.error('❌ Error: APIFY_TOKEN not found in environment variables');
    console.error('   Please check that /node/.env file exists and contains APIFY_TOKEN');
    console.error(`   Looking for .env at: ${path.resolve(__dirname, '../.env')}`);
    process.exit(1);
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
 * Fetch tweets using Apify
 * @param {object} request - Request object in Subnet-111 format
 * @returns {Promise<object>} - Response object in Subnet-111 format
 */
async function fetch(request) {
    const startTime = Date.now();

    try {
        // Validate request
        if (!request.typeId || request.typeId !== 'x-tweets') {
            throw new Error('Invalid typeId. Expected "x-tweets"');
        }

        if (!request.metadata || !request.metadata.keyword) {
            throw new Error('Missing keyword in metadata');
        }

        console.log(`[Fetch] Processing request - Keyword: ${request.metadata.keyword}`);
        console.log(`[Fetch] Timeout: ${request.timeout}s`);

        // Clean keyword (remove quotes)
        const cleanKeyword = request.metadata.keyword.replace(/^"|"$/g, '');

        // Prepare Apify Actor input
        const input = {
            "twitterContent": request.metadata.keyword,
            "lang": "en",
            "url": "",
            "maxItems": Number(process.env.TWEET_LIMIT) || 100,
            "queryType": "Latest"
        };

        console.log(`[Apify] Running actor with keyword: "${cleanKeyword}"`);
        console.log(`[Apify] Max items: ${input.maxItems}`);

        // Run the Actor and wait for it to finish
        const run = await client.actor("kaitoeasyapi/twitter-x-data-tweet-scraper-pay-per-result-cheapest").call(input);

        console.log(`[Apify] Actor completed`);
        console.log(`[Apify] Dataset: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);

        // Fetch results from the dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        console.log(`[Apify] Found ${items.length} tweets`);

        // Transform tweets to Subnet-111 format
        const tweets = items.map(item => transformTweetToSubnet111Format(item));

        // Build response matching Subnet-111 pattern
        const response = {
            status: 'success',
            typeId: request.typeId,
            metadata: request.metadata,
            timeout: request.timeout,
            responses: tweets,
            timestamp: new Date().toISOString()
        };

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[Fetch] Completed in ${duration}s - Fetched ${tweets.length} tweets`);

        return response;

    } catch (error) {
        console.error(`[Fetch] Error:`, error.message);

        return {
            typeId: request.typeId || 'x-tweets',
            metadata: request.metadata || {},
            timeout: request.timeout || 120,
            error: 'Failed to fetch tweets',
            message: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('='.repeat(70));
    console.log('X/Twitter Scraper - Apify (Subnet-111 Compatible)');
    console.log('='.repeat(70));
    console.log('');

    // Show environment variable status
    console.log('✓ Environment variables loaded from: /node/.env');
    console.log(`✓ APIFY_TOKEN: ${APIFY_TOKEN.substring(0, 15)}...`);
    console.log('');

    // Example request matching Subnet-111 pattern
    const request = {
        typeId: 'x-tweets',
        metadata: {
            keyword: '"bitcoin"'
        },
        timeout: 120,
    };

    console.log('Request:');
    console.log(JSON.stringify(request, null, 2));
    console.log('');
    console.log('-'.repeat(70));
    console.log('');

    try {
        // Fetch tweets
        const response = await fetch(request);

        console.log('');
        console.log('-'.repeat(70));
        console.log('');
        console.log('Response Summary:');
        console.log(`  Status: ${response.status || 'error'}`);
        console.log(`  Type ID: ${response.typeId}`);
        console.log(`  Keyword: ${response.metadata.keyword}`);
        console.log(`  Total tweets: ${response.responses?.length || 0}`);
        console.log(`  Timestamp: ${response.timestamp}`);

        if (response.responses && response.responses.length > 0) {
            console.log('');
            console.log('Sample Tweet (first result):');
            console.log(JSON.stringify(response.responses[0], null, 2));
        }

        console.log('');
        console.log('-'.repeat(70));
        console.log('');

        // Save full response to file
        fs.writeFileSync('apify_results.json', JSON.stringify(response, null, 2));
        console.log('✓ Full response saved to apify_results.json');

        console.log('');
        console.log('='.repeat(70));
        console.log(`✓ Successfully fetched ${response.responses?.length || 0} tweets`);
        console.log('='.repeat(70));

    } catch (error) {
        console.error('Fatal Error:', error.message);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main().catch(console.error);
}

// Export for use as module
module.exports = {
    fetch,
    transformTweetToSubnet111Format
};