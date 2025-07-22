import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AddLesson = ({ courseId, onLessonAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    courseId: courseId || ''
  });
  const [files, setFiles] = useState({
    video: null,
    pdf: null
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    video: 0,
    pdf: 0
  });

  useEffect(() => {
    if (courseId) {
      setFormData(prev => ({ ...prev, courseId }));
    }
  }, [courseId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    
    if (file) {
      // Validate file types
      if (name === 'video') {
        const validVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
        if (!validVideoTypes.includes(file.type)) {
          toast.error('Please select a valid video file (MP4, AVI, MOV, WMV, FLV, WEBM)');
          return;
        }
        if (file.size > 100 * 1024 * 1024) { // 100MB
          toast.error('Video file size should be less than 100MB');
          return;
        }
      } else if (name === 'pdf') {
        if (file.type !== 'application/pdf') {
          toast.error('Please select a valid PDF file');
          return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB
          toast.error('PDF file size should be less than 10MB');
          return;
        }
      }

      setFiles(prev => ({
        ...prev,
        [name]: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a lesson title');
      return;
    }

    if (!formData.courseId) {
      toast.error('Course ID is required');
      return;
    }

    if (!files.video && !files.pdf) {
      toast.error('Please upload at least one file (video or PDF)');
      return;
    }

    setUploading(true);
    
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('courseId', formData.courseId);
      
      if (files.video) {
        uploadFormData.append('video', files.video);
      }
      
      if (files.pdf) {
        uploadFormData.append('pdf', files.pdf);
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to upload lessons');
        return;
      }

      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Lesson uploaded successfully!');
        
        // Reset form
        setFormData({
          title: '',
          courseId: courseId || ''
        });
        setFiles({
          video: null,
          pdf: null
        });
        
        // Reset file inputs
        const videoInput = document.querySelector('input[name="video"]');
        const pdfInput = document.querySelector('input[name="pdf"]');
        if (videoInput) videoInput.value = '';
        if (pdfInput) pdfInput.value = '';

        // Callback to parent component
        if (onLessonAdded) {
          onLessonAdded(data.lesson);
        }
      } else {
        toast.error(data.message || 'Failed to upload lesson');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Lesson</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Lesson Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Lesson Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter lesson title"
            required
          />
        </div>

        {/* Course ID (if not provided as prop) */}
        {!courseId && (
          <div>
            <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-2">
              Course ID *
            </label>
            <input
              type="text"
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter course ID"
              required
            />
          </div>
        )}

        {/* Video Upload */}
        <div>
          <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-2">
            Video File
          </label>
          <input
            type="file"
            id="video"
            name="video"
            accept="video/*"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {files.video && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {files.video.name} ({formatFileSize(files.video.size)})
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: MP4, AVI, MOV, WMV, FLV, WEBM (Max: 100MB)
          </p>
        </div>

        {/* PDF Upload */}
        <div>
          <label htmlFor="pdf" className="block text-sm font-medium text-gray-700 mb-2">
            PDF File
          </label>
          <input
            type="file"
            id="pdf"
            name="pdf"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {files.pdf && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {files.pdf.name} ({formatFileSize(files.pdf.size)})
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            PDF files only (Max: 10MB)
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            } text-white`}
          >
            {uploading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </div>
            ) : (
              'Upload Lesson'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLesson;
