import React from "react";

const prompts = [
  "1. Create a Mongoose model for a course with the following fields: title, description, thumbnail, price, category (all required).",
  "2. Create Express.js routes for managing courses: GET /api/courses, POST /api/courses (admin-only), DELETE /api/courses/:id (admin-only). Use middleware to protect POST and DELETE so that only users with role === 'admin' can access them.",
  "3. Give sample CURL or Postman examples to test the GET, POST, and DELETE routes for the course API.",
  "4. Using React.js, create a CourseList page that fetches all courses from the API and displays them in a responsive card layout. Each card should show thumbnail, title, price, and category.",
  "5. Create a React page called AddCourse for admin users. It should include a form with fields: title, description, thumbnail (upload), price, and category. On form submit, send the data to the POST /api/courses endpoint. Use Axios for API call and React Hook Form for validation.",
  "6. Implement a check in React to ensure that only users with the admin role can access the AddCourse page. If not admin, redirect to home.",
];

const PromptList = () => (
  <div className="container mx-auto px-4 py-8">
    <h2 className="text-2xl font-bold mb-4">Project Prompts</h2>
    <ol className="list-decimal pl-6 space-y-2">
      {prompts.map((prompt, idx) => (
        <li key={idx} className="text-gray-800">
          {prompt}
        </li>
      ))}
    </ol>
  </div>
);

export default PromptList;
