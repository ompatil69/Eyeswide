const express = require('express');
const { body, validationResult } = require('express-validator');
const Exam = require('../models/Exam');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/exams
// @desc    Get all exams for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { role } = req.userDoc;
    let exams;

    if (role === 'student') {
      // Show ALL scheduled/active exams to students (auto-enroll on view)
      exams = await Exam.find({
        status: { $in: ['scheduled', 'active'] }
      })
      .populate('createdBy', 'firstName lastName')
      .sort({ scheduledDate: 1 });

      // Auto-enroll student in any exam they can see but aren't enrolled in
      for (const exam of exams) {
        const alreadyEnrolled = exam.enrolledStudents.some(
          e => e.studentId && e.studentId.toString() === req.user.userId
        );
        if (!alreadyEnrolled) {
          exam.enrolledStudents.push({
            studentId: req.user.userId,
            enrolledAt: new Date(),
            status: 'enrolled'
          });
          await exam.save();
        }
      }
    } else {
      // Get exams created by admin/institution
      exams = await Exam.find({ createdBy: req.user.userId })
        .populate('createdBy', 'firstName lastName')
        .populate('enrolledStudents.studentId', 'firstName lastName email')
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      exams
    });

  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/exams/:id
// @desc    Get single exam
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('enrolledStudents.studentId', 'firstName lastName email');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if user has access to this exam
    const { role } = req.userDoc;
    const isCreator = exam.createdBy._id.toString() === req.user.userId;
    const isEnrolled = exam.enrolledStudents.some(
      student => student.studentId && student.studentId._id && 
      student.studentId._id.toString() === req.user.userId
    );

    if (role === 'student' && !isEnrolled) {
      // Auto-enroll and allow access
      exam.enrolledStudents.push({
        studentId: req.user.userId,
        enrolledAt: new Date(),
        status: 'enrolled'
      });
      await exam.save();
    }

    if ((role === 'admin' || role === 'institution') && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      exam
    });

  } catch (error) {
    console.error('Get exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/exams
// @desc    Create new exam
// @access  Private (Admin/Institution only)
router.post('/', [
  auth,
  authorize('admin', 'institution'),
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim(),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('totalMarks').isInt({ min: 1 }).withMessage('Total marks must be at least 1'),
  body('passingMarks').isInt({ min: 0 }).withMessage('Passing marks must be valid'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      subject,
      duration,
      totalMarks,
      passingMarks,
      scheduledDate,
      startTime,
      endTime,
      questions,
      proctorSettings
    } = req.body;

    // Validate passing marks
    if (passingMarks > totalMarks) {
      return res.status(400).json({
        success: false,
        message: 'Passing marks cannot exceed total marks'
      });
    }

    // Validate time range
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const exam = new Exam({
      title,
      description,
      createdBy: req.user.userId,
      institution: req.userDoc.institution || 'Default Institution',
      subject,
      duration,
      totalMarks,
      passingMarks,
      scheduledDate,
      startTime,
      endTime,
      questions: questions || [],
      proctorSettings: {
        faceDetection: true,
        gazeTracking: true,
        tabSwitchDetection: true,
        audioMonitoring: true,
        screenRecording: false,
        allowedViolations: 3,
        strictMode: false,
        ...proctorSettings
      }
    });

    await exam.save();

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      exam
    });

  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/exams/:id
// @desc    Update exam
// @access  Private (Admin/Institution only)
router.put('/:id', [
  auth,
  authorize('admin', 'institution')
], async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if user is the creator
    if (exam.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Don't allow updates if exam is active or completed
    if (exam.status === 'active' || exam.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update active or completed exam'
      });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Exam updated successfully',
      exam: updatedExam
    });

  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/exams/:id
// @desc    Delete exam
// @access  Private (Admin/Institution only)
router.delete('/:id', [
  auth,
  authorize('admin', 'institution')
], async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check if user is the creator
    if (exam.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Don't allow deletion if exam is active
    if (exam.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete active exam'
      });
    }

    await Exam.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Exam deleted successfully'
    });

  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;