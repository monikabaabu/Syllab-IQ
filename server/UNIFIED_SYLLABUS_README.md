# Unified Competitive Programming Analytics (Syllabus)

## Overview

The combined analytics service merges data from **LeetCode** and **Codeforces** into a single unified syllabus. This provides a comprehensive view of a student's competitive programming profile across multiple platforms.

## What's New

### Files Created
1. **`services/combined.js`** - Core service that orchestrates data fetching and merging
2. **`controllers/combinedController.js`** - Express controller for the combined endpoint
3. **`COMBINED_ANALYTICS_API.md`** - Detailed API documentation

### Files Modified
1. **`routes/platform.js`** - Added combined route endpoint
2. **`helper/combineCal.js`** - Converted to CommonJS
3. **`helper/combineTopic.js`** - Converted to CommonJS

## API Endpoint

```
GET /api/platform/combined?leetcode={username}&codeforces={handle}
```

### Query Parameters
- `leetcode` (optional): LeetCode username
- `codeforces` (optional): Codeforces handle
- **Requirement**: At least one username is required

### Examples

**LeetCode only:**
```bash
curl http://localhost:5000/api/platform/combined?leetcode=thenewboston
```

**Codeforces only:**
```bash
curl http://localhost:5000/api/platform/combined?codeforces=tourist
```

**Both platforms (Unified Syllabus):**
```bash
curl http://localhost:5000/api/platform/combined?leetcode=thenewboston&codeforces=tourist
```

## Response Structure

### High-Level Format
```json
{
  "success": true,
  "data": {
    "profiles": { /* Profile info from both platforms */ },
    "combinedMetrics": { /* Total problems solved across platforms */ },
    "activityCalendar": { /* Merged submission calendar */ },
    "topicAnalysis": { /* Combined and sorted coding topics */ },
    "contestData": { /* Contest performance from both platforms */ },
    "summary": { /* Quick insights and top skills */ }
  }
}
```

### 1. Profiles
Shows user information from each platform:
- LeetCode: username, total solved, difficulty breakdown
- Codeforces: handle, rating, rank, total solved

### 2. Combined Metrics
Aggregated statistics:
- Total problems solved on LeetCode
- Total problems solved on Codeforces
- Combined total across both platforms

### 3. Activity Calendar
**Unified submission calendar** with combined counts:
- Format: `YYYY-MM-DD` → submission count
- Merges LeetCode timestamps and Codeforces dates
- Sorted chronologically
- Example: `"2025-01-30": 5` means 5 submissions on that day across both platforms

### 4. Topic Analysis
**Merged and sorted list** of coding topics:
- Combines all topics from both LeetCode and Codeforces
- Sorted by frequency (most to least common)
- Shows which coding areas the student is strongest in
- Example:
  ```json
  {
    "DynamicProgramming": 45,
    "BinarySearch": 38,
    "Graphs": 35,
    "Arrays": 32
  }
  ```

### 5. Contest Data
**Separate contest information** for each platform:
- LeetCode: Weekly/Biweekly contest history
- Codeforces: Official round history
- Recent contests (last 5) with ratings and ranks

### 6. Summary
Quick insights:
- Which platforms are covered
- Last updated timestamp
- Top 10 coding skills based on merged topics

## Data Merging Logic

### Calendar Merging
```
LeetCode timestamp (Unix seconds)  →  Convert to YYYY-MM-DD
Codeforces date (YYYY-MM-DD)      →  Use as-is
Merge & combine counts             →  Single calendar with combined values
```

### Topic Analysis Merging
```
LeetCode topics + counts
Codeforces topics + counts
        ↓
  Merge all topics
        ↓
 Sum matching topics
        ↓
Sort by frequency (descending)
```

### Contest Data Merging
- Kept separate per platform to preserve context and details
- LeetCode contests are separated from Codeforces contests
- Each contains recent performance history

## Error Handling

The service gracefully handles partial failures:

1. **Both platforms requested**:
   - If one API fails: Returns data from available platform
   - If both fail: Returns error message

2. **Only one platform requested**:
   - If that platform fails: Returns error message

3. **No platforms provided**:
   - Returns 400 error with validation message

## Technical Implementation

