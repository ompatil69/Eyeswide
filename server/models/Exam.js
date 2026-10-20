const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
    required: true
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: String,
  points: {
    type: Number,
    default: 1
  },
  timeLimit: Number, // in seconds
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String
  }]
});

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Exam title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  institution: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Exam duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  totalMarks: {
    type: Number,
    required: true,
    min: [1, 'Total marks must be at least 1']
  },
  passingMarks: {
    type: Number,
    required: true
  },
  questions: [questionSchema],
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  
  // Proctoring settings
  proctorSettings: {
    faceDetection: {
      type: Boolean,
      default: true
    },
    gazeTracking: {
      type: Boolean,
      default: true
    },
    tabSwitchDetection: {
      type: Boolean,
      default: true
    },
    audioMonitoring: {
      type: Boolean,
      default: true
    },
    screenRecording: {
      type: Boolean,
      default: false
    },
    allowedViolations: {
      type: Number,
      default: 3
    },
    strictMode: {
      type: Boolean,
      default: false
    }
  },
  
  // Access control
  enrolledStudents: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enrolled', 'started', 'completed', 'disqualified'],
      default: 'enrolled'
    }
  }],
  
  // Exam status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Results
  results: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answers: [{
      questionId: mongoose.Schema.Types.ObjectId,
      answer: mongoose.Schema.Types.Mixed,
      timeSpent: Number, // in seconds
      isCorrect: Boolean,
      points: Number
    }],
    totalScore: Number,
    percentage: Number,
    startedAt: Date,
    completedAt: Date,
    violations: [{
      type: {
        type: String,
        enum: ['face-not-detected', 'multiple-faces', 'tab-switch', 'audio-anomaly', 'gaze-deviation', 'object-detected']
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      timestamp: Date,
      description: String,
      confidence: Number
    }],
    proctorNotes: String,
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'disqualified', 'under-review'],
      default: 'in-progress'
    }
  }],
  
  // Analytics
  analytics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    violationStats: {
      faceDetection: { type: Number, default: 0 },
      tabSwitch: { type: Number, default: 0 },
      audioAnomaly: { type: Number, default: 0 },
      gazeDeviation: { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
examSchema.index({ createdBy: 1 });
examSchema.index({ institution: 1 });
examSchema.index({ status: 1 });
examSchema.index({ scheduledDate: 1 });
examSchema.index({ 'enrolledStudents.studentId': 1 });

// Virtual for exam duration in hours
examSchema.virtual('durationInHours').get(function() {
  return Math.round((this.duration / 60) * 100) / 100;
});

// Check if exam is currently active
examSchema.virtual('isActive').get(function() {
  const now = new Date();
  return now >= this.startTime && now <= this.endTime && this.status === 'active';
});

// Get exam statistics
examSchema.methods.getStatistics = function() {
  const totalStudents = this.enrolledStudents.length;
  const completedStudents = this.results.filter(r => r.status === 'completed').length;
  const averageScore = this.results.length > 0 
    ? this.results.reduce((sum, r) => sum + r.totalScore, 0) / this.results.length 
    : 0;
  
  return {
    totalStudents,
    completedStudents,
    completionRate: totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0,
    averageScore: Math.round(averageScore * 100) / 100
  };
};

module.exports = mongoose.model('Exam', examSchema);