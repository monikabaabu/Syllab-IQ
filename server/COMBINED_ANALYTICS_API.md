# Combined Analytics Response Structure

## Endpoint
```
GET /api/platform/combined?leetcode={username}&codeforces={handle}
```

## Query Parameters
- `leetcode` (optional): LeetCode username
- `codeforces` (optional): Codeforces handle
- At least one is required

## Response Structure

```json
{
  "success": true,
  "data": {
    // ===================================
    // 1. PROFILE INFORMATION
    // ===================================
    "profiles": {
      "leetcode": {
        "username": "string",
        "totalSolved": "number",
        "difficultyBreakdown": {
          "easy": number,
          "medium": number,
          "hard": number
        }
      },
      "codeforces": {
        "handle": "string",
        "profile": {
          "rating": number,
          "maxRating": number,
          "rank": "string",
          "maxRank": "string"
        },
        "totalSolved": number
      }
    },

    // ===================================
    // 2. COMBINED METRICS
    // ===================================
    "combinedMetrics": {
      "totalSolvedLeetCode": number,
      "totalSolvedCodeforces": number,
      "combinedTotal": number
    },

    // ===================================
    // 3. MERGED ACTIVITY CALENDAR
    // ===================================
    // Format: YYYY-MM-DD with combined submission counts
    "activityCalendar": {
      "2025-01-30": 5,      // 3 LeetCode + 2 Codeforces
      "2025-01-29": 2,      // 1 LeetCode + 1 Codeforces
      "2025-01-28": 7,      // 4 LeetCode + 3 Codeforces
      "..."": "..."
    },

    // ===================================
    // 4. MERGED & SORTED TOPIC ANALYSIS
    // ===================================
    // Combined topics from both platforms, sorted by frequency (descending)
    "topicAnalysis": {
      "DynamicProgramming": 45,
      "BinarySearch": 38,
      "Graphs": 35,
      "Arrays": 32,
      "Strings": 29,
      "Trees": 28,
      "HashTable": 27,
      "TwoPointers": 26,
      "Math": 24,
      "Sorting": 22,
      "..."": "..."
    },

    // ===================================
    // 5. CONTEST DATA FROM BOTH PLATFORMS
    // ===================================
    "contestData": {
      "leetcode": {
        "totalParticipation": number,
        "rating": number,
        "attendedContests": number,
        "recentContests": [
          {
            "contestName": "string",
            "rank": number,
            "oldRating": number,
            "newRating": number,
            "ratingChange": number
          },
          "..."
        ]
      },
      "codeforces": {
        "attendedContests": number,
        "recentContests": [
          {
            "contestName": "string",
            "rank": number,
            "oldRating": number,
            "newRating": number
          },
          "..."
        ]
      }
    },

    // ===================================
    // 6. SUMMARY & TOP SKILLS
    // ===================================
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

## Example Usage

### Single Platform (LeetCode only)
```
GET /api/platform/combined?leetcode=username123
```

### Single Platform (Codeforces only)
```
GET /api/platform/combined?codeforces=tourist
```

### Both Platforms (Unified Syllabus)
```
GET /api/platform/combined?leetcode=username123&codeforces=tourist
```

## Data Merging Logic

### 1. Calendar Merging
- **LeetCode Format**: Unix timestamps (seconds)
- **Codeforces Format**: YYYY-MM-DD strings
- **Output Format**: YYYY-MM-DD with combined submission counts
- **Sorting**: Chronological order (ascending by date)

### 2. Topic Analysis Merging
- Combines topic counts from both platforms
- Each topic tag from both services is merged
- Results sorted by frequency (descending)
- Enables identification of strongest coding areas across both platforms

### 3. Contest Data
- Kept separate per platform to preserve context
- LeetCode: Weekly/Biweekly contests
- Codeforces: Official Codeforces rounds
- Recent contests (last 5) included for each platform

## Error Handling

```json
{
  "success": false,
  "message": "At least one platform username/handle is required"
}
```

Valid error scenarios:
- No platform username/handle provided
- LeetCode API unreachable (gracefully continues with Codeforces data)
- Codeforces API unreachable (gracefully continues with LeetCode data)
- Both APIs fail: Returns error message
- Invalid username/handle: Returns appropriate error from the respective API

## Benefits of Unified Syllabus

1. **Complete Skill Assessment**: See all coding topics across multiple platforms
2. **Accurate Activity Tracking**: Combined calendar shows total practice frequency
3. **Competitive Edge Analysis**: Compare contest performance across platforms
4. **Comprehensive Progress Tracking**: Single view of all achievements
5. **Better Resource Planning**: Identify weak areas from merged data
