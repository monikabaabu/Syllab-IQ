const axios = require('axios');

// Base URL for LeetCode API
const LEETCODE_API_BASE = 'https://alfa-leetcode-api.onrender.com';

// Cache for problems data (since it's large and doesn't change frequently)
let problemsCache = null;
let problemsCacheTime = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Fetch all problems with their tags for topic analysis
 * Uses caching to avoid repeated API calls
 * @returns {Promise<Array>} Array of all problems with tags
 */
async function getAllProblemsWithTags() {
  try {
    // Check if cache is valid
    if (problemsCache && problemsCacheTime && Date.now() - problemsCacheTime < CACHE_DURATION) {
      console.log('Using cached problems data');
      return problemsCache;
    }

    console.log('Fetching problems from API...');
    const response = await axios.get(`${LEETCODE_API_BASE}/problems`, {
      timeout: 30000
    });

    problemsCache = response.data.problems || [];
    problemsCacheTime = Date.now();

    return problemsCache;
  } catch (error) {
    console.error('Error fetching problems:', error.message);
    // Return empty array if API fails
    return [];
  }
}

/**
 * Build topic analysis by mapping solved problems to their tags
 * @param {Array<string>} solvedProblems - Array of solved problem titleSlugs
 * @param {Array<Object>} allProblems - Array of all problems with tags
 * @returns {Object} Topic → count mapping
 */
function buildTopicAnalysis(solvedProblems, allProblems) {
  const topicMap = {};

  // Create a map of titleSlug to problem for faster lookup
  const problemMap = {};
  allProblems.forEach(problem => {
    if (problem.titleSlug) {
      problemMap[problem.titleSlug] = problem;
    }
  });

  // Count solved problems by topic
  solvedProblems.forEach(titleSlug => {
    const problem = problemMap[titleSlug];
    if (problem && problem.topicTags && Array.isArray(problem.topicTags)) {
      problem.topicTags.forEach(tag => {
        const tagName = tag.name || tag;
        topicMap[tagName] = (topicMap[tagName] || 0) + 1;
      });
    }
  });

  // Sort topics by count (descending)
  const sortedTopics = Object.entries(topicMap)
    .sort((a, b) => b[1] - a[1])
    .reduce((obj, [key, val]) => {
      obj[key] = val;
      return obj;
    }, {});

  return sortedTopics;
}

/**
 * Main function to get LeetCode user analytics
 * @param {string} username - LeetCode username
 * @returns {Promise<Object>} Structured analytics JSON
 */
async function getLeetCodeUserAnalytics(username) {
  try {
    // Validate username
    if (!username || typeof username !== 'string' || username.trim() === '') {
      return {
        success: false,
        error: 'Invalid username provided'
      };
    }

    username = username.trim().toLowerCase();

    // Fetch user stats
    console.log(`Fetching LeetCode analytics for: ${username}`);
    
    const [userStats, userCalendar, userContest, solvedProblems] = await Promise.allSettled([
      axios.get(`${LEETCODE_API_BASE}/${username}`, { timeout: 10000 }),
      axios.get(`${LEETCODE_API_BASE}/${username}/calendar`, { timeout: 10000 }),
      axios.get(`${LEETCODE_API_BASE}/${username}/contest`, { timeout: 10000 }),
      axios.get(`${LEETCODE_API_BASE}/${username}/solved`, { timeout: 10000 })
    ]);

    // Check if user stats were successfully fetched
    if (userStats.status === 'rejected') {
      return {
        success: false,
        error: 'User not found or API error',
        username: username
      };
    }

    // Extract user stats
    const userStatsData = userStats.value.data || {};
    const totalSolved = userStatsData.totalSolved || 0;
    const easySolved = userStatsData.easySolved || 0;
    const mediumSolved = userStatsData.mediumSolved || 0;
    const hardSolved = userStatsData.hardSolved || 0;

    // Extract calendar data
    const calendarData = {};
    if (userCalendar.status === 'fulfilled') {
      const calendar = userCalendar.value.data?.submissionCalendar || {};
      Object.assign(calendarData, calendar);
    }

    // Extract contest data
    let contestData = {
      rating: 0,
      globalRanking: 0,
      attendedContests: 0
    };

    if (userContest.status === 'fulfilled') {
      const contestStats = userContest.value.data || {};
      contestData = {
        rating: contestStats.rating || 0,
        globalRanking: contestStats.ranking || 0,
        attendedContests: contestStats.attendedContestsCount || 0
      };
    }

    // Extract solved problems and build topic analysis
    let topicAnalysis = {};
    if (solvedProblems.status === 'fulfilled') {
      const solvedList = solvedProblems.value.data?.solvedProblem || [];
      
      // Extract titleSlugs from solved problems
      const titleSlugs = solvedList.map(problem => {
        if (typeof problem === 'string') return problem;
        if (problem.titleSlug) return problem.titleSlug;
        return null;
      }).filter(slug => slug !== null);

      // Fetch all problems with tags
      const allProblems = await getAllProblemsWithTags();

      // Build topic analysis
      topicAnalysis = buildTopicAnalysis(titleSlugs, allProblems);
    }

    // Construct final response
    const analytics = {
      success: true,
      username: userStatsData.username || username,
      totalSolved: totalSolved,
      difficultyBreakdown: {
        easy: easySolved,
        medium: mediumSolved,
        hard: hardSolved
      },
      calendar: {
        submissionCalendar: calendarData
      },
      contest: contestData,
      topicAnalysis: topicAnalysis,
      fetchedAt: new Date().toISOString()
    };

    return analytics;
  } catch (error) {
    console.error('Error in getLeetCodeUserAnalytics:', error.message);
    return {
      success: false,
      error: 'An error occurred while fetching LeetCode analytics',
      message: error.message
    };
  }
}

/**
 * Clear problems cache (useful for manual refresh)
 */
function clearProblemsCache() {
  problemsCache = null;
  problemsCacheTime = null;
  console.log('Problems cache cleared');
}

module.exports = {
  getLeetCodeUserAnalytics,
  clearProblemsCache,
  getAllProblemsWithTags
};
