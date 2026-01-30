// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // TODO: Add validation
    // TODO: Check if user exists
    // TODO: Hash password
    // TODO: Create user in database

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // TODO: Add validation
    // TODO: Check if user exists
    // TODO: Verify password
    // TODO: Generate JWT token

    res.status(200).json({
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
