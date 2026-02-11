/**
 * Test script for Apify Token Manager (Node.js)
 * 
 * Tests the token rotation and credit checking functionality.
 */

import dotenv from 'dotenv';
import ApifyTokenManager from './modules/apify/token-manager.js';

dotenv.config();

async function testTokenManager() {
  console.log('='.repeat(70));
  console.log('Testing Apify Token Manager (Node.js)');
  console.log('='.repeat(70));
  console.log();

  // Check if tokens are configured
  const tokens = process.env.APIFY_TOKENS || process.env.APIFY_TOKEN;
  if (!tokens) {
    console.log('❌ No APIFY_TOKENS or APIFY_TOKEN found in environment');
    console.log();
    console.log('Please set APIFY_TOKENS in your .env file:');
    console.log('APIFY_TOKENS=token1,token2,token3');
    process.exit(1);
  }

  const tokenList = tokens.split(',').map(t => t.trim()).filter(t => t);
  console.log(`📋 Found ${tokenList.length} token(s) in environment`);
  tokenList.forEach((token, i) => {
    console.log(`   Token ${i + 1}: ${token.substring(0, 25)}...`);
  });
  console.log();

  // Initialize token manager
  console.log('🔧 Initializing token manager...');
  const tokenManager = new ApifyTokenManager(tokens);
  console.log();

  // Test 1: Check all tokens
  console.log('='.repeat(70));
  console.log('Test 1: Check Credits for All Tokens');
  console.log('='.repeat(70));
  console.log();

  const results = await tokenManager.checkAllTokens();
  console.log();

  // Display summary
  console.log('📊 Summary:');
  console.log('-'.repeat(70));
  const validCount = results.filter(r => r.isValid).length;
  console.log(`   Total tokens: ${results.length}`);
  console.log(`   Valid tokens: ${validCount}`);
  console.log(`   Invalid tokens: ${results.length - validCount}`);
  console.log();

  // Test 2: Select best token
  console.log('='.repeat(70));
  console.log('Test 2: Select Best Token');
  console.log('='.repeat(70));
  console.log();

  const bestToken = await tokenManager.selectBestToken();
  console.log();
  console.log(`✅ Best token selected: ${bestToken.substring(0, 25)}...`);
  console.log();

  // Test 3: Get current token (should use cache)
  console.log('='.repeat(70));
  console.log('Test 3: Get Current Token (Cached)');
  console.log('='.repeat(70));
  console.log();

  const currentToken = await tokenManager.getCurrentToken();
  console.log(`✅ Current token: ${currentToken.substring(0, 25)}...`);
  console.log();

  // Display detailed info for each token
  console.log('='.repeat(70));
  console.log('Detailed Token Information');
  console.log('='.repeat(70));
  console.log();

  results.forEach((result, i) => {
    const tokenPreview = result.token.substring(0, 30) + '...';
    console.log(`Token ${i + 1}: ${tokenPreview}`);
    console.log('-'.repeat(70));

    if (result.isValid) {
      console.log(`   Status: ✅ VALID`);
      console.log(`   Included Credits: $${result.includedCredits.toFixed(2)}`);
      console.log(`   Used Credits: $${result.usedCredits.toFixed(4)}`);
      console.log(`   Remaining Credits: $${result.remainingCredits.toFixed(4)}`);

      // Calculate percentage
      if (result.includedCredits > 0) {
        const usagePct = (result.usedCredits / result.includedCredits) * 100;
        console.log(`   Usage: ${usagePct.toFixed(1)}%`);
      }

      // Check if below threshold
      if (result.remainingCredits < 0.1) {
        console.log(`   ⚠️  WARNING: Below $0.1 threshold!`);
      }
    } else {
      console.log(`   Status: ❌ INVALID`);
      console.log(`   Error: ${result.error || 'Unknown error'}`);
    }

    console.log();
  });

  console.log('='.repeat(70));
  console.log('Test Completed!');
  console.log('='.repeat(70));
}

// Run the test
testTokenManager()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

