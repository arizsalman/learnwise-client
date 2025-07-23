import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import api from '../api/axios';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [userResults, setUserResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [resultsByCourse, setResultsByCourse] = useState({});
  const [recentResults, setRecentResults] = useState([]);
  const [downloadingCertificate, setDownloadingCertificate] = useState(null);

  useEffect(() => {
    fetchUserResults();
  }, []);

  const fetchUserResults = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to view dashboard');
        return;
      }

      const response = await api.get('/quiz/results/user');
      const data = response.data;

      if (data) {
        setStats(data.stats || {
          totalQuizzesTaken: 0,
          quizzesPassed: 0,
          averageScore: 0,
          coursesStarted: 0
        });
        setResultsByCourse(data.resultsByCourse || {});
        setRecentResults(data.recentResults || []);
      }
    } catch (error) {
      console.error('Error fetching user results:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to view dashboard');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else if (error.response?.status === 404) {
        toast.error('No quiz data found. Take some quizzes to see your progress!');
        // Set empty data for new users
        setStats({
          totalQuizzesTaken: 0,
          quizzesPassed: 0,
          averageScore: 0,
          coursesStarted: 0
        });
        setResultsByCourse({});
        setRecentResults([]);
      } else {
        toast.error('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-blue-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Check if user has passed a course (all quizzes passed with >= 70% score)
  const hasPassedCourse = (course) => {
    if (!course || !course.lessons) return false;
    
    const lessons = Object.values(course.lessons);
    if (lessons.length === 0) return false;
    
    // Check if user has passed at least one quiz in each lesson
    return lessons.every(lesson => {
      return lesson.attempts.some(attempt => attempt.passed && attempt.score >= 70);
    });
  };

  // Download certificate for a course
  const downloadCertificate = async (courseId, courseName) => {
    try {
      setDownloadingCertificate(courseId);
      const token = localStorage.getItem('token');
      const userId = JSON.parse(localStorage.getItem('user'))?.id;
      
      if (!token || !userId) {
        toast.error('Please login to download certificate');
        return;
      }

      // Call the certificate API to verify eligibility
      const response = await api.get(`/certificate/${userId}/${courseId}`);
      const data = response.data;

      if (data && data.eligible) {
        // Generate PDF certificate
        generateCertificatePDF(data.user.name, courseName, data.completionDate, data.overallScore);
        toast.success('Certificate downloaded successfully!');
      } else {
        toast.error(data?.message || 'You are not eligible for this certificate');
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      if (error.response?.status === 401) {
        toast.error('Please login to download certificate');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else if (error.response?.status === 403) {
        toast.error('You are not eligible for this certificate. Complete all course quizzes with 70% or higher.');
      } else if (error.response?.status === 404) {
        toast.error('Course or user not found.');
      } else {
        toast.error('Failed to download certificate. Please try again.');
      }
    } finally {
      setDownloadingCertificate(null);
    }
  };

  // Generate PDF certificate using jsPDF
  const generateCertificatePDF = (userName, courseName, completionDate, score) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Set background color
    doc.setFillColor(248, 250, 252); // Light gray background
    doc.rect(0, 0, 297, 210, 'F');

    // Add border
    doc.setDrawColor(59, 130, 246); // Blue border
    doc.setLineWidth(3);
    doc.rect(10, 10, 277, 190);

    // Add inner border
    doc.setDrawColor(147, 197, 253); // Light blue border
    doc.setLineWidth(1);
    doc.rect(15, 15, 267, 180);

    // Title
    doc.setFontSize(36);
    doc.setTextColor(30, 58, 138); // Dark blue
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF COMPLETION', 148.5, 50, { align: 'center' });

    // Subtitle
    doc.setFontSize(16);
    doc.setTextColor(75, 85, 99); // Gray
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', 148.5, 70, { align: 'center' });

    // User name
    doc.setFontSize(28);
    doc.setTextColor(17, 24, 39); // Dark gray
    doc.setFont('helvetica', 'bold');
    doc.text(userName, 148.5, 90, { align: 'center' });

    // Course completion text
    doc.setFontSize(16);
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed the course', 148.5, 110, { align: 'center' });

    // Course name
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246); // Blue
    doc.setFont('helvetica', 'bold');
    doc.text(courseName, 148.5, 130, { align: 'center' });

    // Score and date
    doc.setFontSize(14);
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    doc.text(`Final Score: ${score}%`, 148.5, 150, { align: 'center' });
    doc.text(`Date of Completion: ${new Date(completionDate).toLocaleDateString()}`, 148.5, 165, { align: 'center' });

    // LearnWise branding
    doc.setFontSize(18);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('LearnWise Platform', 50, 185);

    // Current date
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 200, 185);

    // Save the PDF
    doc.save(`${courseName.replace(/[^a-z0-9]/gi, '_')}_Certificate.pdf`);
  };

  // Prepare data for score distribution pie chart
  const getScoreDistributionData = () => {
    if (!recentResults || recentResults.length === 0) return null;

    const scoreRanges = {
      'Excellent (90-100%)': 0,
      'Good (70-89%)': 0,
      'Average (50-69%)': 0,
      'Below Average (<50%)': 0
    };

    recentResults.forEach(result => {
      if (result.score >= 90) scoreRanges['Excellent (90-100%)']++;
      else if (result.score >= 70) scoreRanges['Good (70-89%)']++;
      else if (result.score >= 50) scoreRanges['Average (50-69%)']++;
      else scoreRanges['Below Average (<50%)']++;
    });

    return {
      labels: Object.keys(scoreRanges),
      datasets: [
        {
          data: Object.values(scoreRanges),
          backgroundColor: [
            '#10B981', // Green for Excellent
            '#3B82F6', // Blue for Good
            '#F59E0B', // Yellow for Average
            '#EF4444'  // Red for Below Average
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };
  };

  // Prepare data for course progress bar chart
  const getCourseProgressData = () => {
    if (!resultsByCourse || Object.keys(resultsByCourse).length === 0) return null;

    const courseNames = [];
    const passedQuizzes = [];
    const totalQuizzes = [];
    const averageScores = [];

    Object.values(resultsByCourse).forEach(course => {
      courseNames.push(course.courseName);
      
      let totalQuizzesCount = 0;
      let passedCount = 0;
      let totalScore = 0;
      let scoreCount = 0;

      Object.values(course.lessons).forEach(lesson => {
        lesson.attempts.forEach(attempt => {
          totalQuizzesCount++;
          totalScore += attempt.score;
          scoreCount++;
          if (attempt.passed) passedCount++;
        });
      });

      totalQuizzes.push(totalQuizzesCount);
      passedQuizzes.push(passedCount);
      averageScores.push(scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0);
    });

    return {
      labels: courseNames,
      datasets: [
        {
          label: 'Quizzes Passed',
          data: passedQuizzes,
          backgroundColor: '#10B981',
          borderColor: '#059669',
          borderWidth: 1
        },
        {
          label: 'Total Quizzes',
          data: totalQuizzes,
          backgroundColor: '#E5E7EB',
          borderColor: '#9CA3AF',
          borderWidth: 1
        }
      ]
    };
  };

  // Chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true
        }
      },
      title: {
        display: true,
        text: 'Score Distribution',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Course Progress Overview',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your learning progress and quiz results</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalQuizzesTaken}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Quizzes Passed</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.quizzesPassed}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.averageScore}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Courses Started</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.coursesStarted}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Score Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Score Distribution</h2>
            </div>
            <div className="p-6">
              {getScoreDistributionData() ? (
                <div className="h-80">
                  <Pie data={getScoreDistributionData()} options={pieChartOptions} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No quiz data available</p>
                  <p className="text-sm text-gray-500">Take some quizzes to see your score distribution</p>
                </div>
              )}
            </div>
          </div>

          {/* Course Progress Bar Chart */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Course Progress</h2>
            </div>
            <div className="p-6">
              {getCourseProgressData() ? (
                <div className="h-80">
                  <Bar data={getCourseProgressData()} options={barChartOptions} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No course data available</p>
                  <p className="text-sm text-gray-500">Start taking courses to see your progress</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quiz Results by Course */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quiz Results by Course</h2>
              </div>
              <div className="p-6">
                {Object.keys(resultsByCourse).length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No quiz results yet</p>
                    <p className="text-sm text-gray-500">Start taking quizzes to see your progress here</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.values(resultsByCourse).map((course) => (
                      <div key={course.courseId} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-medium text-gray-900">{course.courseName}</h3>
                          {hasPassedCourse(course) && (
                            <button
                              onClick={() => downloadCertificate(course.courseId, course.courseName)}
                              disabled={downloadingCertificate === course.courseId}
                              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                            >
                              {downloadingCertificate === course.courseId ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Download Certificate
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          {Object.values(course.lessons).map((lesson) => (
                            <div key={lesson.lessonId} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-gray-800">{lesson.lessonName}</h4>
                                <span className="text-sm text-gray-500">{lesson.attempts.length} attempt(s)</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {lesson.attempts.map((attempt, index) => (
                                  <div key={attempt._id} className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(attempt.score)} ${getScoreColor(attempt.score)}`}>
                                    {attempt.score}% {attempt.passed ? '✓' : '✗'}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Quiz Attempts */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Quiz Attempts</h2>
              </div>
              <div className="p-6">
                {recentResults.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No recent attempts</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentResults.map((result) => (
                      <div key={result._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {result.lessonId?.title || 'Unknown Lesson'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(result.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreBgColor(result.score)} ${getScoreColor(result.score)}`}>
                            {result.score}%
                          </span>
                          <span className={`text-sm ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {result.passed ? '✓' : '✗'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
