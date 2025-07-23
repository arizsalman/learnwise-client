import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../api/axios";

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        setCourses(res.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        if (err.response?.status === 401) {
          toast.error('Please login to view courses');
          navigate('/login');
        } else {
          setError("Failed to fetch courses. Please try again.");
          toast.error('Failed to load courses');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [navigate]);

  const handleCourseSelect = (course) => {
    try {
      // Navigate to course details page
      navigate(`/course/${course._id}`, { state: { course } });
      toast.success(`Opening ${course.title}`);
    } catch (error) {
      console.error('Error navigating to course:', error);
      toast.error('Failed to open course');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading courses...</span>
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
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-center">All Courses</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courses.map((course) => (
          <div
            key={course._id}
            className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col"
          >
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-40 w-full object-cover"
            />
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-gray-500 mb-2">
                  Category: {course.category}
                </p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-lg font-bold text-blue-600">
                  ${course.price}
                </span>
                <button
                  onClick={() => handleCourseSelect(course)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                >
                  View Course
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList;
