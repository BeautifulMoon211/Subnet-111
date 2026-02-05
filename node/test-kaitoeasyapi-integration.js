/**
 * Test script to verify KaitoEasyAPI integration
 * 
 * This script tests the new KaitoEasyAPI implementation by:
 * 1. Importing the kaitoeasyapi module
 * 2. Calling it with a test keyword
 * 3. Verifying the response format matches Subnet-111 spec
 * 
 * Usage: node test-kaitoeasyapi-integration.js
 */

import kaitoEasyApi from './kaitoeasyapi/index.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('='.repeat(70));
console.log('KaitoEasyAPI Integration Test');
console.log('='.repeat(70));
console.log('');

// Check environment variables
console.log('Environment Variables:');
console.log(`  APIFY_TOKEN: ${process.env.APIFY_TOKEN ? '✓ Loaded' : '✗ Missing'}`);
console.log(`  TWEET_LIMIT: ${process.env.TWEET_LIMIT || 'Not set (will use default 100)'}`);
console.log('');

if (!process.env.APIFY_TOKEN) {
    console.error('❌ Error: APIFY_TOKEN not found in environment variables');
    console.error('   Please set APIFY_TOKEN in /node/.env');
    process.exit(1);
}

console.log('-'.repeat(70));
console.log('');

async function testKaitoEasyAPI() {
    try {
        const keyword = '"bitcoin"';
        
        console.log(`Testing KaitoEasyAPI with keyword: ${keyword}`);
        console.log('');
        console.log('Calling kaitoEasyApi({ keyword })...');
        console.log('');
        
        const startTime = Date.now();
        
        // Call the KaitoEasyAPI module
        const tweets = await kaitoEasyApi({ keyword });
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log('');
        console.log('-'.repeat(70));
        console.log('');
        console.log('✓ Success!');
        console.log('');
        console.log(`Duration: ${duration}s`);
        console.log(`Tweets fetched: ${tweets.length}`);
        console.log('');
        
        if (tweets.length > 0) {
            console.log('Sample Tweet (first result):');
            console.log('');
            console.log(JSON.stringify(tweets[0], null, 2));
            console.log('');
            
            // Validate Subnet-111 format
            console.log('-'.repeat(70));
            console.log('');
            console.log('Validating Subnet-111 Format:');
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
                const status = present ? '✓' : '✗';
                console.log(`  ${status} ${field}: ${present ? typeof tweets[0][field] : 'MISSING'}`);
                if (!present) allFieldsPresent = false;
            });
            
            console.log('');
            
            if (allFieldsPresent) {
                console.log('✓ All required fields present!');
            } else {
                console.log('✗ Some required fields are missing!');
            }
        } else {
            console.log('⚠️  No tweets returned (this might be normal if no tweets match the keyword)');
        }
        
        console.log('');
        console.log('='.repeat(70));
        console.log('✓ KaitoEasyAPI Integration Test Complete');
        console.log('='.repeat(70));
        
    } catch (error) {
        console.error('');
        console.error('='.repeat(70));
        console.error('❌ Test Failed');
        console.error('='.repeat(70));
        console.error('');
        console.error('Error:', error.message);
        console.error('');
        console.error('Stack trace:');
        console.error(error.stack);
        console.error('');
        process.exit(1);
    }
}

// Run the test
testKaitoEasyAPI().catch(console.error);

