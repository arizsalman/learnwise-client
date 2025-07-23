const express = require('express');
const router = express.Router();
const { getCertificate } = require('../controllers/certificateController');
const auth = require('../middleware/auth');

// GET /api/certificate/:userId/:courseId - Get certificate data if user passed course
router.get('/:userId/:courseId', auth, getCertificate);

module.exports = router;
