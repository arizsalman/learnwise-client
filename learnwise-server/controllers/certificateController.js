const Result = require('../models/Result');
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

// GET /api/certificate/:userId/:courseId
const getCertificate = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get all lessons for this course
    const lessons = await Lesson.find({ courseId });
    if (lessons.length === 0) {
      return res.status(400).json({ message: 'No lessons found for this course' });
    }

    // Get all quiz results for this user in this course
    const lessonIds = lessons.map(lesson => lesson._id);
    const results = await Result.find({
      userId,
      lessonId: { $in: lessonIds }
    }).populate('lessonId');

    if (results.length === 0) {
      return res.status(400).json({ message: 'User has not taken any quizzes for this course' });
    }

    // Calculate overall course score
    // Get the best score for each lesson
    const lessonScores = {};
    
    for (const result of results) {
      const lessonId = result.lessonId._id.toString();
      if (!lessonScores[lessonId] || result.score > lessonScores[lessonId]) {
        lessonScores[lessonId] = result.score;
      }
    }

    // Calculate average score across all lessons
    const scores = Object.values(lessonScores);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // Check if user has passed (score >= 70%)
    const passingScore = 70;
    if (averageScore < passingScore) {
      return res.status(400).json({ 
        message: 'User has not passed this course',
        currentScore: Math.round(averageScore * 100) / 100,
        requiredScore: passingScore,
        lessonsCompleted: scores.length,
        totalLessons: lessons.length
      });
    }

    // User has passed, return certificate data
    const certificateData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      course: {
        id: course._id,
        title: course.title,
        category: course.category
      },
      achievement: {
        score: Math.round(averageScore * 100) / 100,
        completionDate: new Date(),
        lessonsCompleted: scores.length,
        totalLessons: lessons.length,
        certificateId: `CERT-${userId.slice(-6)}-${courseId.slice(-6)}-${Date.now()}`
      },
      lessonScores: lessonScores
    };

    res.json({
      message: 'Certificate data retrieved successfully',
      certificate: certificateData
    });

  } catch (error) {
    console.error('Error getting certificate:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getCertificate
};
