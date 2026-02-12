import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';
import { getCurrentToken } from '../../apify/token-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
    path: path.resolve(__dirname, '../../../.env'),
});

// Initialize the ApifyClient with current token from token manager
const client = new ApifyClient({
    token: getCurrentToken(),
});

// Prepare Actor input
const input = {
    "category": "bakery",
    "keyword": "",
    "country": "US",
    "state": "All",
    "city": "",
    "area": 10,
    "max_results": 100
};

// Run the Actor and wait for it to finish
const run = await client.actor("xmiso_scrapers/millions-us-businesses-leads-with-emails-from-google-maps").call(input);

// Fetch and print Actor results from the run's dataset (if any)
console.log('Results from dataset');
console.log(`💾 Check your data here: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);
const { items } = await client.dataset(run.defaultDatasetId).listItems();
items.forEach((item) => {
    console.dir(item);
});

// 📚 Want to learn more 📖? Go to → https://docs.apify.com/api/client/js/docs
