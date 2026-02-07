/**
 * Test script for full x-tweets request/response flow
 * 
 * This script simulates the complete flow from validator to miner:
 * 1. Creates a request in Subnet-111 format
 * 2. Calls the fetch route logic
 * 3. Returns response in Subnet-111 format
 * 
 * Usage: node test-full-flow.js [keyword]
 * 
 * Examples:
 *   node test-full-flow.js
 *   node test-full-flow.js "ethereum"
 *   node test-full-flow.js "solana"
 */

import dotenv from 'dotenv';
import config from './config.js';
import fetch from './utils/miner/types/x-tweets/fetch/index.js';

// Load environment variables
dotenv.config();

console.log('='.repeat(80));
console.log('Full X-Tweets Request/Response Flow Test');
console.log('='.repeat(80));
console.log('');

// Get keyword from command line or use default
const keyword = process.argv[2] || '"bitcoin"';

// Check environment variables
if (!process.env.APIFY_TOKEN) {
    console.error('❌ Error: Missing APIFY_TOKEN');
    console.error('   Please check /node/.env file');
    process.exit(1);
}

async function testFullFlow() {
    try {
        // Step 1: Create request in Subnet-111 format (like validator sends)
        const request = {
            typeId: 'x-tweets',
            metadata: {
                keyword: keyword
            },
            timeout: 120
        };
        
        console.log('Step 1: Request (Subnet-111 Format)');
        console.log('-'.repeat(80));
        console.log(JSON.stringify(request, null, 2));
        console.log('');
        console.log('='.repeat(80));
        console.log('');
        
        // Step 2: Extract metadata and call fetch
        const tweetLimit = process.env.TWEET_LIMIT || config.MINER.X_TWEETS.DEFAULT_TWEET_LIMIT;

        console.log('Step 2: Processing Request');
        console.log('-'.repeat(80));
        console.log(`  Type ID: ${request.typeId}`);
        console.log(`  Keyword: ${request.metadata.keyword}`);
        console.log(`  Timeout: ${request.timeout}s`);
        console.log(`  Tweet Limit: ${tweetLimit}`);
        console.log('');
        console.log('⏳ Fetching tweets from Apify...');
        console.log('');

        const startTime = Date.now();

        // Call fetch (this is what the miner does)
        const responses = await fetch(request.metadata);
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        // Step 3: Build response in Subnet-111 format
        const response = {
            status: 'success',
            typeId: request.typeId,
            metadata: request.metadata,
            timeout: request.timeout,
            responses: responses,
            timestamp: new Date().toISOString()
        };
        
        console.log('');
        console.log('='.repeat(80));
        console.log('');
        console.log('Step 3: Response (Subnet-111 Format)');
        console.log('-'.repeat(80));
        console.log('');
        console.log(`Status: ${response.status}`);
        console.log(`Type ID: ${response.typeId}`);
        console.log(`Keyword: ${response.metadata.keyword}`);
        console.log(`Timeout: ${response.timeout}s`);
        console.log(`Tweets Fetched: ${response.responses.length}`);
        console.log(`Timestamp: ${response.timestamp}`);
        console.log(`Duration: ${duration}s`);
        console.log('');
        
        if (response.responses.length > 0) {
            console.log('-'.repeat(80));
            console.log('Sample Response (First Tweet):');
            console.log('-'.repeat(80));
            console.log('');
            console.log(JSON.stringify(response.responses[0], null, 2));
            console.log('');
            
            console.log('-'.repeat(80));
            console.log('All Tweets:');
            console.log('-'.repeat(80));
            console.log('');
            
            response.responses.forEach((tweet, index) => {
                const num = (index + 1).toString().padStart(3);
                const username = `@${tweet.username}`.padEnd(20);
                const text = tweet.text.substring(0, 50);
                console.log(`${num}. ${username} ${text}${tweet.text.length > 50 ? '...' : ''}`);
            });
            console.log('');
        }
        
        console.log('='.repeat(80));
        console.log('Full Response JSON:');
        console.log('='.repeat(80));
        console.log('');
        console.log(JSON.stringify(response, null, 2));
        console.log('');
        
        console.log('='.repeat(80));
        console.log('✓ Full Flow Test Complete');
        console.log('='.repeat(80));
        console.log('');
        console.log('Summary:');
        console.log(`  ✓ Request created in Subnet-111 format`);
        console.log(`  ✓ Tweets fetched from Apify: ${response.responses.length}`);
        console.log(`  ✓ Response formatted in Subnet-111 format`);
        console.log(`  ✓ Duration: ${duration}s`);
        console.log('');
        console.log('This is exactly how the miner processes requests from validators!');
        console.log('');
        
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
        }
        
        console.error('');
        process.exit(1);
    }
}

// Run the test
testFullFlow().catch(console.error);

