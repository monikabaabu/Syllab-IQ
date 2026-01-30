const { getLeetCodeUserAnalytics } = require('./leetcode');
const { getCodeforcesUserAnalytics } = require('./codeforces');
const { mergeCalendarsToDateFormat } = require('../helper/combineCal');
const { mergeTopicAnalysisSorted } = require('../helper/combineTopic');

/**
 * Fetch and merge analytics from both LeetCode and Codeforces
 * Creates a unified syllabus with combined calendar, topics, and contest data
 */
const getCombinedAnalytics = async (leetcodeUsername, codeforcesHandle) => {
  try {
    // Fetch data from both platforms in parallel
    const [leetcodeData, codeforcesData] = await Promise.all([
      getLeetCodeUserAnalytics(leetcodeUsername).catch((err) => {
        console.warn('LeetCode fetch failed:', err.message);
        return null;
      }),
      getCodeforcesUserAnalytics(codeforcesHandle).catch((err) => {
        console.warn('Codeforces fetch failed:', err.message);
        return null;
      }),
    ]);

    // If both fail, throw error
    if (!leetcodeData && !codeforcesData) {
      throw new Error('Failed to fetch data from both platforms');
    }

    // Merge calendar data (converts LeetCode timestamps to YYYY-MM-DD format)
    const mergedCalendar = mergeCalendarsToDateFormat(
      leetcodeData?.calendar || {},
      codeforcesData?.calendar || {}
    );

    // Merge and sort topic analysis by frequency
    const mergedTopics = mergeTopicAnalysisSorted(
      leetcodeData?.topicAnalysis || {},
      codeforcesData?.topicAnalysis || {}
    );

    // Combine contest data
    const mergedContestData = {
      leetcode: leetcodeData?.contest || null,
      codeforces: codeforcesData?.contest || null,
    };

    // Build unified response structure
    const unifiedResponse = {
      // Profile info
      profiles: {
        leetcode: leetcodeData
          ? {
              username: leetcodeData.username,
              totalSolved: leetcodeData.totalSolved,
              difficultyBreakdown: leetcodeData.difficultyBreakdown,
            }
          : null,
        codeforces: codeforcesData
          ? {
              handle: codeforcesData.handle,
              profile: codeforcesData.profile,
              totalSolved: codeforcesData.totalSolved,
            }
          : null,
      },

      // Combined metrics
      combinedMetrics: {
        totalSolvedLeetCode: leetcodeData?.totalSolved || 0,
        totalSolvedCodeforces: codeforcesData?.totalSolved || 0,
        combinedTotal:
          (leetcodeData?.totalSolved || 0) +
          (codeforcesData?.totalSolved || 0),
      },

      // Merged calendar: YYYY-MM-DD format with combined submission counts
      activityCalendar: mergedCalendar,

      // Combined and sorted topic analysis
      topicAnalysis: mergedTopics,

      // Contest data from both platforms
      contestData: mergedContestData,

      // Summary statistics
      summary: {
        platformsCovered: [
          leetcodeData ? 'leetcode' : null,
          codeforcesData ? 'codeforces' : null,
        ].filter(Boolean),
        lastUpdated: new Date().toISOString(),
        topSkills: Object.keys(mergedTopics).slice(0, 10), // Top 10 topics
      },
    };

    return unifiedResponse;
  } catch (err) {
    console.error('Combined Analytics Error:', err.message);
    throw new Error('Failed to fetch combined analytics');
  }
};

module.exports = {
  getCombinedAnalytics,
};
