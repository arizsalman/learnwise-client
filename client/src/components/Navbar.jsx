import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserIcon,
  HomeIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const Navbar = ({ isAuthenticated, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow p-4 flex justify-between items-center">
      <Link
        to="/"
        className="flex items-center gap-2 text-xl font-bold text-blue-600 dark:text-blue-400"
      >
        <HomeIcon className="h-6 w-6" /> LearnWise
      </Link>
      <div className="flex gap-4 items-center">
        {!isAuthenticated ? (
          <>
            <Link
              to="/login"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600"
            >
              Register
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/dashboard"
              className="text-gray-700 dark:text-gray-200 hover:text-blue-600 flex items-center gap-1"
            >
              <UserIcon className="h-5 w-5" /> Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-700 dark:text-gray-200 hover:text-red-500 flex items-center gap-1"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" /> Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
