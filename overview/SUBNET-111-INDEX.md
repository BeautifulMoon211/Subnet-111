# Subnet-111 Documentation Index

## 📚 Documentation Overview

This documentation provides a comprehensive analysis of Subnet-111's input/output patterns, API requests, and external API integrations.

---

## 📄 Available Documents

### 1. **SUBNET-111-SUMMARY.md** ⭐ START HERE
**Best for:** Quick overview and reference

**Contents:**
- Quick overview of the subnet
- Request/response patterns
- External API usage (Apify & Gravity)
- Response data fields
- Configuration
- Error handling
- Key file locations

**Use this when:** You need a quick reference or overview of how the system works.

---

### 2. **SUBNET-111-API-ANALYSIS.md**
**Best for:** Detailed technical analysis

**Contents:**
- Complete request patterns with validation rules
- Detailed external API integration (Apify & Gravity)
- Response patterns with examples
- Complete flow diagrams
- Configuration details
- Comprehensive summary

**Use this when:** You need in-depth technical details about the API structure and flow.

---

### 3. **SUBNET-111-QUICK-REFERENCE.md**
**Best for:** Quick lookups and tables

**Contents:**
- API endpoints table
- Request/response field tables
- Type-specific metadata tables
- External API parameters
- Environment variables
- Error reference table

**Use this when:** You need to quickly look up a specific field, endpoint, or configuration value.

---

### 4. **SUBNET-111-CODE-EXAMPLES.md**
**Best for:** Implementation examples

**Contents:**
- Request examples (Python & HTTP)
- External API call examples
- Response examples
- Complete end-to-end flow examples
- Key code locations

**Use this when:** You need to see actual code examples or implement similar functionality.

---

## 🎯 Quick Navigation

### By Task

**I want to understand the overall system:**
→ Start with `SUBNET-111-SUMMARY.md`

**I need to implement a request:**
→ Check `SUBNET-111-CODE-EXAMPLES.md` for examples
→ Reference `SUBNET-111-QUICK-REFERENCE.md` for field details

**I'm debugging an issue:**
→ Check `SUBNET-111-API-ANALYSIS.md` for detailed flow
→ Reference `SUBNET-111-QUICK-REFERENCE.md` for error codes

**I need to configure the system:**
→ Check `SUBNET-111-SUMMARY.md` for configuration overview
→ Reference `SUBNET-111-QUICK-REFERENCE.md` for environment variables

**I want to understand external API integration:**
→ Check `SUBNET-111-API-ANALYSIS.md` for detailed integration
→ Reference `SUBNET-111-CODE-EXAMPLES.md` for code examples

---

## 🔍 Key Concepts

### Request Types
1. **Google Maps Reviews** - Fetches reviews using Apify API
2. **X Tweets** - Fetches tweets using Gravity API

### Architecture
```
Validator (Python) ↔ Miner (Python) ↔ Miner Node (Node.js) ↔ External APIs
```

### Main Endpoint
```
POST http://localhost:3001/fetch
```

### Request Structure
```json
{
  "typeId": "google-maps-reviews" | "x-tweets",
  "metadata": { /* type-specific */ },
  "timeout": 120
}
```

### Response Structure
```json
{
  "status": "success",
  "typeId": "string",
  "metadata": {},
  "timeout": 120,
  "responses": [],
  "timestamp": "ISO-8601"
}
```

---

## 🔗 External APIs

### Apify (Google Maps Reviews)
- **Actor:** `agents/google-maps-reviews`
- **Returns:** Array of review objects
- **Limit:** 100 reviews (fixed)

### Gravity (X Tweets)
- **Endpoint:** `https://constellation.api.cloud.macrocosmos.ai/sn13.v1.Sn13Service/OnDemandData`
- **Returns:** Array of tweet objects
- **Limit:** Configurable via `TWEET_LIMIT`

---

## ⚙️ Required Environment Variables

```bash
# Miner
APIFY_TOKEN=your_apify_token
GRAVITY_API_TOKEN=your_gravity_token
TWEET_LIMIT=100

# Validator
PLATFORM_TOKEN=your_platform_token
```

---

## 📊 Visual Diagrams

The documentation includes three Mermaid diagrams:

1. **Request/Response Flow** - Shows the complete sequence from validator to external APIs
2. **Data Type Structures** - Shows the structure of requests and responses for each type
3. **API Endpoints Overview** - Shows all available endpoints and their relationships

---

## 🚀 Getting Started

1. **Read** `SUBNET-111-SUMMARY.md` for overview
2. **Review** the visual diagrams to understand the flow
3. **Check** `SUBNET-111-CODE-EXAMPLES.md` for implementation examples
4. **Reference** `SUBNET-111-QUICK-REFERENCE.md` as needed
5. **Deep dive** into `SUBNET-111-API-ANALYSIS.md` for detailed information

---

## 📝 Document Versions

All documents are based on the current state of the Subnet-111 codebase as of 2025-02-04.

---

## 🎓 Additional Resources

### Key Source Files
- `Subnet-111/neurons/miner.py` - Miner entry point
- `Subnet-111/node/routes/miner/fetch.js` - Miner Node route
- `Subnet-111/oneoneone/protocol.py` - Protocol definition
- `Subnet-111/node/modules/apify/index.js` - Apify integration
- `Subnet-111/node/utils/miner/types/x-tweets/fetch/index.js` - Gravity integration

---

**Happy coding! 🎉**

