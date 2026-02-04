import { ApifyClient } from 'apify-client';

// Initialize the ApifyClient with your Apify API token
// Replace the '<YOUR_API_TOKEN>' with your token
const client = new ApifyClient({
    token: '<YOUR_API_TOKEN>',
});

// Prepare Actor input
const input = {
    "tweetIDs": [
        "1846987139428634858"
    ],
    "twitterContent": "from:elonmusk make -\"live laugh love\"",
    "searchTerms": [
        "from:elonmusk since:2024-01-01_00:00:00_UTC until:2024-01-02_00:00:00_UTC",
        "from:NASA starsince:2024-01-01_00:00:00_UTC until:2024-01-02_00:00:00_UTC"
    ],
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
    "card_name": "",
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
