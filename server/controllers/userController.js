const User = require('../models/User');
const UserLinks = require('../models/UserLinks');
const bcrypt = require('bcryptjs');

// @desc    Create new user
// @route   POST /api/users
// @access  Public
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, rollNumber } = req.body;

    // Validation
    if (!name || !email || !password || !rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, rollNumber'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if roll number exists
    const rollExists = await User.findOne({ rollNumber });
    if (rollExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this roll number'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      rollNumber
    });

    // Create empty user links
    await UserLinks.create({
      userId: user._id,
      rollNumber: rollNumber
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Public
exports.updateUser = async (req, res) => {
  try {
    const { name, email, rollNumber } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Check if roll number is taken by another user
    if (rollNumber && rollNumber !== user.rollNumber) {
      const rollExists = await User.findOne({ rollNumber });
      if (rollExists) {
        return res.status(400).json({
          success: false,
          message: 'Roll number already in use'
        });
      }
      
      // Update roll number in UserLinks as well
      await UserLinks.findOneAndUpdate(
        { userId: user._id },
        { rollNumber }
      );
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (rollNumber) user.rollNumber = rollNumber;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user links
    await UserLinks.findOneAndDelete({ userId: user._id });
    
    // Delete user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user links by roll number
// @route   GET /api/users/links/:rollNumber
// @access  Public
exports.getUserLinksByRollNumber = async (req, res) => {
  try {
    const userLinks = await UserLinks.findOne({ rollNumber: req.params.rollNumber })
      .populate('userId', 'name email rollNumber');
    
    if (!userLinks) {
      return res.status(404).json({
        success: false,
        message: 'User links not found'
      });
    }

    res.status(200).json({
      success: true,
      data: userLinks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user links by roll number
// @route   PUT /api/users/links/:rollNumber
// @access  Public
exports.updateUserLinksByRollNumber = async (req, res) => {
  try {
    const { leetcode, hackerrank, codeforces, codechef, atcoder, geeksforgeeks, hackerearth } = req.body;
    
    const userLinks = await UserLinks.findOne({ rollNumber: req.params.rollNumber });
    
    if (!userLinks) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this roll number'
      });
    }

    // Update links
    if (leetcode !== undefined) userLinks.leetcode = leetcode;
    if (hackerrank !== undefined) userLinks.hackerrank = hackerrank;
    if (codeforces !== undefined) userLinks.codeforces = codeforces;
    if (codechef !== undefined) userLinks.codechef = codechef;
    if (atcoder !== undefined) userLinks.atcoder = atcoder;
    if (geeksforgeeks !== undefined) userLinks.geeksforgeeks = geeksforgeeks;
    if (hackerearth !== undefined) userLinks.hackerearth = hackerearth;

    await userLinks.save();

    res.status(200).json({
      success: true,
      message: 'User links updated successfully',
      data: userLinks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Bulk create users
// @route   POST /api/users/bulk/create
// @access  Public
exports.bulkCreateUsers = async (req, res) => {
  try {
    const { users } = req.body;

    // Validation
    if (!Array.isArray(users)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of users'
      });
    }

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User array cannot be empty'
      });
    }

    const createdUsers = [];
    const skippedUsers = [];

    // Validate and hash all passwords first
    const processedUsers = [];
    for (let i = 0; i < users.length; i++) {
      const { name, email, password, rollNumber } = users[i];
      let validationError = null;

      // Validate required fields
      if (!name || typeof name !== 'string' || name.trim() === '') {
        validationError = 'Invalid or missing name';
      } else if (!email || typeof email !== 'string' || !email.match(/^\S+@\S+\.\S+$/)) {
        validationError = 'Invalid or missing email';
      } else if (!password || typeof password !== 'string' || password.length < 6) {
        validationError = 'Password must be at least 6 characters';
      } else if (!rollNumber || typeof rollNumber !== 'string' || rollNumber.trim() === '') {
        validationError = 'Invalid or missing roll number';
      }

      if (validationError) {
        skippedUsers.push({
          index: i,
          email: email || 'N/A',
          rollNumber: rollNumber || 'N/A',
          reason: validationError
        });
      } else {
        processedUsers.push({
          originalIndex: i,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          rollNumber: rollNumber.trim()
        });
      }
    }

    // Check for duplicates in database
    const existingEmails = await User.find({
      email: { $in: processedUsers.map(u => u.email) }
    }).select('email');

    const existingRollNumbers = await User.find({
      rollNumber: { $in: processedUsers.map(u => u.rollNumber) }
    }).select('rollNumber');

    const existingEmailSet = new Set(existingEmails.map(u => u.email));
    const existingRollSet = new Set(existingRollNumbers.map(u => u.rollNumber));

    const validUsers = [];

    for (const user of processedUsers) {
      let error = null;

      if (existingEmailSet.has(user.email)) {
        error = `User already exists with email: ${user.email}`;
      } else if (existingRollSet.has(user.rollNumber)) {
        error = `User already exists with roll number: ${user.rollNumber}`;
      }

      if (error) {
        skippedUsers.push({
          index: user.originalIndex,
          email: user.email,
          rollNumber: user.rollNumber,
          reason: error
        });
      } else {
        validUsers.push(user);
      }
    }

    // Hash passwords and create users
    for (const user of validUsers) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        const createdUser = await User.create({
          name: user.name,
          email: user.email,
          password: hashedPassword,
          rollNumber: user.rollNumber
        });

        // Create user links
        await UserLinks.create({
          userId: createdUser._id,
          rollNumber: user.rollNumber
        });

        createdUsers.push({
          index: user.originalIndex,
          id: createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
          rollNumber: createdUser.rollNumber
        });

        // Remove from existing sets to prevent duplicates within this batch
        existingEmailSet.add(user.email);
        existingRollSet.add(user.rollNumber);
      } catch (error) {
        skippedUsers.push({
          index: user.originalIndex,
          email: user.email,
          rollNumber: user.rollNumber,
          reason: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Processed ${users.length} users`,
      summary: {
        total: users.length,
        created: createdUsers.length,
        skipped: skippedUsers.length
      },
      data: {
        createdUsers,
        skippedUsers
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user links by user ID
// @route   PUT /api/users/:userId/links
// @access  Public
exports.updateUserLinksById = async (req, res) => {
  try {
    const { leetcode, hackerrank, codeforces, codechef, atcoder, geeksforgeeks, hackerearth } = req.body;
    
    // Validate user ID format
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const userLinks = await UserLinks.findOne({ userId: req.params.userId });
    
    if (!userLinks) {
      return res.status(404).json({
        success: false,
        message: 'User links not found for this user ID'
      });
    }

    // Update links
    if (leetcode !== undefined) userLinks.leetcode = leetcode;
    if (hackerrank !== undefined) userLinks.hackerrank = hackerrank;
    if (codeforces !== undefined) userLinks.codeforces = codeforces;
    if (codechef !== undefined) userLinks.codechef = codechef;
    if (atcoder !== undefined) userLinks.atcoder = atcoder;
    if (geeksforgeeks !== undefined) userLinks.geeksforgeeks = geeksforgeeks;
    if (hackerearth !== undefined) userLinks.hackerearth = hackerearth;

    await userLinks.save();

    res.status(200).json({
      success: true,
      message: 'User links updated successfully',
      data: userLinks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user links by user ID
// @route   GET /api/users/:userId/links
// @access  Public
exports.getUserLinksById = async (req, res) => {
  try {
    // Validate user ID format
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const userLinks = await UserLinks.findOne({ userId: req.params.userId })
      .populate('userId', 'name email rollNumber');
    
    if (!userLinks) {
      return res.status(404).json({
        success: false,
        message: 'User links not found for this user ID'
      });
    }

    res.status(200).json({
      success: true,
      data: userLinks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Bulk update user links
// @route   PUT /api/users/links/bulk/update
// @access  Public
exports.bulkUpdateUserLinks = async (req, res) => {
  try {
    const { updates } = req.body;

    // Validation
    if (!Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of updates'
      });
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array cannot be empty'
      });
    }

    const successfulUpdates = [];
    const failedUpdates = [];

    for (let i = 0; i < updates.length; i++) {
      const update = updates[i];
      const { userId, rollNumber, leetcode, hackerrank, codeforces, codechef, atcoder, geeksforgeeks, hackerearth } = update;

      try {
        // Validation
        if (!userId && !rollNumber) {
          failedUpdates.push({
            index: i,
            identifier: 'N/A',
            reason: 'Either userId or rollNumber must be provided'
          });
          continue;
        }

        // Check if no links are provided to update
        if (!leetcode && !hackerrank && !codeforces && !codechef && !atcoder && !geeksforgeeks && !hackerearth) {
          failedUpdates.push({
            index: i,
            identifier: userId || rollNumber,
            reason: 'No links provided to update'
          });
          continue;
        }

        let userLinks = null;

        // Find user links by ID or roll number
        if (userId) {
          // Validate user ID format
          if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            failedUpdates.push({
              index: i,
              identifier: userId,
              reason: 'Invalid user ID format'
            });
            continue;
          }
          userLinks = await UserLinks.findOne({ userId });
        } else if (rollNumber) {
          userLinks = await UserLinks.findOne({ rollNumber });
        }

        if (!userLinks) {
          failedUpdates.push({
            index: i,
            identifier: userId || rollNumber,
            reason: 'User links not found'
          });
          continue;
        }

        // Update links
        if (leetcode !== undefined) userLinks.leetcode = leetcode;
        if (hackerrank !== undefined) userLinks.hackerrank = hackerrank;
        if (codeforces !== undefined) userLinks.codeforces = codeforces;
        if (codechef !== undefined) userLinks.codechef = codechef;
        if (atcoder !== undefined) userLinks.atcoder = atcoder;
        if (geeksforgeeks !== undefined) userLinks.geeksforgeeks = geeksforgeeks;
        if (hackerearth !== undefined) userLinks.hackerearth = hackerearth;

        await userLinks.save();

        successfulUpdates.push({
          index: i,
          identifier: userId || rollNumber,
          type: userId ? 'userId' : 'rollNumber',
          data: userLinks
        });
      } catch (error) {
        failedUpdates.push({
          index: i,
          identifier: userId || rollNumber || 'N/A',
          reason: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Processed ${updates.length} updates`,
      summary: {
        total: updates.length,
        successful: successfulUpdates.length,
        failed: failedUpdates.length
      },
      data: {
        successfulUpdates,
        failedUpdates
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
