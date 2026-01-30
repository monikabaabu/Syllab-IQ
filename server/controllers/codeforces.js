const { getCodeforcesUserAnalytics } = require('../services/codeforces');

/**
 * Controller: Fetch Codeforces Analytics
 * Route: GET /api/codeforces/:handle
 */
const fetchCodeforcesAnalytics = async (req, res) => {
  try {
    const { handle } = req.params;

    const data = await getCodeforcesUserAnalytics(handle);

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

module.exports = { fetchCodeforcesAnalytics };