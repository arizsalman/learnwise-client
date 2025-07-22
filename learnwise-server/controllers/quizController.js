const Quiz = require('../models/Quiz');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

// @desc    Create a new quiz question (Admin only)
// @route   POST /api/quiz
// @access  Private (Admin)
const createQuiz = async (req, res) => {
  try {
    const { question, options, correctAnswer, courseId, lessonId } = req.body;

    // Validate required fields
    if (!question || !options || !correctAnswer || !courseId || !lessonId) {
      return res.status(400).json({
        message: 'All fields are required: question, options, correctAnswer, courseId, lessonId'
      });
    }

    // Validate options array
    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({
        message: 'Options must be an array of exactly 4 strings'
      });
    }

    // Validate that all options are non-empty strings
    if (!options.every(option => typeof option === 'string' && option.trim().length > 0)) {
      return res.status(400).json({
        message: 'All options must be non-empty strings'
      });
    }

    // Validate that correctAnswer is one of the options
    if (!options.includes(correctAnswer)) {
      return res.status(400).json({
        message: 'Correct answer must be one of the provided options'
      });
    }

    // Check if course exists
    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({
        message: 'Course not found'
      });
    }

    // Check if lesson exists and belongs to the course
    const lessonExists = await Lesson.findById(lessonId);
    if (!lessonExists) {
      return res.status(404).json({
        message: 'Lesson not found'
      });
    }

    if (lessonExists.courseId.toString() !== courseId) {
      return res.status(400).json({
        message: 'Lesson does not belong to the specified course'
      });
    }

    // Create the quiz
    const quiz = new Quiz({
      question,
      options,
      correctAnswer,
      courseId,
      lessonId
    });

    await quiz.save();

    // Populate the response
    await quiz.populate('courseId lessonId');

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: {
        _id: quiz._id,
        question: quiz.question,
        options: quiz.options,
        courseId: quiz.courseId,
        lessonId: quiz.lessonId,
        createdAt: quiz.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating quiz:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: errors
      });
    }

    res.status(500).json({
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get all quiz questions for a lesson
// @route   GET /api/quiz/:lessonId
// @access  Private
const getQuizzesByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // Validate lessonId format
    if (!lessonId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Invalid lesson ID format'
      });
    }

    // Check if lesson exists
    const lessonExists = await Lesson.findById(lessonId);
    if (!lessonExists) {
      return res.status(404).json({
        message: 'Lesson not found'
      });
    }

    // Get all quizzes for the lesson (without correct answers for security)
    const quizzes = await Quiz.find({ lessonId })
      .populate('courseId', 'title description')
      .populate('lessonId', 'title')
      .select('-correctAnswer') // Exclude correct answer from response
      .sort({ createdAt: 1 });

    res.json({
      message: 'Quizzes retrieved successfully',
      count: quizzes.length,
      quizzes: quizzes
    });

  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Submit quiz answers and get results
// @route   POST /api/quiz/submit
// @access  Private
const submitQuizAnswers = async (req, res) => {
  try {
    const { lessonId, answers } = req.body;

    // Validate required fields
    if (!lessonId || !answers) {
      return res.status(400).json({
        message: 'Lesson ID and answers are required'
      });
    }

    // Validate lessonId format
    if (!lessonId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Invalid lesson ID format'
      });
    }

    // Validate answers format
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: 'Answers must be a non-empty array'
      });
    }

    // Check if lesson exists
    const lessonExists = await Lesson.findById(lessonId);
    if (!lessonExists) {
      return res.status(404).json({
        message: 'Lesson not found'
      });
    }

    // Get all quizzes for the lesson
    const quizzes = await Quiz.find({ lessonId }).sort({ createdAt: 1 });

    if (quizzes.length === 0) {
      return res.status(404).json({
        message: 'No quizzes found for this lesson'
      });
    }

    // Validate that answers array matches quiz count
    if (answers.length !== quizzes.length) {
      return res.status(400).json({
        message: `Expected ${quizzes.length} answers, but received ${answers.length}`
      });
    }

    // Calculate results
    let correctCount = 0;
    const results = [];

    for (let i = 0; i < quizzes.length; i++) {
      const quiz = quizzes[i];
      const userAnswer = answers[i];
      const isCorrect = quiz.isCorrectAnswer(userAnswer);
      
      if (isCorrect) {
        correctCount++;
      }

      results.push({
        questionId: quiz._id,
        question: quiz.question,
        options: quiz.options,
        userAnswer: userAnswer,
        correctAnswer: quiz.correctAnswer,
        isCorrect: isCorrect
      });
    }

    const totalQuestions = quizzes.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 70; // 70% passing grade

    res.json({
      message: 'Quiz submitted successfully',
      results: {
        lessonId: lessonId,
        totalQuestions: totalQuestions,
        correctAnswers: correctCount,
        score: score,
        passed: passed,
        details: results
      }
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get quiz by ID (Admin only - includes correct answer)
// @route   GET /api/quiz/admin/:id
// @access  Private (Admin)
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Invalid quiz ID format'
      });
    }

    const quiz = await Quiz.findById(id)
      .populate('courseId', 'title description')
      .populate('lessonId', 'title');

    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

    res.json({
      message: 'Quiz retrieved successfully',
      quiz: quiz
    });

  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Update quiz (Admin only)
