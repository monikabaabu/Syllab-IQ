const mongoose = require('mongoose');

const userLinksSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  leetcode: {
    type: String,
    trim: true
  },
  hackerrank: {
    type: String,
    trim: true
  },
  codeforces: {
    type: String,
    trim: true
  },
  codechef: {
    type: String,
    trim: true
  },
  atcoder: {
    type: String,
    trim: true
  },
  geeksforgeeks: {
    type: String,
    trim: true
  },
  hackerearth: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UserLinks', userLinksSchema);
