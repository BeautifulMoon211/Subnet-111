import { ApifyClient } from 'apify-client';
import dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
    path: path.resolve(__dirname, '../../.env'),
});

// Initialize the ApifyClient with your Apify API token
// Replace the '<YOUR_API_TOKEN>' with your token
const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

// Prepare Actor input
const input = {
    "tweetIDs": [],
    "twitterContent": "from:elonmusk make -\"live laugh love\"",
    "searchTerms": [],
    "lang": "en",
    "from": "elonmusk",
    "to": "",
    "@": "",
    "list": "",
    "near": "",
    "within": "",
    "geocode": "",
    "since": "2021-12-31_23:59:59_UTC",
    "until": "2024-12-31_23:59:59_UTC",
    "since_time": "",
    "until_time": "",
    "since_id": "",
    "max_id": "",
    "within_time": "",
    "conversation_id": "",
    "quoted_tweet_id": "",
    "quoted_user_id": "",
    // "card_name": "",
    "url": ""
};

// Run the Actor and wait for it to finish
const run = await client.actor("kaitoeasyapi/twitter-x-data-tweet-scraper-pay-per-result-cheapest").call(input);

// Fetch and print Actor results from the run's dataset (if any)
console.log('Results from dataset');
console.log(`💾 Check your data here: https://console.apify.com/storage/datasets/${run.defaultDatasetId}`);
const { items } = await client.dataset(run.defaultDatasetId).listItems();
items.forEach((item) => {
    console.dir(item);
});

// 📚 Want to learn more 📖? Go to → https://docs.apify.com/api/client/js/docs
