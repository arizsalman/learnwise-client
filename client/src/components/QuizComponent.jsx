import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const QuizComponent = ({ lessonId, onQuizComplete }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    if (lessonId) {
      fetchQuizzes();
    }
  }, [lessonId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to access quizzes');
        return;
      }

      const response = await fetch(`/api/quiz/${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setQuizzes(data.quizzes);
        // Initialize answers object
        const initialAnswers = {};
        data.quizzes.forEach((quiz, index) => {
          initialAnswers[index] = '';
        });
        setAnswers(initialAnswers);
      } else {
        toast.error(data.message || 'Failed to fetch quizzes');
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, selectedAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedAnswer
    }));
  };

  const handleSubmit = async () => {
    // Validate all questions are answered
    const unansweredQuestions = [];
    quizzes.forEach((quiz, index) => {
      if (!answers[index] || answers[index].trim() === '') {
        unansweredQuestions.push(index + 1);
      }
    });

    if (unansweredQuestions.length > 0) {
      toast.error(`Please answer all questions. Missing: ${unansweredQuestions.join(', ')}`);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to submit quiz');
        return;
      }

      // Convert answers object to array
      const answersArray = quizzes.map((quiz, index) => answers[index]);

      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lessonId: lessonId,
          answers: answersArray
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
        setShowResults(true);
        
        // Show success toast
        const { score, passed } = data.results;
        if (passed) {
          toast.success(`Congratulations! You scored ${score}% and passed the quiz!`);
        } else {
          toast.error(`You scored ${score}%. You need 70% to pass. Try again!`);
        }

        // Callback to parent component
        if (onQuizComplete) {
          onQuizComplete(data.results);
        }
      } else {
        toast.error(data.message || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setShowResults(false);
    setResults(null);
    setCurrentQuestion(0);
    
    // Reset answers
    const initialAnswers = {};
    quizzes.forEach((quiz, index) => {
      initialAnswers[index] = '';
    });
    setAnswers(initialAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < quizzes.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading quiz...</span>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 text-lg">No quiz questions available for this lesson.</div>
      </div>
    );
  }

  if (showResults && results) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Results</h2>
          <div className={`text-6xl font-bold mb-4 ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
            {results.score}%
          </div>
          <div className={`text-xl font-semibold ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
            {results.passed ? '🎉 Congratulations! You Passed!' : '❌ You Need 70% to Pass'}
          </div>
          <div className="text-gray-600 mt-2">
            {results.correctAnswers} out of {results.totalQuestions} questions correct
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Results:</h3>
          
          {results.details.map((detail, index) => (
            <div key={detail.questionId} className={`p-4 rounded-lg border-2 ${detail.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-800">Question {index + 1}</h4>
                <span className={`px-2 py-1 rounded text-sm font-medium ${detail.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                  {detail.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              
              <p className="text-gray-700 mb-3">{detail.question}</p>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium text-gray-600 mr-2">Your Answer:</span>
                  <span className={`${detail.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {detail.userAnswer}
                  </span>
                </div>
                
                {!detail.isCorrect && (
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600 mr-2">Correct Answer:</span>
                    <span className="text-green-600">{detail.correctAnswer}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={resetQuiz}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Take Quiz Again
          </button>
        </div>
      </div>
    );
  }

  const currentQuiz = quizzes[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Quiz</h2>
          <div className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {quizzes.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / quizzes.length) * 100}%` }}
          ></div>
        </div>

        {/* Question Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {quizzes.map((_, index) => (
            <button
              key={index}
              onClick={() => goToQuestion(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                index === currentQuestion
                  ? 'bg-blue-600 text-white'
                  : answers[index]
                  ? 'bg-green-200 text-green-800'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Current Question */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {currentQuiz.question}
        </h3>
        
        <div className="space-y-3">
          {currentQuiz.options.map((option, optionIndex) => (
            <label
              key={optionIndex}
              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                answers[currentQuestion] === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion}`}
                value={option}
                checked={answers[currentQuestion] === option}
                onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                className="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            currentQuestion === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2'
          }`}
        >
          Previous
        </button>

        <div className="flex space-x-3">
          {currentQuestion < quizzes.length - 1 ? (
            <button
              onClick={nextQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
              } text-white`}
            >
              {submitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                'Submit Quiz'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizComponent;
