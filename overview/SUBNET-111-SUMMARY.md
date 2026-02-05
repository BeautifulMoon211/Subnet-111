# Subnet-111 Input/Output Summary

## 📋 Quick Overview

**Subnet-111** is a data mining subnet that fetches data from external APIs through a validator-miner architecture. It supports two data types:
- **Google Maps Reviews** (via Apify API)
- **X/Twitter Tweets** (via Gravity API)

---

## 🔄 Request Flow

```
Validator (Python) → Miner (Python) → Miner Node (Node.js) → External API
                                                                    ↓
Validator (Python) ← Miner (Python) ← Miner Node (Node.js) ← External API
```

---

## 📥 INPUT: Request to Node-Miner API

### Endpoint
```
POST http://localhost:3001/fetch
```

### Request Pattern
```json
{
  "typeId": "string",      // "google-maps-reviews" or "x-tweets"
  "metadata": {},          // Type-specific metadata
  "timeout": 120           // Timeout in seconds
}
```

### Type 1: Google Maps Reviews
```json
{
  "typeId": "google-maps-reviews",
  "metadata": {
    "dataId": "0x89c258f97bdb102b:0xea9f8fc0b3ffff55",  // Google Maps FID
    "id": "ChIJN1t_t254w4AR4PVM_67p73Y",              // Place ID
    "name": "Golden Gate Bridge",                      // Place name
    "language": "en",                                  // Language
    "sort": "newest"                                   // Sort order
  },
  "timeout": 120
}
```

### Type 2: X Tweets
```json
{
  "typeId": "x-tweets",
  "metadata": {
    "keyword": "\"bitcoin\""  // Search keyword (quoted)
  },
  "timeout": 120
}
```

---

## 🔌 External API Usage

### Google Maps Reviews → Apify API

**How it works:**
1. Miner receives request with `typeId: "google-maps-reviews"`
2. Extracts `dataId` from metadata
3. Calls Apify actor: `agents/google-maps-reviews`

**API Call:**
```javascript
const apifyClient = new ApifyClient({ token: process.env.APIFY_TOKEN });

const run = await apifyClient.actor('agents/google-maps-reviews').call({
  placeFIDs: ["0x89c258f97bdb102b:0xea9f8fc0b3ffff55"],
  maxItems: 100,        // Fixed count from config
  language: "en",
  sort: "newest"
});

const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
```

**Configuration:**
- Actor: `agents/google-maps-reviews`
- Max items: 100 (fixed)
- Retry: 10 attempts
- Requires: `APIFY_TOKEN` environment variable

---

### X Tweets → Gravity API

**How it works:**
1. Miner receives request with `typeId: "x-tweets"`
2. Extracts `keyword` from metadata
3. Calls Gravity API endpoint

**API Call:**
```javascript
const response = await fetch(
  'https://constellation.api.cloud.macrocosmos.ai/sn13.v1.Sn13Service/OnDemandData',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GRAVITY_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source: 'X',
      keywords: ["bitcoin"],  // Cleaned keyword (quotes removed)
      limit: 100,             // From TWEET_LIMIT env var
      keyword_mode: 'any'     // From config
    })
  }
);

const result = await response.json();
// result.data contains array of tweet objects
```

**Configuration:**
- Endpoint: `https://constellation.api.cloud.macrocosmos.ai/sn13.v1.Sn13Service/OnDemandData`
- Limit: From `TWEET_LIMIT` environment variable
- Keyword mode: `any`
- Retry: 10 attempts
- Requires: `GRAVITY_API_TOKEN` environment variable

---

## 📤 OUTPUT: Response from Node-Miner API

### Response Pattern
```json
{
  "status": "success",
  "typeId": "string",
  "metadata": {},
  "timeout": 120,
  "responses": [],
  "timestamp": "2025-02-04T12:34:56.789Z"
}
```

### Type 1: Google Maps Reviews Response
```json
{
  "status": "success",
  "typeId": "google-maps-reviews",
  "metadata": { "dataId": "...", "name": "...", ... },
  "timeout": 120,
  "responses": [
    {
      "reviewId": "ChdDSUhNMG9nS0VJQ0FnSUNEMnZPX3dRRRAB",
      "reviewerId": "112345678901234567890",
      "reviewerName": "John Doe",
      "reviewerUrl": "https://www.google.com/maps/contrib/...",
      "reviewUrl": "https://www.google.com/maps/reviews/...",
      "publishedAtDate": "2025-01-15T10:30:00.000Z",
      "text": "Amazing place! The views are breathtaking.",
      "stars": 5,
      "placeId": "ChIJN1t_t254w4AR4PVM_67p73Y",
      "cid": "1234567890",
      "fid": "0x89c258f97bdb102b:0xea9f8fc0b3ffff55",
      "totalScore": 5
    }
    // ... up to 100 reviews
  ],
  "timestamp": "2025-02-04T12:34:56.789Z"
}
```

