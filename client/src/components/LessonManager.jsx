import React, { useState } from 'react';
import axios from 'axios';
import { Cloudinary } from 'cloudinary-react';
import { Tailwind } from 'tailwindcss';

const LessonManager = () => {
  const [lessonTitle, setLessonTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ video: 0, pdf: 0 });
  const [cloudinaryUrls, setCloudinaryUrls] = useState({ video: '', pdf: '' });
  const [lesson, setLesson] = useState({});

  const handleVideoChange = (event) => {
    if (!event.target.files[0].type.match('video/mp4')) {
      alert('Only MP4 videos are allowed');
      return;
    }
    setVideoFile(event.target.files[0]);
  };

  const handlePdfChange = (event) => {
    if (!event.target.files[0].type.match('application/pdf')) {
      alert('Only PDF files are allowed');
      return;
    }
    setPdfFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    setUploading(true);
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('pdf', pdfFile);

    const cloudinary = new Cloudinary({
      cloud_name: 'your-cloud-name',
      api_key: 'your-api-key',
      api_secret: 'your-api-secret',
    });

    const uploadVideo = await cloudinary.uploader.upload(videoFile, {
      resource_type: 'video',
      format: 'mp4',
      progress: (progress) => {
        setUploadProgress((prevProgress) => ({ ...prevProgress, video: progress }));
      },
    });

    const uploadPdf = await cloudinary.uploader.upload(pdfFile, {
      resource_type: 'raw',
      format: 'pdf',
      progress: (progress) => {
        setUploadProgress((prevProgress) => ({ ...prevProgress, pdf: progress }));
      },
    });

    const videoUrl = uploadVideo.secure_url;
    const pdfUrl = uploadPdf.secure_url;

    setCloudinaryUrls({ video: videoUrl, pdf: pdfUrl });
    setLesson({ title: lessonTitle, videoUrl, pdfUrl });

    setUploading(false);
  };

  const handleSubmit = () => {
    console.log(lesson);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lesson Manager</h1>
      <form>
        <input
          type="text"
          value={lessonTitle}
          onChange={(event) => setLessonTitle(event.target.value)}
          placeholder="Lesson title"
          className="block w-full p-2 mb-4 border border-gray-400"
        />
        <input
          type="file"
          onChange={handleVideoChange}
          accept=".mp4"
          className="block w-full p-2 mb-4 border border-gray-400"
        />
        <input
          type="file"
          onChange={handlePdfChange}
          accept=".pdf"
          className="block w-full p-2 mb-4 border border-gray-400"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
        {uploading && (
          <div className="mt-4">
            <p>Video upload progress: {uploadProgress.video}%</p>
            <p>PDF upload progress: {uploadProgress.pdf}%</p>
          </div>
        )}
        {cloudinaryUrls.video && (
          <div className="mt-4">
            <p>Video preview: <a href={cloudinaryUrls.video} target="_blank">View</a></p>
            <p>PDF preview: <a href={cloudinaryUrls.pdf} target="_blank">View</a></p>
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default LessonManager;