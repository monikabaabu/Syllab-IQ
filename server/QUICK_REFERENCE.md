# Quick Reference - Unified Syllabus

## API Endpoint

```
GET /api/platform/combined?leetcode={username}&codeforces={handle}
```

## Query Parameters

| Parameter | Type | Required | Example |
|-----------|------|----------|---------|
| leetcode | string | No* | thenewboston |
| codeforces | string | No* | tourist |

*At least one is required

## Response Structure

```
┌─ profiles
│  ├─ leetcode { username, totalSolved, difficultyBreakdown }
│  └─ codeforces { handle, profile, totalSolved }
│
├─ combinedMetrics
│  ├─ totalSolvedLeetCode
│  ├─ totalSolvedCodeforces
│  └─ combinedTotal
│
├─ activityCalendar { "YYYY-MM-DD": count, ... }
│
├─ topicAnalysis { topic: count, ... } [sorted by frequency]
│
├─ contestData
│  ├─ leetcode { attendedContests, recentContests[] }
│  └─ codeforces { attendedContests, recentContests[] }
│
└─ summary
   ├─ platformsCovered
   ├─ lastUpdated
   └─ topSkills[]
```

## cURL Examples

### Full Profile (Both Platforms)
```bash
curl "http://localhost:5000/api/platform/combined?leetcode=user1&codeforces=user2"
```

### LeetCode Only
```bash
curl "http://localhost:5000/api/platform/combined?leetcode=user1"
```

### Codeforces Only
```bash
curl "http://localhost:5000/api/platform/combined?codeforces=user2"
```

## JavaScript/Node Examples

### Using fetch
```javascript
const response = await fetch(
  'http://localhost:5000/api/platform/combined?leetcode=user1&codeforces=user2'
);
const data = await response.json();
```

### Using axios
```javascript
const axios = require('axios');

const { data } = await axios.get(
  'http://localhost:5000/api/platform/combined',
  {
    params: {
      leetcode: 'user1',
      codeforces: 'user2'
    }
  }
);
```

## Data Merging Explained

### Calendar
```
LeetCode: { "1704067200": 3 }  →  "2024-01-01": 3
Codeforces: { "2024-01-01": 2 }  →  "2024-01-01": 2
Result: { "2024-01-01": 5 }  ← Combined!
```

### Topics
```
LeetCode: { DP: 30, Arrays: 25 }
Codeforces: { DP: 15, Arrays: 20, Strings: 10 }
Result (sorted): { DP: 45, Arrays: 45, Strings: 10 }
```

### Contest
```
Kept separate for each platform
├─ LeetCode contests
└─ Codeforces contests
```

## Key Files

| File | Purpose |
|------|---------|
| `services/combined.js` | Orchestrates data merging |
| `controllers/combinedController.js` | Handles API requests |
| `routes/platform.js` | Defines `/api/platform/combined` route |
| `helper/combineCal.js` | Merges calendars |
| `helper/combineTopic.js` | Merges topics |

## Response Examples

### Success (Both Platforms)
```json
{
  "success": true,
  "data": {
    "profiles": {
      "leetcode": { "username": "user1", "totalSolved": 450 },
      "codeforces": { "handle": "user2", "totalSolved": 2890 }
    },
    "combinedMetrics": { "combinedTotal": 3340 },
    "activityCalendar": { "2025-01-30": 5, "2025-01-29": 3 },
    "topicAnalysis": { "DP": 45, "Arrays": 45, "Graphs": 35 },
    "summary": { "topSkills": ["DP", "Arrays", "Graphs"] }
  }
}
```

### Error (Missing Parameters)
```json
{
  "success": false,
  "message": "At least one platform username/handle is required"
}
```

### Partial Success (One Platform Only)
```json
{
  "success": true,
  "data": {
    "profiles": {
      "leetcode": { "username": "user1", "totalSolved": 450 },
      "codeforces": null
    },
    "combinedMetrics": { "totalSolvedLeetCode": 450, "combinedTotal": 450 },
    "summary": { "platformsCovered": ["leetcode"] }
  }
}
```

## Performance Metrics

| Operation | Time |
|-----------|------|
| Both platforms | 2-5s |
| Single platform | 1-2s |
| Merging | ~100ms |

## Common Use Cases

### 1. Get All Skills
```bash
curl -s "http://localhost:5000/api/platform/combined?leetcode=user&codeforces=user" \
  | jq '.data.topicAnalysis'
```

### 2. Get Activity Calendar
```bash
curl -s "http://localhost:5000/api/platform/combined?leetcode=user&codeforces=user" \
  | jq '.data.activityCalendar'
```

### 3. Get Top 10 Skills
```bash
curl -s "http://localhost:5000/api/platform/combined?leetcode=user&codeforces=user" \
  | jq '.data.summary.topSkills'
```

### 4. Get Total Problems Solved
```bash
curl -s "http://localhost:5000/api/platform/combined?leetcode=user&codeforces=user" \
  | jq '.data.combinedMetrics'
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Kill process: `kill -9 $(lsof -ti:5000)` |
| Timeout on API call | Check network connection, API availability |
| Empty response | Verify username/handle is valid |
| Null in profiles | One platform API failed - partial data returned |

## Related Endpoints

```
GET /api/platform/leetcode/:username      # LeetCode only
GET /api/platform/codeforces/:handle      # Codeforces only
GET /api/platform/combined                # Both (NEW)
```

## Server Startup

```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

## Documentation Files

- `COMBINED_ANALYTICS_API.md` - Full API documentation
- `UNIFIED_SYLLABUS_README.md` - Implementation guide
- `ARCHITECTURE_DIAGRAM.md` - System design
- `IMPLEMENTATION_SUMMARY.md` - Detailed summary
- `THIS FILE` - Quick reference
