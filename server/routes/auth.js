const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// In-memory user store for demo purposes when MongoDB is not available
const demoUsers = [
  {
    _id: 'demo-student-1',
    firstName: 'Demo',
    lastName: 'Student',
    email: 'student@demo.com',
    password: '$2a$10$0HzbTezma6jRfROlkRumauUBeRtW4/vlzzF8nHbxClf5B6alWZj8W', // password123
    role: 'student',
    studentId: 'STU001',
    institution: 'Demo University',
    isActive: true,
    isVerified: true,
    lastLogin: new Date(),
    createdAt: new Date(),
    profileImage: null
  },
  {
    _id: 'demo-admin-1',
    firstName: 'Demo',
    lastName: 'Admin',
    email: 'admin@demo.com',
    password: '$2a$10$0HzbTezma6jRfROlkRumauUBeRtW4/vlzzF8nHbxClf5B6alWZj8W', // password123
    role: 'admin',
    isActive: true,
    isVerified: true,
    lastLogin: new Date(),
    createdAt: new Date(),
    profileImage: null
  }
];

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Helper function to find demo user by email
const findDemoUser = (email) => {
  return demoUsers.find(user => user.email === email);
};

// Helper function to find demo user by ID
const findDemoUserById = (id) => {
  return demoUsers.find(user => user._id === id);
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'eyeswide-secret', {
    expiresIn: '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, studentId, institution } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    let existingUser;
    let user;

    if (isMongoConnected()) {
      // Use MongoDB
      existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Create new user
      user = new User({
        firstName,
        lastName,
        email,
        password,
        role: role || 'student',
        studentId: role === 'student' ? studentId : undefined,
        institution: role === 'student' ? institution : undefined
      });

      await user.save();
    } else {
      // Use demo users - check if user exists
      existingUser = findDemoUser(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // For demo, we'll just return success but not actually store the user
      // In a real implementation, you'd store in a temporary in-memory store
      const hashedPassword = await bcrypt.hash(password, 10);
      user = {
        _id: `demo-user-${Date.now()}`,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role || 'student',
        studentId: role === 'student' ? studentId : undefined,
        institution: role === 'student' ? institution : undefined,
        isActive: true,
        isVerified: false,
        createdAt: new Date()
      };

      // Add to demo users array for this session
      demoUsers.push(user);
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        institution: user.institution
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    let user;
    let isPasswordValid = false;

    if (isMongoConnected()) {
      // Use MongoDB
      user = await User.findOne({ email }).select('+password');
      if (user) {
        isPasswordValid = await user.comparePassword(password);
      }
    } else {
      // Use demo users
      user = findDemoUser(email);
      if (user) {
        isPasswordValid = await bcrypt.compare(password, user.password);
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Verify password
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login (only for MongoDB)
    if (isMongoConnected() && user.save) {
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        institution: user.institution,
        profileImage: user.profileImage,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    let user;

    if (isMongoConnected()) {
      // Use MongoDB
      user = await User.findById(req.user.userId);
    } else {
      // Use demo users
      user = findDemoUserById(req.user.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        institution: user.institution,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, institution } = req.body;
    let user;

    if (isMongoConnected()) {
      // Use MongoDB
      user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update fields
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (institution && user.role === 'student') user.institution = institution;

      await user.save();
    } else {
      // Use demo users
      user = findDemoUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update fields in memory
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (institution && user.role === 'student') user.institution = institution;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        institution: user.institution,
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    let user;

    if (isMongoConnected()) {
      // Use MongoDB
      user = await User.findById(req.user.userId).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();
    } else {
      // Use demo users
      user = findDemoUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password in memory
      user.password = await bcrypt.hash(newPassword, 10);
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;