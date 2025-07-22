const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Lesson ID is required']
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz ID is required']
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  answers: {
    type: [{
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
      },
      userAnswer: {
        type: String,
        required: true
      },
      correctAnswer: {
        type: String,
        required: true
      },
      isCorrect: {
        type: Boolean,
        required: true
      }
    }],
    required: [true, 'Answers are required'],
    validate: {
      validator: function(answers) {
        return answers.length > 0;
      },
      message: 'At least one answer is required'
    }
  },
  totalQuestions: {
    type: Number,
    required: [true, 'Total questions count is required'],
    min: [1, 'Total questions must be at least 1']
  },
  correctAnswers: {
    type: Number,
    required: [true, 'Correct answers count is required'],
    min: [0, 'Correct answers cannot be negative']
  },
  passed: {
    type: Boolean,
    required: [true, 'Pass status is required']
  },
  timeTaken: {
    type: Number, // in seconds
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update the updatedAt field
resultSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Validate that correctAnswers doesn't exceed totalQuestions
resultSchema.pre('save', function(next) {
  if (this.correctAnswers > this.totalQuestions) {
    const error = new Error('Correct answers cannot exceed total questions');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

// Instance method to calculate percentage
resultSchema.methods.getPercentage = function() {
  return Math.round((this.correctAnswers / this.totalQuestions) * 100);
};

// Static method to find results by user
resultSchema.statics.findByUser = function(userId) {
  return this.find({ userId })
    .populate('lessonId', 'title')
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to find results by lesson
resultSchema.statics.findByLesson = function(lessonId) {
  return this.find({ lessonId })
    .populate('userId', 'name email')
    .populate('lessonId', 'title')
    .sort({ createdAt: -1 });
};

// Static method to get user's best score for a lesson
resultSchema.statics.getBestScore = function(userId, lessonId) {
  return this.findOne({ userId, lessonId })
    .sort({ score: -1 })
    .populate('lessonId', 'title');
};

// Static method to get user's latest attempt for a lesson
resultSchema.statics.getLatestAttempt = function(userId, lessonId) {
  return this.findOne({ userId, lessonId })
    .sort({ createdAt: -1 })
    .populate('lessonId', 'title');
};

// Index for better query performance
resultSchema.index({ userId: 1, lessonId: 1 });
resultSchema.index({ lessonId: 1, score: -1 });
resultSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Result', resultSchema);
