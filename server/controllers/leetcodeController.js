const { getLeetCodeUserAnalytics } = require('../services/leetcode');

const fetchLeetCodeAnalytics = async (req, res) => {
  try {
    const { username } = req.params;

    const data = await getLeetCodeUserAnalytics(username);

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

module.exports = { fetchLeetCodeAnalytics };
