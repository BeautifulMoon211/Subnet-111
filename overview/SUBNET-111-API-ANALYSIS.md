# Subnet-111 API Input/Output Analysis

## Overview
Subnet-111 is a data mining subnet that supports two types of data fetching:
1. **Google Maps Reviews** - Uses Apify API
2. **X Tweets** - Uses Gravity API (Macrocosmos)

---

## 1. Request to Node-Miner API

### Request Pattern
**Endpoint:** `POST http://localhost:3001/fetch`

**Request Structure:**
```json
{
  "typeId": "string",      // Type identifier: "google-maps-reviews" or "x-tweets"
  "metadata": "object",    // Type-specific metadata
  "timeout": "number"      // Timeout in seconds
}
```

### Request Examples

#### Example 1: Google Maps Reviews Request
```json
{
  "typeId": "google-maps-reviews",
  "metadata": {
    "dataId": "0x89c258f97bdb102b:0xea9f8fc0b3ffff55",
    "id": "ChIJN1t_t254w4AR4PVM_67p73Y",
    "name": "Golden Gate Bridge",
    "language": "en",
    "sort": "newest"
  },
  "timeout": 120
}
```

#### Example 2: X Tweets Request
```json
{
  "typeId": "x-tweets",
  "metadata": {
    "keyword": "\"bitcoin\""
  },
  "timeout": 120
}
```

### Request Validation
The miner validates:
- `typeId` is required and must be valid ("google-maps-reviews" or "x-tweets")
- `metadata` is required and must be an object
- `timeout` is required and must be a number
- `APIFY_TOKEN` environment variable is configured (for Google Maps)
- `GRAVITY_API_TOKEN` environment variable is configured (for X Tweets)

---

## 2. How Node-Miner Uses External APIs

### A. Google Maps Reviews - Apify Integration

**Flow:**
1. Miner receives request with `typeId: "google-maps-reviews"`
2. Extracts metadata: `dataId`, `language`, `sort`
3. Calls Apify actor: `agents/google-maps-reviews`

**Apify API Call:**
```javascript
// Location: node/modules/apify/index.js
const apifyClient = new ApifyClient({
  token: process.env.APIFY_TOKEN
});

const run = await apifyClient.actor('agents/google-maps-reviews').call({
  placeFIDs: ["0x89c258f97bdb102b:0xea9f8fc0b3ffff55"],
  maxItems: 100,              // From config.MINER.GOOGLE_MAPS_REVIEWS.REVIEW_COUNT
  language: "en",
  sort: "newest"
});

const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
```

**Configuration:**
- Actor: `agents/google-maps-reviews`
- Review Count: 100 (fixed, from config)
- Retry attempts: 10 (with retryable wrapper)

---

### B. X Tweets - Gravity API Integration

**Flow:**
1. Miner receives request with `typeId: "x-tweets"`
2. Extracts metadata: `keyword`
3. Calls Gravity API endpoint

**Gravity API Call:**
```javascript
// Location: node/utils/miner/types/x-tweets/fetch/index.js
const response = await fetch('https://constellation.api.cloud.macrocosmos.ai/sn13.v1.Sn13Service/OnDemandData', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.GRAVITY_API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    source: 'X',
    keywords: ["bitcoin"],     // Cleaned keyword (quotes removed)
    limit: 100,                // From TWEET_LIMIT env var
    keyword_mode: 'any'        // From config.MINER.X_TWEETS.GRAVITY_KEYWORD_MODE
  })
});

const result = await response.json();
// result.data contains array of tweet objects
```

**Configuration:**
- API URL: `https://constellation.api.cloud.macrocosmos.ai/sn13.v1.Sn13Service/OnDemandData`
- Tweet Limit: From `TWEET_LIMIT` environment variable
- Keyword Mode: `any`
- Retry attempts: 10 (with retryable wrapper)

**Response Parsing:**
The Gravity API response is parsed to extract required fields:
```javascript
{
  tweetId: item.tweet.id,
  username: item.user.username,
  text: item.text,
  createdAt: item.datetime,
  tweetUrl: item.uri,
  hashtags: item.tweet.hashtags || [],
  userId: item.user.id,
  displayName: item.user.display_name,
  followersCount: item.user.followers_count,
  followingCount: item.user.following_count,
  verified: item.user.verified,
  userDescription: item.user.user_description  // Optional
}
```

---

## 3. Response from Node-Miner API to Validator

### Response Pattern
**Success Response Structure:**
```json
{
  "status": "success",
  "typeId": "string",
  "metadata": "object",
  "timeout": "number",
  "responses": "array",
  "timestamp": "string"
}
```

### Response Examples

#### Example 1: Google Maps Reviews Response
```json
{
  "status": "success",
  "typeId": "google-maps-reviews",
  "metadata": {
    "dataId": "0x89c258f97bdb102b:0xea9f8fc0b3ffff55",
    "id": "ChIJN1t_t254w4AR4PVM_67p73Y",
    "name": "Golden Gate Bridge",
    "language": "en",
    "sort": "newest"
  },
  "timeout": 120,
  "responses": [
    {
      "reviewId": "ChdDSUhNMG9nS0VJQ0FnSUNEMnZPX3dRRRAB",
      "reviewerId": "112345678901234567890",
      "reviewerName": "John Doe",
      "reviewerUrl": "https://www.google.com/maps/contrib/112345678901234567890",
      "reviewUrl": "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sChdDSUhNMG9nS0VJQ0FnSUNEMnZPX3dRRRAB",
      "publishedAtDate": "2025-01-15T10:30:00.000Z",
      "text": "Amazing place! The views are breathtaking.",
      "stars": 5,
      "placeId": "ChIJN1t_t254w4AR4PVM_67p73Y",
      "cid": "1234567890",
      "fid": "0x89c258f97bdb102b:0xea9f8fc0b3ffff55",
      "totalScore": 5
    }
    // ... more reviews (up to 100)
  ],
  "timestamp": "2025-02-04T12:34:56.789Z"
}
```

