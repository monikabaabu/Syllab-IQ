const express = require('express');
const router = express.Router();
const leetcodeController = require('../controllers/leetcodeController');

// @route   GET /api/leetcode/:username
// @desc    Get LeetCode user analytics by username
// @access  Public
router.get('/:username', leetcodeController.getLeetCodeAnalytics);

// @route   GET /api/leetcode/analytics/:rollNumber?platform=leetcode
// @desc    Get platform analytics by roll number and platform
// @access  Public
router.get('/analytics/:rollNumber', leetcodeController.getAnalyticsByRollNumber);

module.exports = router;
