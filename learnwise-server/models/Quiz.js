const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    minlength: [5, 'Question must be at least 5 characters long']
  },
  options: {
    type: [String],
    required: [true, 'Options are required'],
    validate: [
      {
        validator: function(options) {
          return options.length === 4;
        },
        message: 'Exactly 4 options are required'
      },
      {
        validator: function(options) {
          // Check that all options are non-empty strings
          return options.every(option => 
            typeof option === 'string' && option.trim().length > 0
          );
        },
        message: 'All options must be non-empty strings'
      },
      {
        validator: function(options) {
          // Check for duplicate options
          const uniqueOptions = [...new Set(options.map(opt => opt.trim().toLowerCase()))];
          return uniqueOptions.length === options.length;
        },
        message: 'All options must be unique'
      }
    ]
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    validate: {
      validator: function(correctAnswer) {
        // Check if correctAnswer is one of the options
        return this.options && this.options.includes(correctAnswer);
      },
      message: 'Correct answer must be one of the provided options'
    }
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Lesson ID is required']
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
quizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to validate correctAnswer against options
quizSchema.pre('save', function(next) {
  if (this.options && this.correctAnswer) {
    if (!this.options.includes(this.correctAnswer)) {
      const error = new Error('Correct answer must be one of the provided options');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

// Instance method to check if an answer is correct
quizSchema.methods.isCorrectAnswer = function(answer) {
  return this.correctAnswer === answer;
};

// Static method to find quizzes by course
quizSchema.statics.findByCourse = function(courseId) {
  return this.find({ courseId }).populate('courseId lessonId');
};

// Static method to find quizzes by lesson
quizSchema.statics.findByLesson = function(lessonId) {
  return this.find({ lessonId }).populate('courseId lessonId');
};

// Index for better query performance
quizSchema.index({ courseId: 1, lessonId: 1 });
quizSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);
