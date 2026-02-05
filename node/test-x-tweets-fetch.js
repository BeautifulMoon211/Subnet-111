/**
 * Test script for x-tweets fetch implementation
 * 
 * This script tests the new merged x-tweets fetch code by:
 * 1. Importing the fetchTweets function directly
 * 2. Calling it with a test keyword
 * 3. Displaying the results in Subnet-111 format
 * 
 * Usage: node test-x-tweets-fetch.js [keyword] [limit]
 * 
 * Examples:
 *   node test-x-tweets-fetch.js
 *   node test-x-tweets-fetch.js bitcoin
 *   node test-x-tweets-fetch.js ethereum 20
 */

import dotenv from 'dotenv';
import config from './config.js';
import fetch from './utils/miner/types/x-tweets/fetch/index.js';

// Load environment variables
dotenv.config();

console.log('='.repeat(80));
console.log('X-Tweets Fetch Test - Merged Implementation');
console.log('='.repeat(80));
console.log('');

// Get keyword and limit from command line arguments
const keyword = process.argv[2] || '"bitcoin"';
const customLimit = process.argv[3];

// Set custom limit if provided
if (customLimit) {
    process.env.TWEET_LIMIT = customLimit;
}

// Check environment variables
console.log('Environment Variables:');
console.log(`  APIFY_TOKEN: ${process.env.APIFY_TOKEN ? '✓ Loaded (' + process.env.APIFY_TOKEN.substring(0, 20) + '...)' : '✗ Missing'}`);
console.log(`  TWEET_LIMIT: ${process.env.TWEET_LIMIT || '✗ Not set'}`);
console.log('');

if (!process.env.APIFY_TOKEN) {
    console.error('❌ Error: APIFY_TOKEN not found in environment variables');
    console.error('   Please set APIFY_TOKEN in /node/.env');
    console.error('');
    console.error('   Example:');
    console.error('   echo "APIFY_TOKEN=your_token_here" >> Subnet-111/node/.env');
    console.error('');
    process.exit(1);
}

if (!process.env.TWEET_LIMIT) {
    console.log(`⚠️  TWEET_LIMIT not set, will use default: ${config.MINER.X_TWEETS.DEFAULT_TWEET_LIMIT}`);
    console.log('');
}

console.log('-'.repeat(80));
console.log('');

async function testXTweetsFetch() {
    try {
        const tweetLimit = process.env.TWEET_LIMIT || config.MINER.X_TWEETS.DEFAULT_TWEET_LIMIT;

        console.log('Test Parameters:');
        console.log(`  Keyword: ${keyword}`);
        console.log(`  Limit: ${tweetLimit} tweets`);
        console.log('');
        console.log('-'.repeat(80));
        console.log('');
        console.log('Calling fetch({ keyword })...');
        console.log('');
        console.log('⏳ This may take 30-60 seconds depending on Apify actor speed...');
        console.log('');

        const startTime = Date.now();

        // Call the fetch function
        const tweets = await fetch({ keyword });
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log('');
        console.log('='.repeat(80));
        console.log('✓ Success!');
        console.log('='.repeat(80));
        console.log('');
        console.log(`Duration: ${duration}s`);
        console.log(`Tweets fetched: ${tweets.length}`);
        console.log('');
        
        if (tweets.length > 0) {
            console.log('-'.repeat(80));
            console.log('Sample Tweet (first result):');
            console.log('-'.repeat(80));
            console.log('');
            console.log(JSON.stringify(tweets[0], null, 2));
            console.log('');
            
            // Validate Subnet-111 format
            console.log('-'.repeat(80));
            console.log('Validating Subnet-111 Format (All 12 Required Fields):');
            console.log('-'.repeat(80));
            console.log('');
            
            const requiredFields = [
                'tweetId',
                'username',
                'text',
                'createdAt',
                'tweetUrl',
                'hashtags',
                'userId',
                'displayName',
                'followersCount',
                'followingCount',
                'verified',
                'userDescription'
            ];
            
            let allFieldsPresent = true;
            
            requiredFields.forEach(field => {
                const present = tweets[0].hasOwnProperty(field);
                const value = tweets[0][field];
                const type = typeof value;
                const status = present ? '✓' : '✗';
                
                let displayValue = '';
                if (type === 'string') {
                    displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
                } else if (type === 'number') {
                    displayValue = value;
                } else if (type === 'boolean') {
                    displayValue = value;
                } else if (Array.isArray(value)) {
                    displayValue = `[${value.length} items]`;
                } else {
                    displayValue = 'MISSING';
                }
                
                console.log(`  ${status} ${field.padEnd(20)} (${type.padEnd(8)}): ${displayValue}`);
                
                if (!present) allFieldsPresent = false;
            });
            
            console.log('');
            
            if (allFieldsPresent) {
                console.log('✓ All required fields present!');
            } else {
                console.log('✗ Some required fields are missing!');
            }
            
            console.log('');
            console.log('-'.repeat(80));
            console.log('All Tweets Summary:');
            console.log('-'.repeat(80));
            console.log('');
            
            tweets.forEach((tweet, index) => {
                console.log(`${(index + 1).toString().padStart(3)}. @${tweet.username}: ${tweet.text.substring(0, 60)}${tweet.text.length > 60 ? '...' : ''}`);
            });
            
        } else {
            console.log('⚠️  No tweets returned');
            console.log('   This might be normal if:');
            console.log('   - No tweets match the keyword');
            console.log('   - The keyword is too specific');
            console.log('   - Apify actor returned no results');
        }
        
        console.log('');
        console.log('='.repeat(80));
        console.log('✓ X-Tweets Fetch Test Complete');
        console.log('='.repeat(80));
        
    } catch (error) {
        console.error('');
        console.error('='.repeat(80));
        console.error('❌ Test Failed');
        console.error('='.repeat(80));
        console.error('');
        console.error('Error:', error.message);
        console.error('');
        
        if (error.stack) {
            console.error('Stack trace:');
            console.error(error.stack);
            console.error('');
        }
        
        console.error('Troubleshooting:');
        console.error('  1. Check that APIFY_TOKEN is valid');
        console.error('  2. Check that you have Apify credits');
        console.error('  3. Check your internet connection');
        console.error('  4. Try a different keyword');
        console.error('');
        
        process.exit(1);
    }
}

// Run the test
testXTweetsFetch().catch(console.error);