### Service Flow
```
GET /api/platform/combined?leetcode=user&codeforces=handle
            ↓
fetchCombinedAnalytics(controller)
            ↓
getCombinedAnalytics(service)
            ↓
        Parallel fetch
            ├─ getLeetCodeUserAnalytics()
            └─ getCodeforcesUserAnalytics()
            ↓
Merge with helper functions
    ├─ mergeCalendarsToDateFormat()
    └─ mergeTopicAnalysisSorted()
            ↓
Return unified response
```

### Helper Functions

**`mergeCalendarsToDateFormat(leetcodeCalendar, codeforcesCalendar)`**
- Converts LeetCode Unix timestamps to YYYY-MM-DD
- Merges with Codeforces dates
- Combines submission counts for the same date
- Returns sorted calendar object

**`mergeTopicAnalysisSorted(topicA, topicB)`**
- Merges two topic-count objects
- Sums counts for matching topics
- Sorts by count in descending order
- Returns sorted merged object

## Use Cases

1. **Complete Skill Assessment**
   - See all coding topics from both major platforms
   - Identify strongest and weakest areas

2. **Activity Tracking**
   - Combined calendar shows total coding activity
   - Better representation of practice frequency

3. **Progress Monitoring**
   - Track combined problem-solving stats
   - Monitor growth across multiple platforms

4. **Contest Performance**
   - View rating history from both platforms
   - Compare performance trajectory

5. **Resume/Portfolio Building**
   - Present comprehensive competitive programming profile
   - Show engagement across multiple platforms

## Example Response

```json
{
  "success": true,
  "data": {
    "profiles": {
      "leetcode": {
        "username": "username123",
        "totalSolved": 450,
        "difficultyBreakdown": {
          "easy": 150,
          "medium": 200,
          "hard": 100
        }
      },
      "codeforces": {
        "handle": "tourist",
        "profile": {
          "rating": 3500,
          "maxRating": 3600,
          "rank": "International Master",
          "maxRank": "Candidate Master"
        },
        "totalSolved": 2890
      }
    },
    "combinedMetrics": {
      "totalSolvedLeetCode": 450,
      "totalSolvedCodeforces": 2890,
      "combinedTotal": 3340
    },
    "activityCalendar": {
      "2025-01-30": 5,
      "2025-01-29": 3,
      "2025-01-28": 7
    },
    "topicAnalysis": {
      "DynamicProgramming": 120,
      "BinarySearch": 95,
      "Graphs": 87,
      "Arrays": 82
    },
    "contestData": {
      "leetcode": {
        "attendedContests": 45,
        "recentContests": [...]
      },
      "codeforces": {
        "attendedContests": 156,
        "recentContests": [...]
      }
    },
    "summary": {
      "platformsCovered": ["leetcode", "codeforces"],
      "lastUpdated": "2025-01-31T10:30:45.123Z",
      "topSkills": [
        "DynamicProgramming",
        "BinarySearch",
        "Graphs",
        "Arrays",
        "Strings",
        "Trees",
        "HashTable",
        "TwoPointers",
        "Math",
        "Sorting"
      ]
    }
  }
}
```

## Testing

To test the combined endpoint:

```bash
# Start server
npm run dev

# In another terminal, test with both platforms
curl "http://localhost:5000/api/platform/combined?leetcode=thenewboston&codeforces=tourist"

# Or test with single platform
curl "http://localhost:5000/api/platform/combined?leetcode=thenewboston"
curl "http://localhost:5000/api/platform/combined?codeforces=tourist"
```

## Dependencies

- **axios**: For API calls to LeetCode and Codeforces
- **express**: Web framework
- **mongodb/mongoose**: Database (for user management)

## Performance Considerations

- Both platform APIs are called **in parallel** using `Promise.all()`
- Calendar data: 1-2 years of history (~700 entries average)
- Topic data: 100+ topics from combined platforms
- Response time: ~2-5 seconds (depends on API availability)

## Future Enhancements

1. **Caching**: Cache results for 1 hour to reduce API calls
2. **More Platforms**: Add HackerRank, AtCoder, CodeChef support
3. **Detailed Analytics**: Difficulty trends, performance graphs
4. **Recommendations**: Suggest topics to focus on based on gaps
5. **Comparisons**: Compare with other users' profiles
