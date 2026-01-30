const express = require('express');
const router = express.Router();
const leetcodeController = require('../controllers/leetcodeController');
const { fetchCodeforcesAnalytics } = require('../controllers/codeforces');
const { fetchCombinedAnalytics } = require('../controllers/combinedController');

// @route   GET /api/platform/combined
// @desc    Get unified analytics from LeetCode and Codeforces
// @query   leetcode={username}, codeforces={handle}
// @access  Public
router.get('/combined', fetchCombinedAnalytics);

// @route   GET /api/platform/leetcode/:username
// @desc    Get LeetCode user analytics by username
// @access  Public
router.get('/leetcode/:username', leetcodeController.fetchLeetCodeAnalytics);

// @route   GET /api/platform/codeforces/:handle
// @desc    Get Codeforces user analytics by handle
// @access  Public
router.get('/codeforces/:handle', fetchCodeforcesAnalytics);

module.exports = router;
