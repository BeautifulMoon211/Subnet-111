# Subnet-111 Code Examples

## Table of Contents
1. [Request Examples](#request-examples)
2. [External API Calls](#external-api-calls)
3. [Response Examples](#response-examples)
4. [Complete Flow Examples](#complete-flow-examples)

---

## Request Examples

### Example 1: Google Maps Reviews Request

**Python (Validator → Miner):**
```python
from oneoneone.protocol import GenericSynapse

# Create synapse for Google Maps reviews
synapse = GenericSynapse(
    type_id="google-maps-reviews",
    metadata={
        "dataId": "0x89c258f97bdb102b:0xea9f8fc0b3ffff55",
        "id": "ChIJN1t_t254w4AR4PVM_67p73Y",
        "name": "Golden Gate Bridge",
        "language": "en",
        "sort": "newest"
    },
    timeout=120
)

# Query miner
response = await self.dendrite(
    axons=[axon],
    synapse=synapse,
    deserialize=True,
    timeout=120
)
```

**HTTP Request (Miner Python → Miner Node.js):**
```bash
curl -X POST http://localhost:3001/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "typeId": "google-maps-reviews",
    "metadata": {
      "dataId": "0x89c258f97bdb102b:0xea9f8fc0b3ffff55",
      "id": "ChIJN1t_t254w4AR4PVM_67p73Y",
      "name": "Golden Gate Bridge",
      "language": "en",
      "sort": "newest"
    },
    "timeout": 120
  }'
```

### Example 2: X Tweets Request

**Python (Validator → Miner):**
```python
from oneoneone.protocol import GenericSynapse

# Create synapse for X tweets
synapse = GenericSynapse(
    type_id="x-tweets",
    metadata={
        "keyword": "\"bitcoin\""
    },
    timeout=120
)

# Query miner
response = await self.dendrite(
    axons=[axon],
    synapse=synapse,
    deserialize=True,
    timeout=120
)
```

**HTTP Request (Miner Python → Miner Node.js):**
```bash
curl -X POST http://localhost:3001/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "typeId": "x-tweets",
    "metadata": {
      "keyword": "\"bitcoin\""
    },
    "timeout": 120
  }'
```

---

## External API Calls

### Example 1: Apify API Call (Google Maps Reviews)

**Location:** `node/utils/miner/types/google-maps-reviews/fetch/index.js`

```javascript
import { ApifyClient } from 'apify-client';

// Initialize Apify client
const apifyClient = new ApifyClient({
  token: process.env.APIFY_TOKEN
});

// Call the Google Maps Reviews actor
const run = await apifyClient
  .actor('agents/google-maps-reviews')
  .call({
    placeFIDs: ["0x89c258f97bdb102b:0xea9f8fc0b3ffff55"],
    maxItems: 100,
    language: "en",
    sort: "newest"
  });

// Get results from dataset
const { items } = await apifyClient
  .dataset(run.defaultDatasetId)
  .listItems();

console.log(`Fetched ${items.length} reviews`);
// Returns array of review objects
```

### Example 2: Gravity API Call (X Tweets)

**Location:** `node/utils/miner/types/x-tweets/fetch/index.js`

```javascript
// Call Gravity API
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
      keywords: ["bitcoin"],
      limit: 100,
      keyword_mode: 'any'
    })
  }
);

const result = await response.json();

// Parse response
if (result.status === 'success') {
  const tweets = result.data.map(item => ({
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
    userDescription: item.user.user_description
  }));
  
  console.log(`Fetched ${tweets.length} tweets`);
  return tweets;
}
```

---

## Response Examples

### Example 1: Google Maps Reviews Response

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
      "text": "Amazing place! The views are breathtaking and the architecture is stunning.",
      "stars": 5,
      "placeId": "ChIJN1t_t254w4AR4PVM_67p73Y",
      "cid": "1234567890",
      "fid": "0x89c258f97bdb102b:0xea9f8fc0b3ffff55",
      "totalScore": 5
    },
    {
      "reviewId": "ChdDSUhNMG9nS0VJQ0FnSUNEMnZPX3dRRRAC",
      "reviewerId": "112345678901234567891",
      "reviewerName": "Jane Smith",
      "reviewerUrl": "https://www.google.com/maps/contrib/112345678901234567891",
      "reviewUrl": "https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sChdDSUhNMG9nS0VJQ0FnSUNEMnZPX3dRRRAC",
      "publishedAtDate": "2025-01-14T15:20:00.000Z",
      "text": "Great experience! A must-visit landmark.",
      "stars": 4,
      "placeId": "ChIJN1t_t254w4AR4PVM_67p73Y",
      "cid": "1234567890",
      "fid": "0x89c258f97bdb102b:0xea9f8fc0b3ffff55",
      "totalScore": 4
    }
  ],
  "timestamp": "2025-02-04T12:34:56.789Z"
}
```

### Example 2: X Tweets Response

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
      "text": "Bitcoin is showing strong momentum today! The market is looking bullish. #BTC #crypto",
      "createdAt": "2025-02-04T10:15:30.000Z",
      "tweetUrl": "https://twitter.com/crypto_trader/status/1234567890123456789",
      "hashtags": ["BTC", "crypto"],
      "userId": "987654321",
      "displayName": "Crypto Trader",
      "followersCount": 15000,
      "followingCount": 500,
      "verified": false,
      "userDescription": "Cryptocurrency enthusiast and trader. Not financial advice."
    },
    {
      "tweetId": "1234567890123456790",
      "username": "bitcoin_news",
      "text": "Breaking: Bitcoin reaches new milestone! #Bitcoin #Cryptocurrency",
      "createdAt": "2025-02-04T09:45:12.000Z",
      "tweetUrl": "https://twitter.com/bitcoin_news/status/1234567890123456790",
      "hashtags": ["Bitcoin", "Cryptocurrency"],
      "userId": "987654322",
      "displayName": "Bitcoin News",
      "followersCount": 50000,
      "followingCount": 200,
      "verified": true,
      "userDescription": "Latest Bitcoin and cryptocurrency news"
    }
  ],
  "timestamp": "2025-02-04T12:34:56.789Z"
}
```

---

## Complete Flow Examples

### Flow 1: Google Maps Reviews - End to End

```javascript
// 1. VALIDATOR: Create Synthetic Task
// Location: node/routes/validator/create-synthetic.js
const task = await createSyntheticTask();
// Returns: {
//   typeId: "google-maps-reviews",
//   metadata: { dataId, id, name, language, sort },
//   timeout: 120
// }

// 2. VALIDATOR (Python): Query Miner
const synapse = GenericSynapse(
  type_id=task["typeId"],
  metadata=task["metadata"],
  timeout=task["timeout"]
);
const responses = await dendrite(axons=[axon], synapse=synapse);

// 3. MINER (Python): Forward to Node.js
const response = await aiohttp.post(
  "http://localhost:3001/fetch",
  json={
    "typeId": synapse.type_id,
    "metadata": synapse.metadata,
    "timeout": synapse.timeout
  }
);

// 4. MINER NODE: Call Apify
const items = await apifyClient
  .actor('agents/google-maps-reviews')
  .call({
    placeFIDs: [metadata.dataId],
    maxItems: 100,
    language: metadata.language,
    sort: metadata.sort
  });

// 5. MINER NODE: Return to Miner Python
return {
  status: "success",
  typeId: "google-maps-reviews",
  metadata: metadata,
  timeout: timeout,
  responses: items,
  timestamp: new Date().toISOString()
};

// 6. MINER (Python): Return to Validator
synapse.responses = data["responses"];
return synapse;

// 7. VALIDATOR: Score Responses
const scores = await post(
  "http://localhost:3002/score-responses",
  json={
    "typeId": type_id,
    "metadata": metadata,
    "responses": responses,
    "responseTimes": response_times,
    "synapseTimeout": timeout,
    "minerUIDs": miner_uids
  }
);
```

### Flow 2: X Tweets - End to End

```javascript
// 1. VALIDATOR: Create Synthetic Task
const task = await createSyntheticTask();
// Returns: {
//   typeId: "x-tweets",
//   metadata: { keyword: "\"bitcoin\"" },
//   timeout: 120
// }

// 2. VALIDATOR (Python): Query Miner
const synapse = GenericSynapse(
  type_id="x-tweets",
  metadata={"keyword": "\"bitcoin\""},
  timeout=120
);

// 3. MINER NODE: Call Gravity API
const response = await fetch(
  'https://constellation.api.cloud.macrocosmos.ai/sn13.v1.Sn13Service/OnDemandData',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GRAVITY_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source: 'X',
      keywords: ["bitcoin"],
      limit: 100,
      keyword_mode: 'any'
    })
  }
);

// 4. MINER NODE: Parse and return tweets
const tweets = parseGravityResponse(result.data);
return {
  status: "success",
  typeId: "x-tweets",
  metadata: { keyword: "\"bitcoin\"" },
  timeout: 120,
  responses: tweets,
  timestamp: new Date().toISOString()
};
```

---

## Key Code Locations

### Request Handling
- **Miner Entry:** `Subnet-111/neurons/miner.py` (line 54-94)
- **Miner Node Route:** `Subnet-111/node/routes/miner/fetch.js`
- **Type Registry:** `Subnet-111/node/utils/miner/types/index.js`

### External API Integration
- **Apify Module:** `Subnet-111/node/modules/apify/index.js`
- **Google Maps Fetch:** `Subnet-111/node/utils/miner/types/google-maps-reviews/fetch/index.js`
- **X Tweets Fetch:** `Subnet-111/node/utils/miner/types/x-tweets/fetch/index.js`

### Response Handling
- **Protocol Definition:** `Subnet-111/oneoneone/protocol.py`
- **Validator Forward:** `Subnet-111/oneoneone/validator/forward.py`
- **Scoring Route:** `Subnet-111/node/routes/validator/score.js`

