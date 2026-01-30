const { getCombinedAnalytics } = require('../services/combined');

/**
 * Controller: Fetch combined analytics from LeetCode and Codeforces
 * Creates unified syllabus with merged data
 */
const fetchCombinedAnalytics = async (req, res) => {
  try {
    const { leetcode, codeforces } = req.query;

    // Validate inputs
    if (!leetcode && !codeforces) {
      return res.status(400).json({
        success: false,
        message: 'At least one platform username/handle is required (leetcode or codeforces)',
      });
    }

    const data = await getCombinedAnalytics(leetcode, codeforces);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { fetchCombinedAnalytics };
