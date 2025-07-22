const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// GET /api/courses: Returns all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/courses: Creates a new course (admin-only)
router.post('/', auth, role('admin'), async (req, res) => {
  try {
    const { title, description, thumbnail, price, category } = req.body;
    const course = new Course({ title, description, thumbnail, price, category });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/courses/:id: Deletes a course by ID (admin-only)
router.delete('/:id', auth, role('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 