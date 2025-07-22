const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson
} = require('../controllers/lessonController');
const auth = require('../middleware/auth');

// Configure multer for handling multipart/form-data
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed for video field'), false);
      }
    } else if (file.fieldname === 'pdf') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for pdf field'), false);
      }
    } else {
      cb(new Error('Unexpected field'), false);
    }
  }
});

// @route   POST /api/lessons
// @desc    Create a new lesson with file uploads
// @access  Private
router.post('/', auth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), createLesson);

// @route   GET /api/lessons/course/:courseId
// @desc    Get all lessons for a specific course
// @access  Private
router.get('/course/:courseId', auth, getLessonsByCourse);

// @route   GET /api/lessons/:id
// @desc    Get a single lesson by ID
// @access  Private
router.get('/:id', auth, getLessonById);

// @route   PUT /api/lessons/:id
// @desc    Update a lesson
// @access  Private
router.put('/:id', auth, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'pdf', maxCount: 1 }
]), updateLesson);

// @route   DELETE /api/lessons/:id
// @desc    Delete a lesson
// @access  Private
router.delete('/:id', auth, deleteLesson);

module.exports = router;