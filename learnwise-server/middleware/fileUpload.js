const upload = require('../middleware/fileUpload');

router.post(
  '/upload-lesson',
  upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'video', maxCount: 1 }]),
  uploadLesson
);