// @route   PUT /api/quiz/:id
// @access  Private (Admin)
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, correctAnswer } = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Invalid quiz ID format'
      });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

    // Update fields if provided
    if (question) quiz.question = question;
    if (options) {
      if (!Array.isArray(options) || options.length !== 4) {
        return res.status(400).json({
          message: 'Options must be an array of exactly 4 strings'
        });
      }
      quiz.options = options;
    }
    if (correctAnswer) {
      if (!quiz.options.includes(correctAnswer)) {
        return res.status(400).json({
          message: 'Correct answer must be one of the provided options'
        });
      }
      quiz.correctAnswer = correctAnswer;
    }

    await quiz.save();

    res.json({
      message: 'Quiz updated successfully',
      quiz: quiz
    });

  } catch (error) {
    console.error('Error updating quiz:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: errors
      });
    }

    res.status(500).json({
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Delete quiz (Admin only)
// @route   DELETE /api/quiz/:id
// @access  Private (Admin)
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: 'Invalid quiz ID format'
      });
    }

    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }

    res.json({
      message: 'Quiz deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get user's quiz results
// @route   GET /api/quiz/results/user
// @access  Private
const getUserResults = async (req, res) => {
  try {
    const userId = req.user.id;
    const Result = require('../models/Result');

    // Get all results for the user
    const results = await Result.find({ userId })
      .populate({
        path: 'lessonId',
        select: 'title courseId',
        populate: {
          path: 'courseId',
          select: 'title description'
        }
      })
      .sort({ createdAt: -1 });

    // Group results by course
    const resultsByCourse = {};
    
    results.forEach(result => {
      if (result.lessonId && result.lessonId.courseId) {
        const courseId = result.lessonId.courseId._id.toString();
        const courseName = result.lessonId.courseId.title;
        
        if (!resultsByCourse[courseId]) {
          resultsByCourse[courseId] = {
            courseId: courseId,
            courseName: courseName,
            lessons: {}
          };
        }
        
        const lessonId = result.lessonId._id.toString();
        const lessonName = result.lessonId.title;
        
        if (!resultsByCourse[courseId].lessons[lessonId]) {
          resultsByCourse[courseId].lessons[lessonId] = {
            lessonId: lessonId,
            lessonName: lessonName,
            attempts: []
          };
        }
        
        resultsByCourse[courseId].lessons[lessonId].attempts.push({
          _id: result._id,
          score: result.score,
          passed: result.passed,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          createdAt: result.createdAt
        });
      }
    });

    // Calculate statistics
    const stats = {
      totalQuizzesTaken: results.length,
      averageScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0,
      quizzesPassed: results.filter(r => r.passed).length,
      coursesStarted: Object.keys(resultsByCourse).length
    };

    res.json({
      message: 'User results retrieved successfully',
      stats: stats,
      resultsByCourse: resultsByCourse,
      recentResults: results.slice(0, 5) // Last 5 attempts
    });

  } catch (error) {
    console.error('Error fetching user results:', error);
    res.status(500).json({
      message: 'Server error: ' + error.message
    });
  }
};

module.exports = {
  createQuiz,
  getQuizzesByLesson,
  submitQuizAnswers,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getUserResults
};
