const Lesson = require('../models/Lesson');
const { cloudinary } = require('../middleware/upload');
const streamifier = require('streamifier');

// Helper function to upload file to Cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Create a new lesson with file uploads
const createLesson = async (req, res) => {
  try {
    const { title, courseId } = req.body;
    
    if (!title || !courseId) {
      return res.status(400).json({ 
        message: 'Title and courseId are required' 
      });
    }

    let videoUrl = null;
    let pdfUrl = null;

    // Upload video if provided
    if (req.files && req.files.video) {
      const videoFile = req.files.video[0];
      try {
        const videoResult = await uploadToCloudinary(videoFile.buffer, {
          folder: 'learnwise/videos',
          resource_type: 'video',
          allowed_formats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']
        });
        videoUrl = videoResult.secure_url;
      } catch (error) {
        return res.status(400).json({ 
          message: 'Error uploading video: ' + error.message 
        });
      }
    }

    // Upload PDF if provided
    if (req.files && req.files.pdf) {
      const pdfFile = req.files.pdf[0];
      try {
        const pdfResult = await uploadToCloudinary(pdfFile.buffer, {
          folder: 'learnwise/pdfs',
          resource_type: 'raw',
          allowed_formats: ['pdf']
        });
        pdfUrl = pdfResult.secure_url;
      } catch (error) {
        return res.status(400).json({ 
          message: 'Error uploading PDF: ' + error.message 
        });
      }
    }

    // Create lesson in database
    const lesson = new Lesson({
      title,
      courseId,
      videoUrl,
      pdfUrl
    });

    await lesson.save();

    res.status(201).json({
      message: 'Lesson created successfully',
      lesson: lesson
    });

  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ 
      message: 'Server error: ' + error.message 
    });
  }
};

// Get all lessons for a course
const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const lessons = await Lesson.find({ courseId })
      .populate('courseId', 'title description')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Lessons retrieved successfully',
      lessons: lessons
    });

  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ 
      message: 'Server error: ' + error.message 
    });
  }
};

// Get a single lesson by ID
const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lesson = await Lesson.findById(id)
      .populate('courseId', 'title description');

    if (!lesson) {
      return res.status(404).json({ 
        message: 'Lesson not found' 
      });
    }

    res.json({
      message: 'Lesson retrieved successfully',
      lesson: lesson
    });

  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ 
      message: 'Server error: ' + error.message 
    });
  }
};

// Update a lesson
const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ 
        message: 'Lesson not found' 
      });
    }

    // Update title if provided
    if (title) {
      lesson.title = title;
    }

    // Update video if new one is uploaded
    if (req.files && req.files.video) {
      const videoFile = req.files.video[0];
      try {
        const videoResult = await uploadToCloudinary(videoFile.buffer, {
          folder: 'learnwise/videos',
          resource_type: 'video'
        });
        lesson.videoUrl = videoResult.secure_url;
      } catch (error) {
        return res.status(400).json({ 
          message: 'Error uploading video: ' + error.message 
        });
      }
    }

    // Update PDF if new one is uploaded
    if (req.files && req.files.pdf) {
      const pdfFile = req.files.pdf[0];
      try {
        const pdfResult = await uploadToCloudinary(pdfFile.buffer, {
          folder: 'learnwise/pdfs',
          resource_type: 'raw'
        });
        lesson.pdfUrl = pdfResult.secure_url;
      } catch (error) {
        return res.status(400).json({ 
          message: 'Error uploading PDF: ' + error.message 
        });
      }
    }

    await lesson.save();

    res.json({
      message: 'Lesson updated successfully',
      lesson: lesson
    });

  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ 
      message: 'Server error: ' + error.message 
    });
  }
};

// Delete a lesson
const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByIdAndDelete(id);
    if (!lesson) {
      return res.status(404).json({ 
        message: 'Lesson not found' 
      });
    }

    res.json({
      message: 'Lesson deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ 
      message: 'Server error: ' + error.message 
    });
  }
};

module.exports = {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson
};
