# X/Twitter Scraper using Apify - Subnet-111 Compatible

## Overview

This script uses Apify's Twitter scraper to fetch tweets and returns them in Subnet-111 x-tweets response format.

---

## 🚀 Quick Start

### Installation

```bash
cd Subnet-111/kaitoeasyapi
npm install apify-client
```

### Configure Environment Variables

The script automatically loads environment variables from `/node/.env` file.

**Option 1: Use the existing .env file (Recommended)**

Edit `Subnet-111/node/.env` and add/update:
```bash
APIFY_TOKEN=your_apify_token_here
GRAVITY_API_TOKEN=your_gravity_token_here
TWEET_LIMIT=10
MINER_NODE_PORT=3001
```

**Option 2: Set environment variables manually**

```bash
# Linux/Mac
export APIFY_TOKEN="your_apify_token_here"

# Windows (CMD)
set APIFY_TOKEN=your_apify_token_here

# Windows (PowerShell)
$env:APIFY_TOKEN="your_apify_token_here"
```

### Run the Script

```bash
node test_kaito.js
```

---

## 📥 Request Format

The script accepts requests in Subnet-111 x-tweets format:

```json
{
  "typeId": "x-tweets",
  "metadata": {
    "keyword": "\"bitcoin\""
  },
  "timeout": 120,
  "limit": 10
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `typeId` | string | ✅ | Must be "x-tweets" |
| `metadata.keyword` | string | ✅ | Search keyword (quoted) |
| `timeout` | number | ✅ | Timeout in seconds |
| `limit` | number | ❌ | Number of tweets (default: 100) |

---

## 📤 Response Format

The script returns responses in Subnet-111 format:

```json
{
  "status": "success",
  "typeId": "x-tweets",
  "metadata": {
    "keyword": "\"bitcoin\""
  },
  "timeout": 120,
  "responses": [
    {
      "tweetId": "1234567890123456789",
      "username": "crypto_trader",
      "text": "Bitcoin is showing strong momentum today! #BTC #crypto",
      "createdAt": "2025-02-04T10:15:30.000Z",
      "tweetUrl": "https://twitter.com/crypto_trader/status/1234567890123456789",
      "hashtags": ["BTC", "crypto"],
      "userId": "987654321",
      "displayName": "Crypto Trader",
      "followersCount": 15000,
      "followingCount": 500,
      "verified": false,
      "userDescription": "Cryptocurrency enthusiast and trader"
    }
  ],
  "timestamp": "2025-02-04T12:34:56.789Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | "success" or "error" |
| `typeId` | string | "x-tweets" |
| `metadata` | object | Original request metadata |
| `timeout` | number | Original request timeout |
| `responses` | array | Array of tweet objects |
| `timestamp` | string | ISO timestamp |

### Tweet Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `tweetId` | string | Unique tweet identifier |
| `username` | string | Twitter username |
| `text` | string | Tweet text content |
| `createdAt` | string | ISO timestamp |
| `tweetUrl` | string | Link to tweet |
| `hashtags` | array | Array of hashtags |
| `userId` | string | Twitter user ID |
| `displayName` | string | User's display name |
| `followersCount` | number | Number of followers |
| `followingCount` | number | Number following |
| `verified` | boolean | Verification status |
| `userDescription` | string | User bio |

---

## 🔧 Configuration

### Environment Variables

The script loads environment variables from `Subnet-111/node/.env` file.

| Variable | Required | Description |
|----------|----------|-------------|
| `APIFY_TOKEN` | ✅ | Your Apify API token (loaded from /node/.env) |
| `GRAVITY_API_TOKEN` | ❌ | Gravity API token (if needed) |
| `TWEET_LIMIT` | ❌ | Tweet limit for Gravity API |
| `MINER_NODE_PORT` | ❌ | Miner node port |

**Note:** The script uses `path.resolve(__dirname, '../.env')` to load the `.env` file from the parent directory (`/node/.env`).

### Apify Actor

The script uses: `kaitoeasyapi/twitter-x-data-tweet-scraper-pay-per-result-cheapest`

---

## 💻 Usage Examples

### Example 1: Basic Usage

```bash
node test_kaito.js
```

Output:
```
======================================================================
X/Twitter Scraper - Apify (Subnet-111 Compatible)
======================================================================

✓ Using APIFY_TOKEN from environment variable

Request:
{
  "typeId": "x-tweets",
  "metadata": {
    "keyword": "\"bitcoin\""
  },
  "timeout": 120,
  "limit": 10
}

----------------------------------------------------------------------

[Fetch] Processing request - Keyword: "bitcoin"
[Apify] Running actor with keyword: "bitcoin"
...
```

### Example 2: Using as Module

```javascript
const { fetch } = require('./test_kaito.js');

async function getTweets() {
  const request = {
    typeId: 'x-tweets',
    metadata: {
      keyword: '"ethereum"'
    },
    timeout: 120,
    limit: 50
  };
  
  const response = await fetch(request);
  console.log(`Fetched ${response.responses.length} tweets`);
  
  return response;
}

getTweets();
```

---

## 📊 Output Files

### apify_results.json

The script saves the full response to `apify_results.json` in Subnet-111 format.

---

## 🚨 Error Handling

### Error Response Format

```json
{
  "typeId": "x-tweets",
  "metadata": {},
  "timeout": 120,
  "error": "Failed to fetch tweets",
  "message": "Detailed error message",
  "timestamp": "2025-02-04T12:34:56.789Z"
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid typeId | typeId is not "x-tweets" | Use correct typeId |
| Missing keyword | No keyword in metadata | Provide keyword |
| Apify API error | API request failed | Check API token and quota |

---

## 🔄 Data Transformation

The script automatically transforms Apify's tweet format to Subnet-111 format:

### Apify Format → Subnet-111 Format

| Apify Field | Subnet-111 Field |
|-------------|------------------|
| `id` | `tweetId` |
| `author.userName` | `username` |
| `text` | `text` |
| `createdAt` | `createdAt` |
| `url` | `tweetUrl` |
| `entities.hashtags` | `hashtags` |
| `author.id` | `userId` |
| `author.name` | `displayName` |
| `author.followers` | `followersCount` |
| `author.following` | `followingCount` |
| `author.isVerified` | `verified` |
| `author.description` | `userDescription` |

---

## 🎯 Key Features

✅ **Subnet-111 Compatible** - Exact request/response format match  
✅ **Environment Variable Support** - Reads APIFY_TOKEN from env  
✅ **Data Transformation** - Converts Apify format to Subnet-111  
✅ **Error Handling** - Comprehensive error responses  
✅ **Module Export** - Can be imported in other scripts  
✅ **File Output** - Saves results to JSON file  

---

## 📝 Notes

- The script uses Apify's pay-per-result Twitter scraper
- Results are saved to `apify_results.json`
- Check your Apify dashboard for usage and costs
- The actor link is provided in console output

---

## 🔗 Related Files

- [test_kaito.js](test_kaito.js) - Main scraper script
- [SUBNET-111-SUMMARY.md](../SUBNET-111-SUMMARY.md) - Subnet-111 overview
- [X-SCRAPER-README.md](../../X-SCRAPER-README.md) - Alternative scrapers

---

**Created:** 2026-02-04  
**Compatible with:** Subnet-111 x-tweets format  
**Apify Actor:** kaitoeasyapi/twitter-x-data-tweet-scraper-pay-per-result-cheapest

