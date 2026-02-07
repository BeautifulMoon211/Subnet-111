# Subnet-111 Input/Output Analysis - Complete Documentation

## 🎯 Goal Completion Summary

This documentation provides a complete analysis of **Subnet-111** covering:

✅ **Request patterns to node-miner API**  
✅ **Example requests with detailed structure**  
✅ **External API usage (Apify & Gravity)**  
✅ **Response patterns from node-miner API**  
✅ **Example responses with detailed structure**

---

## 📚 Documentation Files

### 🌟 Start Here
**[SUBNET-111-INDEX.md](SUBNET-111-INDEX.md)** - Navigation guide to all documentation

### 📖 Main Documents

1. **[SUBNET-111-SUMMARY.md](SUBNET-111-SUMMARY.md)** ⭐ **RECOMMENDED START**
   - Quick overview of the entire system
   - Request/response patterns
   - External API integration details
   - Configuration and error handling

2. **[SUBNET-111-API-ANALYSIS.md](SUBNET-111-API-ANALYSIS.md)**
   - Detailed technical analysis
   - Complete request/response flows
   - External API integration deep dive
   - Comprehensive diagrams

3. **[SUBNET-111-QUICK-REFERENCE.md](SUBNET-111-QUICK-REFERENCE.md)**
   - Quick lookup tables
   - API endpoints reference
   - Field definitions
   - Error codes

4. **[SUBNET-111-CODE-EXAMPLES.md](SUBNET-111-CODE-EXAMPLES.md)**
   - Python and JavaScript code examples
   - Complete end-to-end flows
   - External API call examples
   - Implementation patterns

---

## 🔍 Quick Overview

### What is Subnet-111?

Subnet-111 is a **data mining subnet** that fetches data from external APIs through a validator-miner architecture. It supports two data types:

1. **Google Maps Reviews** - Uses Apify API
2. **X/Twitter Tweets** - Uses Gravity API (Macrocosmos)

### Architecture Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  Validator  │────▶│   Miner     │────▶│ Miner Node  │────▶│ External API │
│  (Python)   │     │  (Python)   │     │  (Node.js)  │     │ Apify/Gravity│
└─────────────┘     └─────────────┘     └─────────────┘     └──────────────┘
       ▲                    ▲                    ▲                    │
       │                    │                    │                    │
       └────────────────────┴────────────────────┴────────────────────┘
                         Response Flow
```

---

## 📥 Request Pattern

### Endpoint
```
POST http://localhost:3001/fetch
```

### Request Structure
```json
{
  "typeId": "google-maps-reviews" | "x-tweets",
  "metadata": { /* type-specific metadata */ },
  "timeout": 120
}
```

### Example 1: Google Maps Reviews
```json
{
  "typeId": "google-maps-reviews",
  "metadata": {
    "dataId": "0x89c258f97bdb102b:0xea9f8fc0b3ffff55",
    "name": "Golden Gate Bridge",
    "language": "en",
    "sort": "newest"
  },
  "timeout": 120
}
```

### Example 2: X Tweets
```json
{
  "typeId": "x-tweets",
  "metadata": {
    "keyword": "\"bitcoin\""
  },
  "timeout": 120
}
```

---

## 🔌 External API Usage

### Apify API (Google Maps Reviews)

**How it works:**
- Miner receives request → Calls Apify actor `agents/google-maps-reviews`
- Returns up to 100 reviews per request

**API Call:**
```javascript
const apifyClient = new ApifyClient({ token: process.env.APIFY_TOKEN });
const run = await apifyClient.actor('agents/google-maps-reviews').call({
  placeFIDs: ["0x89c258f97bdb102b:0xea9f8fc0b3ffff55"],
  maxItems: 100,
  language: "en",
  sort: "newest"
});
```

### Gravity API (X Tweets)

**How it works:**
- Miner receives request → Calls Gravity API endpoint
- Returns configurable number of tweets

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
      keywords: ["bitcoin"],
      limit: 100,
      keyword_mode: 'any'
    })
  }
);
```

---

## 📤 Response Pattern

### Response Structure
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

### Example 1: Google Maps Reviews Response
```json
{
  "status": "success",
  "typeId": "google-maps-reviews",
  "responses": [
    {
      "reviewId": "ChdDSUhNMG9nS0VJQ0FnSUNEMnZPX3dRRRAB",
      "reviewerName": "John Doe",
      "text": "Amazing place!",
      "stars": 5,
      "publishedAtDate": "2025-01-15T10:30:00.000Z"
      // ... more fields
    }
  ]
}
```

### Example 2: X Tweets Response
```json
{
  "status": "success",
  "typeId": "x-tweets",
  "responses": [
    {
      "tweetId": "1234567890123456789",
      "username": "crypto_trader",
      "text": "Bitcoin is showing strong momentum!",
      "createdAt": "2025-02-04T10:15:30.000Z",
      "hashtags": ["BTC", "crypto"]
      // ... more fields
    }
  ]
}
```

---

## 📊 Visual Diagrams

The documentation includes **4 interactive Mermaid diagrams**:

1. **Request/Response Flow** - Complete sequence diagram
2. **Data Type Structures** - Request/response data structures
3. **API Endpoints Overview** - All endpoints and relationships
4. **Documentation Structure** - Navigation between documents

---

## ⚙️ Configuration

### Required Environment Variables
```bash
# Miner
APIFY_TOKEN=your_apify_token
GRAVITY_API_TOKEN=your_gravity_token
TWEET_LIMIT=100

# Validator
PLATFORM_TOKEN=your_platform_token
```

---

## 🎓 How to Use This Documentation

1. **Start with** [SUBNET-111-SUMMARY.md](SUBNET-111-SUMMARY.md) for overview
2. **Check** [SUBNET-111-CODE-EXAMPLES.md](SUBNET-111-CODE-EXAMPLES.md) for implementation
3. **Reference** [SUBNET-111-QUICK-REFERENCE.md](SUBNET-111-QUICK-REFERENCE.md) for lookups
4. **Deep dive** [SUBNET-111-API-ANALYSIS.md](SUBNET-111-API-ANALYSIS.md) for details
5. **Navigate** using [SUBNET-111-INDEX.md](SUBNET-111-INDEX.md)

---

## ✨ Key Findings

### Request to Node-Miner API
- **Endpoint:** POST /fetch
- **Required:** typeId, metadata, timeout
- **Types:** google-maps-reviews, x-tweets
- **Validation:** Strict parameter checking

### External API Usage
- **Google Maps:** Apify actor with 100 review limit
- **X Tweets:** Gravity API with configurable limit
- **Retry Logic:** 10 attempts for reliability
- **Authentication:** Token-based (APIFY_TOKEN, GRAVITY_API_TOKEN)

### Response from Node-Miner API
- **Format:** JSON with status, responses array, timestamp
- **Google Maps:** Review objects with 12+ fields
- **X Tweets:** Tweet objects with 12+ fields
- **Error Handling:** Structured error responses

---

**Created:** 2025-02-04  
**Based on:** Subnet-111 codebase analysis  
**Total Documents:** 5 markdown files + 4 Mermaid diagrams