#### Example 2: X Tweets Response
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
    // ... more tweets (up to TWEET_LIMIT)
  ],
  "timestamp": "2025-02-04T12:34:56.789Z"
}
```

### Error Response Pattern
```json
{
  "typeId": "string",
  "metadata": "object",
  "timeout": "number",
  "error": "string",
  "message": "string",
  "timestamp": "string"
}
```

**Error Examples:**
```json
// Invalid typeId
{
  "typeId": "invalid-type",
  "metadata": {},
  "timeout": 120,
  "error": "Invalid typeId",
  "message": "The provided typeId is not valid",
  "timestamp": "2025-02-04T12:34:56.789Z"
}

// Missing required parameter
{
  "error": "metadata is required",
  "message": "Please provide a valid metadata"
}

// Configuration error
{
  "error": "Configuration error",
  "message": "APIFY_TOKEN not configured"
}
```

---

## 4. Complete Flow Diagram

### Validator → Miner → External API → Response

```
┌─────────────┐
│  Validator  │
│  (Python)   │
└──────┬──────┘
       │ 1. Create Synthetic Task
       │ GET /create-synthetic-task
       ▼
┌─────────────────┐
│ Validator Node  │──────► Apify: Search places/keywords
│   (Node.js)     │◄────── Returns: search results
└────────┬────────┘
         │ Returns: {typeId, metadata, timeout}
         ▼
┌─────────────┐
│  Validator  │
│  (Python)   │
└──────┬──────┘
       │ 2. Query Miners
       │ GenericSynapse(type_id, metadata, timeout)
       ▼
┌─────────────┐
│   Miner     │
│  (Python)   │
└──────┬──────┘
       │ POST /fetch
       │ {typeId, metadata, timeout}
       ▼
┌─────────────────┐
│  Miner Node     │
│   (Node.js)     │
└────────┬────────┘
         │
         ├─► Google Maps Reviews?
         │   └─► Apify API
         │       Actor: agents/google-maps-reviews
         │       Params: {placeFIDs, maxItems, language, sort}
         │       Returns: Array of review objects
         │
         └─► X Tweets?
             └─► Gravity API
                 URL: constellation.api.cloud.macrocosmos.ai
                 Params: {source, keywords, limit, keyword_mode}
                 Returns: Array of tweet objects
         │
         ▼
┌─────────────────┐
│  Miner Node     │
│   (Node.js)     │
└────────┬────────┘
         │ Returns: {status, responses, timestamp}
         ▼
┌─────────────┐
│   Miner     │
│  (Python)   │
└──────┬──────┘
       │ GenericSynapse.responses = data
       ▼
┌─────────────┐
│  Validator  │
│  (Python)   │
└──────┬──────┘
       │ 3. Score Responses
       │ POST /score-responses
       │ {typeId, metadata, responses, responseTimes, minerUIDs}
       ▼
┌─────────────────┐
│ Validator Node  │
│   (Node.js)     │
└────────┬────────┘
         │ Calculate scores (quality, speed, volume)
         │ Returns: {scores, statistics, detailedResults}
         ▼
┌─────────────┐
│  Validator  │
│  (Python)   │
└─────────────┘
```

---

## 5. Key Configuration

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

### Config Values
```javascript
// Google Maps Reviews
config.MINER.GOOGLE_MAPS_REVIEWS.REVIEW_COUNT = 100
config.MINER.GOOGLE_MAPS_REVIEWS.APIFY_ACTORS.GOOGLE_MAPS_REVIEWS = 'agents/google-maps-reviews'

// X Tweets
config.MINER.X_TWEETS.GRAVITY_API_URL = 'https://constellation.api.cloud.macrocosmos.ai/sn13.v1.Sn13Service/OnDemandData'
config.MINER.X_TWEETS.GRAVITY_KEYWORD_MODE = 'any'
```

---

## 6. Summary

### Request Pattern
- **Endpoint:** POST /fetch
- **Required Fields:** typeId, metadata, timeout
- **Type IDs:** "google-maps-reviews", "x-tweets"

### External API Usage
- **Google Maps:** Apify actor `agents/google-maps-reviews` with placeFIDs
- **X Tweets:** Gravity API with keyword search

### Response Pattern
- **Success:** {status: "success", typeId, metadata, timeout, responses[], timestamp}
- **Error:** {error, message, timestamp}
- **Responses:** Array of data objects (reviews or tweets)

### Data Flow
1. Validator creates synthetic task
2. Validator queries miners with GenericSynapse
3. Miner forwards to Node.js service
4. Node.js calls external API (Apify or Gravity)
5. External API returns data
6. Miner returns responses to validator
7. Validator scores responses

