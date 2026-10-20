const express = require('express');
const User = require('../models/User');
const Exam = require('../models/Exam');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin/Institution only)
router.get('/dashboard', [
  auth,
  authorize('admin', 'institution')
], async (req, res) => {
  try {
    // Get basic statistics
    const totalExams = await Exam.countDocuments({ createdBy: req.user.userId });
    const activeExams = await Exam.countDocuments({ 
      createdBy: req.user.userId, 
      status: 'active' 
    });
    
    const totalStudents = await User.countDocuments({ role: 'student' });
    
    // Get recent exams
    const recentExams = await Exam.find({ createdBy: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('enrolledStudents.studentId', 'firstName lastName');

    // TODO: Calculate violations today (will be implemented with real violation tracking)
    const violationsToday = 8; // Mock data

    res.json({
      success: true,
      data: {
        stats: {
          totalExams,
          activeExams,
          totalStudents,
          violationsToday
        },
        recentExams
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/students
// @desc    Get all students
// @access  Private (Admin/Institution only)
router.get('/students', [
  auth,
  authorize('admin', 'institution')
], async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      students
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/admin/violations
// @desc    Get violation reports
// @access  Private (Admin/Institution only)
router.get('/violations', [
  auth,
  authorize('admin', 'institution')
], async (req, res) => {
  try {
    // TODO: Implement real violation tracking
    // For now, return mock data
    const violations = [
      {
        id: 1,
        studentName: 'John Doe',
        examTitle: 'Mathematics Test',
        violationType: 'face-not-detected',
        severity: 'medium',
        timestamp: new Date(),
        description: 'Face not detected for 5 seconds'
      },
      {
        id: 2,
        studentName: 'Jane Smith',
        examTitle: 'Physics Quiz',
        violationType: 'tab-switch',
        severity: 'high',
        timestamp: new Date(),
        description: 'Switched to another tab'
      }
    ];

    res.json({
      success: true,
      violations
    });

  } catch (error) {
    console.error('Get violations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;