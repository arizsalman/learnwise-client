const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getQuizzesByLesson,
  submitQuizAnswers,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getUserResults
} = require('../controllers/quizController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   POST /api/quiz
// @desc    Create a quiz question (Admin only)
// @access  Private (Admin)
router.post('/', admin, createQuiz);

// @route   GET /api/quiz/:lessonId
// @desc    Get all quiz questions for a lesson
// @access  Private
router.get('/:lessonId', auth, getQuizzesByLesson);

// @route   POST /api/quiz/submit
// @desc    Submit user answers and return result
// @access  Private
router.post('/submit', auth, submitQuizAnswers);

// @route   GET /api/quiz/admin/:id
// @desc    Get quiz by ID (Admin only - includes correct answer)
// @access  Private (Admin)
router.get('/admin/:id', admin, getQuizById);

// @route   PUT /api/quiz/:id
// @desc    Update quiz (Admin only)
// @access  Private (Admin)
router.put('/:id', admin, updateQuiz);

// @route   DELETE /api/quiz/:id
// @desc    Delete quiz (Admin only)
// @access  Private (Admin)
router.delete('/:id', admin, deleteQuiz);

// @route   GET /api/quiz/results/user
// @desc    Get user's quiz results
// @access  Private
router.get('/results/user', auth, getUserResults);

module.exports = router;
