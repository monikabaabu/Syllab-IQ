const axios = require('axios');

const CF_BASE = "https://codeforces.com/api";

/**
 * Full Codeforces Analytics Service
 *
 * Returns:
 * - total solved problems
 * - contest rating info
 * - submission calendar heatmap
 * - topic/tag wise solved counts (Top 15 sorted)
 */
const getCodeforcesUserAnalytics = async (handle) => {
  try {
    console.log("Fetching Codeforces analytics for:", handle);

    // -----------------------------
    // 1. Fetch Profile Info
    // -----------------------------
    const userInfoRes = await axios.get(
      `${CF_BASE}/user.info?handles=${handle}`
    );
console.log(userInfoRes.data);
    if (userInfoRes.data.status !== "OK") {
      throw new Error("Invalid Codeforces handle.");
    }

    const user = userInfoRes.data.result[0];

    // -----------------------------
    // 2. Fetch Contest Rating History
    // -----------------------------
    const ratingRes = await axios.get(
      `${CF_BASE}/user.rating?handle=${handle}`
    );
console.log(ratingRes.data);
    const contests =
      ratingRes.data.status === "OK" ? ratingRes.data.result : [];

    const contestData = {
      attendedContests: contests.length,
      recentContests: contests.slice(-5).map((c) => ({
        contestName: c.contestName,
        rank: c.rank,
        oldRating: c.oldRating,
        newRating: c.newRating,
      })),
    };
console.log(contestData);
    // -----------------------------
    // 3. Fetch User Submissions
    // -----------------------------
    const statusRes = await axios.get(
      `${CF_BASE}/user.status?handle=${handle}`
    );

    if (statusRes.data.status !== "OK") {
      throw new Error("Unable to fetch submissions.");
    }
console.log(statusRes.data);
    const submissions = statusRes.data.result;

    // -----------------------------
    // 4. Compute Solved + Tags + Calendar
    // -----------------------------
    const solvedSet = new Set();
    const topicCounts = {};
    const calendar = {};

    for (let sub of submissions) {
      if (sub.verdict !== "OK") continue;

      const prob = sub.problem;

      // Unique solved problem key
      const problemKey = `${prob.contestId}-${prob.index}`;

      // Calendar day count
      const date = new Date(sub.creationTimeSeconds * 1000)
        .toISOString()
        .split("T")[0];

      calendar[date] = (calendar[date] || 0) + 1;

      // Skip if already solved
      if (solvedSet.has(problemKey)) continue;
      solvedSet.add(problemKey);

      // Tag/topic counting
      for (let tag of prob.tags || []) {
        topicCounts[tag] = (topicCounts[tag] || 0) + 1;
      }
    }

    // -----------------------------
    // 5. Sort Topic Analysis (Top 15)
    // -----------------------------
    const sortedTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1]) // descending count
      .slice(0, 200); // top 200 only

    const topicAnalysisTop15 = {};
    for (let [tag, count] of sortedTopics) {
      topicAnalysisTop15[tag] = count;
    }

    // -----------------------------
    // Final Response JSON
    // -----------------------------
    return {
      handle,

      profile: {
        rating: user.rating || null,
        maxRating: user.maxRating || null,
        rank: user.rank || "unrated",
        maxRank: user.maxRank || "unrated",
      },

      totalSolved: solvedSet.size,

      contest: contestData,

      topicAnalysis: topicAnalysisTop15,

      calendar,
    };
  } catch (err) {
    console.error("Codeforces Service Error:", err.message);
    throw new Error(`Failed to fetch analytics for ${handle}`);
  }
};

module.exports = {
  getCodeforcesUserAnalytics,
};
