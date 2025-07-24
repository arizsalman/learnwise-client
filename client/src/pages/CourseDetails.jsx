import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const CourseDetails = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [course, setCourse] = useState(location.state?.course || null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(!course);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        // Fetch course details if not passed via state
        if (!course) {
          const courseResponse = await api.get(`/courses/${courseId}`);
          setCourse(courseResponse.data);
        }

        // Fetch lessons for this course
        const lessonsResponse = await api.get(`/lessons/course/${courseId}`);
        // Ensure lessons is always an array
        const lessonsData = Array.isArray(lessonsResponse.data) ? lessonsResponse.data : [];
        setLessons(lessonsData);
      } catch (err) {
        console.error('Error fetching course data:', err);
        if (err.response?.status === 401) {
          toast.error('Please login to view course details');
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError('Course not found');
          toast.error('Course not found');
        } else {
          setError('Failed to load course details');
          toast.error('Failed to load course details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, course, navigate]);

  const handleLessonClick = (lesson) => {
    // Navigate to lesson details or quiz
    navigate(`/lesson/${lesson._id}`, { state: { lesson, course } });
    toast.success(`Opening ${lesson.title}`);
  };

  const handleStartQuiz = (lessonId) => {
    navigate(`/quiz/${lessonId}`, { state: { course } });
    toast.success('Starting quiz...');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading course details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate('/courses')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-4">Course not found</div>
          <button
            onClick={() => navigate('/courses')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-64 object-cover"
          />
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-gray-600 mb-2">Category: {course.category}</p>
                <p className="text-2xl font-bold text-blue-600">${course.price}</p>
              </div>
              <button
                onClick={() => navigate('/courses')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Back to Courses
              </button>
            </div>
            {course.description && (
              <p className="text-gray-700 leading-relaxed">{course.description}</p>
            )}
          </div>
        </div>

        {/* Lessons Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Course Lessons</h2>
          </div>
          <div className="p-6">
            {!Array.isArray(lessons) || lessons.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No lessons available yet</p>
                <p className="text-sm text-gray-500">Lessons will be added soon</p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <div key={lesson._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Lesson {index + 1}: {lesson.title}
                        </h3>
                        <div className="flex space-x-4 text-sm text-gray-600">
                          {lesson.videoUrl && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m2-7a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Video
                            </span>
                          )}
                          {lesson.pdfUrl && (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              PDF
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleLessonClick(lesson)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          View Lesson
                        </button>
                        <button
                          onClick={() => handleStartQuiz(lesson._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          Take Quiz
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
