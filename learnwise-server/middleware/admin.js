const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Admin middleware - checks if user is authenticated and has admin role
module.exports = async function(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to check role
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization denied' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
    
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
