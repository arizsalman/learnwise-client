import React from "react";

const Dashboard = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Dashboard
        </h2>
        <p className="text-gray-700 dark:text-gray-200">
          Welcome to your dashboard! This is a protected route.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
