const { getLeetCodeUserAnalytics } = require('../services/leetcode');
const UserLinks = require('../models/UserLinks');

/**
 * @desc    Get LeetCode user analytics
 * @route   GET /api/leetcode/:username
 * @access  Public
 */
exports.getLeetCodeAnalytics = async (req, res) => {
  try {
    const { username } = req.params;

    const analytics = await getLeetCodeUserAnalytics(username);

    if (!analytics.success) {
      return res.status(404).json(analytics);
    }

    res.status(200).json(analytics);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get platform analytics by roll number and platform
 * @route   GET /api/leetcode/analytics/:rollNumber?platform=leetcode
 * @access  Public
 */
exports.getAnalyticsByRollNumber = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const { platform } = req.query;

    // Validation
    if (!rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Roll number is required'
      });
    }

    if (!platform) {
      return res.status(400).json({
        success: false,
        message: 'Platform is required (e.g., leetcode, hackerrank, codeforces, codechef, atcoder, geeksforgeeks, hackerearth)'
      });
    }

    // Fetch user links
    const userLinks = await UserLinks.findOne({ rollNumber })
      .populate('userId', 'name email rollNumber');

    if (!userLinks) {
      return res.status(404).json({
        success: false,
        message: `User not found with roll number: ${rollNumber}`
      });
    }

    // Get the handle for the specified platform
    const platformHandle = userLinks[platform.toLowerCase()];

    if (!platformHandle) {
      return res.status(404).json({
        success: false,
        message: `No ${platform} handle found for roll number: ${rollNumber}`
      });
    }

    // Fetch analytics based on platform
    let analytics;

    switch (platform.toLowerCase()) {
      case 'leetcode':
        analytics = await getLeetCodeUserAnalytics(platformHandle);
        break;
      
      case 'hackerrank':
      case 'codeforces':
      case 'codechef':
      case 'atcoder':
      case 'geeksforgeeks':
      case 'hackerearth':
        // Placeholder for future implementations
        return res.status(501).json({
          success: false,
          message: `Analytics for ${platform} not yet implemented`,
          handle: platformHandle
        });
      
      default:
        return res.status(400).json({
          success: false,
          message: `Unknown platform: ${platform}`
        });
    }

    if (!analytics.success) {
      return res.status(404).json(analytics);
    }

    // Add user info to response
    const response = {
      ...analytics,
      user: {
        rollNumber: userLinks.rollNumber,
        name: userLinks.userId?.name || 'N/A',
        email: userLinks.userId?.email || 'N/A'
      },
      platform: platform.toLowerCase()
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