### Type 2: X Tweets Response
```json
{
  "status": "success",
  "typeId": "x-tweets",
  "metadata": { "keyword": "\"bitcoin\"" },
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
    // ... up to TWEET_LIMIT tweets
  ],
  "timestamp": "2025-02-04T12:34:56.789Z"
}
```

---

## 📊 Response Data Fields

### Google Maps Review Object
| Field | Type | Description |
|-------|------|-------------|
| `reviewId` | string | Unique review identifier |
| `reviewerId` | string | Reviewer's Google ID |
| `reviewerName` | string | Reviewer's display name |
| `reviewerUrl` | string | Link to reviewer profile |
| `reviewUrl` | string | Link to review |
| `publishedAtDate` | string | ISO timestamp |
| `text` | string | Review text content |
| `stars` | number | Rating (1-5) |
| `placeId` | string | Google Place ID |
| `cid` | string | Place CID |
| `fid` | string | Place FID |
| `totalScore` | number | Review score |

### X Tweet Object
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
| `userDescription` | string | User bio (optional) |

---

## ⚙️ Configuration

### Environment Variables
```bash
# Miner
APIFY_TOKEN=your_apify_token
GRAVITY_API_TOKEN=your_gravity_token
TWEET_LIMIT=100
MINER_NODE_PORT=3001

# Validator
VALIDATOR_NODE_PORT=3002
PLATFORM_TOKEN=your_platform_token
```

### Key Config Values
```javascript
// Google Maps Reviews
config.MINER.GOOGLE_MAPS_REVIEWS.REVIEW_COUNT = 100
config.MINER.GOOGLE_MAPS_REVIEWS.APIFY_ACTORS.GOOGLE_MAPS_REVIEWS = 'agents/google-maps-reviews'

// X Tweets
config.MINER.X_TWEETS.GRAVITY_API_URL = 'https://constellation.api.cloud.macrocosmos.ai/sn13.v1.Sn13Service/OnDemandData'
config.MINER.X_TWEETS.GRAVITY_KEYWORD_MODE = 'any'
```

---

## 🚨 Error Handling

### Error Response Format
```json
{
  "typeId": "string",
  "metadata": {},
  "timeout": 120,
  "error": "Error type",
  "message": "Detailed error message",
  "timestamp": "2025-02-04T12:34:56.789Z"
}
```

### Common Errors
- **Missing typeId:** `"typeId is required"`
- **Missing metadata:** `"metadata is required"`
- **Missing timeout:** `"timeout is required"`
- **Invalid typeId:** `"The provided typeId is not valid"`
- **Missing APIFY_TOKEN:** `"APIFY_TOKEN not configured"`
- **Missing GRAVITY_API_TOKEN:** `"GRAVITY_API_TOKEN not configured"`

---

## 📁 Key Files

### Request Handling
- `Subnet-111/neurons/miner.py` - Miner entry point
- `Subnet-111/node/routes/miner/fetch.js` - Miner Node route
- `Subnet-111/oneoneone/protocol.py` - Protocol definition

### External API Integration
- `Subnet-111/node/modules/apify/index.js` - Apify client
- `Subnet-111/node/utils/miner/types/google-maps-reviews/fetch/index.js` - Google Maps fetch
- `Subnet-111/node/utils/miner/types/x-tweets/fetch/index.js` - X Tweets fetch

### Configuration
- `Subnet-111/node/config.js` - Configuration values
- `.env` - Environment variables

---

## 🎯 Summary

1. **Request Pattern:** POST /fetch with {typeId, metadata, timeout}
2. **Two Types:** Google Maps Reviews (Apify) and X Tweets (Gravity)
3. **External APIs:** Apify for reviews, Gravity for tweets
4. **Response Pattern:** {status, typeId, metadata, timeout, responses[], timestamp}
5. **Data Volume:** 100 reviews or configurable tweets per request
6. **Retry Logic:** 10 attempts for reliability
7. **Authentication:** APIFY_TOKEN and GRAVITY_API_TOKEN required

