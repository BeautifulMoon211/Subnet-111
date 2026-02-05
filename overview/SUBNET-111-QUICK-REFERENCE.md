# Subnet-111 Quick Reference Guide

## API Endpoints

### Miner Node (Port 3001)

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/fetch` | POST | Fetch data from external APIs | localhost only |

### Validator Node (Port 3002)

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/create-synthetic-task` | GET | Create random validation task | localhost only |
| `/score-responses` | POST | Score miner responses | localhost only |
| `/download-synapse-data` | GET | Download synapse data | Platform Token |
| `/health` | GET | Health check | localhost only |

---

## Request/Response Patterns

### 1. Miner Fetch Request

**Endpoint:** `POST /fetch`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `typeId` | string | ✅ | "google-maps-reviews" or "x-tweets" |
| `metadata` | object | ✅ | Type-specific metadata |
| `timeout` | number | ✅ | Timeout in seconds |

### 2. Miner Fetch Response

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | "success" or error status |
| `typeId` | string | Echo of request typeId |
| `metadata` | object | Echo of request metadata |
| `timeout` | number | Echo of request timeout |
| `responses` | array | Array of data objects |
| `timestamp` | string | ISO timestamp |

---

## Type-Specific Metadata

### Google Maps Reviews

**Request Metadata:**
```javascript
{
  dataId: "0x89c258f97bdb102b:0xea9f8fc0b3ffff55",  // Required: Google Maps FID
  id: "ChIJN1t_t254w4AR4PVM_67p73Y",              // Place ID
  name: "Golden Gate Bridge",                      // Place name
  language: "en",                                  // Language code
  sort: "newest"                                   // Sort order
}
```

**Response Object Fields:**
- `reviewId` - Unique review identifier
- `reviewerId` - Reviewer's Google ID
- `reviewerName` - Reviewer's display name
- `reviewerUrl` - Link to reviewer profile
- `reviewUrl` - Link to review
- `publishedAtDate` - ISO timestamp
- `text` - Review text content
- `stars` - Rating (1-5)
- `placeId` - Google Place ID
- `cid` - Place CID
- `fid` - Place FID
- `totalScore` - Review score

### X Tweets

**Request Metadata:**
```javascript
{
  keyword: "\"bitcoin\""  // Required: Search keyword (quoted)
}
```

**Response Object Fields:**
- `tweetId` - Unique tweet identifier
- `username` - Twitter username
- `text` - Tweet text content
- `createdAt` - ISO timestamp
- `tweetUrl` - Link to tweet
- `hashtags` - Array of hashtags
- `userId` - Twitter user ID
- `displayName` - User's display name
- `followersCount` - Number of followers
- `followingCount` - Number following
- `verified` - Verification status (boolean)
- `userDescription` - User bio (optional)

---

## External API Integration

### Apify (Google Maps Reviews)

**Actor:** `agents/google-maps-reviews`

**Parameters:**
```javascript
{
  placeFIDs: ["0x89c258f97bdb102b:0xea9f8fc0b3ffff55"],
  maxItems: 100,
  language: "en",
  sort: "newest"
}
```

**Configuration:**
- Review count: 100 (fixed)
- Retry attempts: 10
- Requires: `APIFY_TOKEN` env var

### Gravity API (X Tweets)

**Endpoint:** `https://constellation.api.cloud.macrocosmos.ai/sn13.v1.Sn13Service/OnDemandData`

**Parameters:**
```javascript
{
  source: "X",
  keywords: ["bitcoin"],
  limit: 100,
  keyword_mode: "any"
}
```

**Configuration:**
- Tweet limit: From `TWEET_LIMIT` env var
- Keyword mode: "any"
- Retry attempts: 10
- Requires: `GRAVITY_API_TOKEN` env var

---

## Environment Variables

### Miner
```bash
APIFY_TOKEN=your_apify_token_here
GRAVITY_API_TOKEN=your_gravity_token_here
TWEET_LIMIT=100
MINER_NODE_HOST=127.0.0.1
MINER_NODE_PORT=3001
```

### Validator
```bash
APIFY_TOKEN=your_apify_token_here
VALIDATOR_NODE_HOST=127.0.0.1
VALIDATOR_NODE_PORT=3002
PLATFORM_TOKEN=your_platform_token_here
```

---

## Error Responses

### Common Errors

| Error | Message | Cause |
|-------|---------|-------|
| `typeId is required` | Please provide a valid typeId | Missing typeId field |
| `metadata is required` | Please provide a valid metadata | Missing metadata field |
| `timeout is required` | Please provide a valid timeout | Missing timeout field |
| `Invalid typeId` | The provided typeId is not valid | Unknown typeId value |
| `Configuration error` | APIFY_TOKEN not configured | Missing env variable |
| `Configuration error` | GRAVITY_API_TOKEN not configured | Missing env variable |

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

