import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

const PromptList = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Default prompts for learning and practice
  const defaultPrompts = [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      description: "Practice basic JavaScript concepts including variables, functions, and loops.",
      category: "JavaScript",
      difficulty: "Beginner",
      prompt: "Create a function that takes an array of numbers and returns the sum of all even numbers."
    },
    {
      id: 2,
      title: "React Component Creation",
      description: "Build a simple React component with state management.",
      category: "React",
      difficulty: "Intermediate",
      prompt: "Create a React component that displays a counter with increment and decrement buttons."
    },
    {
      id: 3,
      title: "API Integration",
      description: "Learn how to fetch data from APIs and handle responses.",
      category: "Web Development",
      difficulty: "Intermediate",
      prompt: "Create a function that fetches user data from an API and displays it in a card format."
    },
    {
      id: 4,
      title: "CSS Flexbox Layout",
      description: "Practice creating responsive layouts using CSS Flexbox.",
      category: "CSS",
      difficulty: "Beginner",
      prompt: "Create a responsive navigation bar using CSS Flexbox that works on mobile and desktop."
    },
    {
      id: 5,
      title: "Node.js Express Server",
      description: "Build a basic Express.js server with routing.",
      category: "Node.js",
      difficulty: "Advanced",
      prompt: "Create an Express.js server with routes for GET, POST, PUT, and DELETE operations."
    },
    {
      id: 6,
      title: "Database Operations",
      description: "Practice CRUD operations with a database.",
      category: "Database",
      difficulty: "Advanced",
      prompt: "Design a database schema for a blog system and write queries for creating, reading, updating, and deleting posts."
    }
  ];

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        // Try to fetch prompts from API, fallback to default prompts
        const response = await api.get('/prompts');
        setPrompts(response.data);
      } catch (err) {
        console.log('Using default prompts');
        setPrompts(defaultPrompts);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, []);

  const categories = ['all', ...new Set(prompts.map(prompt => prompt.category))];
  const filteredPrompts = selectedCategory === 'all' 
    ? prompts 
    : prompts.filter(prompt => prompt.category === selectedCategory);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading prompts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Learning Prompts</h1>
          <p className="text-gray-600 mt-2">Practice coding challenges and improve your skills</p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <div key={prompt.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{prompt.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(prompt.difficulty)}`}>
                    {prompt.difficulty}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{prompt.description}</p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-800 font-medium">Challenge:</p>
                  <p className="text-sm text-gray-700 mt-1">{prompt.prompt}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {prompt.category}
                  </span>
                  <button
                    onClick={() => toast.success('Challenge accepted! Start coding!')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Start Challenge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="mt-2 text-sm text-gray-500">No prompts found for this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptList;
