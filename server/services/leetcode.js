const axios = require('axios');

const GRAPHQL_URL = "https://leetcode.com/graphql";

const fetchUserProfile = async (username) => {
  const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }

        userCalendar {
          submissionCalendar
        }

        contestBadge {
          name
        }
      }

      userContestRanking(username: $username) {
        rating
        globalRanking
        attendedContestsCount
      }
    }
  `;

  const res = await axios.post(GRAPHQL_URL, {
    query,
    variables: { username },
  });

  const user = res.data.data.matchedUser;
  const contest = res.data.data.userContestRanking;

  const stats = user.submitStatsGlobal.acSubmissionNum;

  return {
    totalSolved: stats.find((x) => x.difficulty === "All").count,

    difficultyBreakdown: {
      easy: stats.find((x) => x.difficulty === "Easy").count,
      medium: stats.find((x) => x.difficulty === "Medium").count,
      hard: stats.find((x) => x.difficulty === "Hard").count,
    },

    calendar: JSON.parse(user.userCalendar.submissionCalendar),

    contest: {
      rating: contest?.rating || null,
      globalRanking: contest?.globalRanking || null,
      attendedContests: contest?.attendedContestsCount || 0,
    },
  };
};

const fetchSolvedProblemSlugs = async (username) => {
  const query = `
    query recentAcSubmissions($username: String!) {
      recentAcSubmissionList(username: $username, limit: 500) {
        titleSlug
      }
    }
  `;

  const res = await axios.post(GRAPHQL_URL, {
    query,
    variables: { username },
  });

  const submissions = res.data.data.recentAcSubmissionList;

  // Unique slugs
  return [...new Set(submissions.map((s) => s.titleSlug))];
};

const buildTopicAnalysis = async (slugs) => {
  const topicCounts = {};

  for (let slug of slugs) {
    const tags = await fetchProblemTags(slug);

    for (let tag of tags) {
      topicCounts[tag] = (topicCounts[tag] || 0) + 1;
    }
  }

  return topicCounts;
};

const fetchProblemTags = async (slug) => {
  const query = `
    query questionTags($slug: String!) {
      question(titleSlug: $slug) {
        topicTags {
          name
        }
      }
    }
  `;

  const res = await axios.post(GRAPHQL_URL, {
    query,
    variables: { slug },
  });

  return res.data.data.question.topicTags.map((t) => t.name);
};


/**
 * Main Service:
 * Returns full LeetCode analytics report for a username
 */
const getLeetCodeUserAnalytics = async (username) => {
  try {
    console.log("Fetching analytics for:", username);

    // -----------------------------------
    // 1. Fetch Profile Stats + Calendar + Contest
    // -----------------------------------
    const profileData = await fetchUserProfile(username);

    // -----------------------------------
    // 2. Fetch Solved Problem Slugs (Accepted)
    // -----------------------------------
    const solvedSlugs = await fetchSolvedProblemSlugs(username);

    // -----------------------------------
    // 3. Fetch Topic Tags + Build Topic Count
    // -----------------------------------
    const topicAnalysis = await buildTopicAnalysis(solvedSlugs);

    // -----------------------------------
    // 4. Final Response JSON
    // -----------------------------------
    return {
      username,

      totalSolved: profileData.totalSolved,

      difficultyBreakdown: profileData.difficultyBreakdown,

      calendar: profileData.calendar,

      contest: profileData.contest,

      topicAnalysis,
    };
  } catch (err) {
    console.error("Analytics Error:", err.message);
    throw new Error("Failed to fetch LeetCode analytics.");
  }
};

module.exports = {
  getLeetCodeUserAnalytics,
};
