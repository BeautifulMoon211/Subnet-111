/**
 * Test script to verify environment variable loading
 * 
 * Usage: node test_env_loading.js
 */

const path = require('path');

console.log('='.repeat(70));
console.log('Environment Variable Loading Test');
console.log('='.repeat(70));
console.log('');

// Show script location
console.log('Script location:');
console.log(`  __dirname: ${__dirname}`);
console.log(`  .env path: ${path.resolve(__dirname, '../.env')}`);
console.log('');

// Load environment variables
console.log('Loading environment variables...');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('');

// Check loaded variables
console.log('Environment variables loaded:');
console.log('');

const envVars = [
    'APIFY_TOKEN',
    'GRAVITY_API_TOKEN',
    'TWEET_LIMIT',
    'MINER_NODE_PORT'
];

let allLoaded = true;

envVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✓' : '✗';
    const displayValue = value 
        ? (varName.includes('TOKEN') ? value.substring(0, 20) + '...' : value)
        : 'Not found';
    
    console.log(`  ${status} ${varName}: ${displayValue}`);
    
    if (!value) {
        allLoaded = false;
    }
});

console.log('');
console.log('='.repeat(70));

if (allLoaded) {
    console.log('✓ All environment variables loaded successfully!');
} else {
    console.log('⚠️  Some environment variables are missing');
    console.log('   Please check /node/.env file');
}

console.log('='.repeat(70));

