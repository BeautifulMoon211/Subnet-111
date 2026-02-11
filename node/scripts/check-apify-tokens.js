#!/usr/bin/env node
/**
 * Check Apify Tokens Status
 * 
 * Quickly check the status and remaining credits for all Apify tokens
 * 
 * Usage:
 *   node scripts/check-apify-tokens.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import apify from '../modules/apify/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from node/.env
dotenv.config({ path: resolve(__dirname, '../.env') });

async function main() {
  console.log('='.repeat(70));
  console.log('Apify Tokens Status Check');
  console.log('='.repeat(70));

  try {
    const tokenManager = apify.initializeTokenManager();
    const tokens = process.env.APIFY_TOKENS || process.env.APIFY_TOKEN;

    if (!tokens) {
      console.log('\n❌ No tokens configured in .env file');
      console.log('Please set APIFY_TOKENS in node/.env');
      console.log('='.repeat(70));
      process.exit(1);
    }

    const tokenList = tokens.split(',').map(t => t.trim()).filter(t => t);
    console.log(`\n📊 Found ${tokenList.length} token(s) in environment`);
    console.log('='.repeat(70));
    console.log('Checking all tokens...\n');

    // Check all tokens
    const results = await tokenManager.checkAllTokens();

    // Display results
    let totalRemaining = 0;
    let validCount = 0;
    let invalidCount = 0;

    results.forEach((result, index) => {
      const tokenPreview = result.token.substring(0, 30) + '...';

      if (result.isValid) {
        validCount++;
        totalRemaining += result.remainingCredits;

        console.log(`✅ Token ${index + 1}: ${tokenPreview}`);
        console.log(`   Status: VALID`);
        console.log(`   Remaining: $${result.remainingCredits.toFixed(4)}`);

        if (result.remainingCredits < 0.1) {
          console.log(`   ⚠️  WARNING: Below $0.1 threshold!`);
        }
      } else {
        invalidCount++;
        console.log(`❌ Token ${index + 1}: ${tokenPreview}`);
        console.log(`   Status: INVALID`);
        console.log(`   Error: ${result.error || 'Unknown error'}`);
      }
      console.log('');
    });

    // Summary
    console.log('='.repeat(70));
    console.log('📈 Summary:');
    console.log('='.repeat(70));
    console.log(`Total Tokens: ${results.length}`);
    console.log(`Valid Tokens: ${validCount} ✅`);
    console.log(`Invalid Tokens: ${invalidCount} ❌`);
    console.log(`Total Credits: $${totalRemaining.toFixed(4)}`);
    console.log(`Average per Valid Token: $${(totalRemaining / validCount).toFixed(4)}`);
    console.log('='.repeat(70));

    // Current token in use
    const currentToken = await tokenManager.getCurrentToken();
    const currentIndex = tokenList.indexOf(currentToken);
    if (currentIndex >= 0) {
      console.log(`\n🎯 Currently Using: Token #${currentIndex + 1}`);
      console.log('='.repeat(70));
    }

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    console.log('='.repeat(70));
    process.exit(1);
  }
}

main();

