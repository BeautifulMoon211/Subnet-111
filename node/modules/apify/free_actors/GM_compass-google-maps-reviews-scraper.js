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
    "startUrls": [
        {
            "url": "https://www.google.com/maps/place/Yellowstone+National+Park/@44.5857951,-110.5140571,9z/data=!3m1!4b1!4m5!3m4!1s0x5351e55555555555:0xaca8f930348fe1bb!8m2!3d44.427963!4d-110.588455?hl=en-GB"
        }
    ],
    "maxReviews": 100,
    "language": "en"
};

// Run the Actor and wait for it to finish
const run = await client.actor("compass/google-maps-reviews-scraper").call(input);

// Fetch and print Actor results from the run's dataset (if any)
console.log('Results from dataset');
console.log(`💾 Check your data here: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);
const { items } = await client.dataset(run.defaultDatasetId).listItems();
items.forEach((item) => {
    console.dir(item);
});

// 📚 Want to learn more 📖? Go to → https://docs.apify.com/api/client/js/docs
