const express = require('express');
const authMiddleware = require('./middleware/auth');
const authController = require('./controllers/authController');
const photoController = require('./controllers/photoController');

const router = express.Router();

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// Photo Routes
router.post('/photos', authMiddleware, photoController.uploadPhoto);
router.patch('/photos/:photoId/toggle', authMiddleware, photoController.togglePhotoStatus);
router.get('/photos/random', authMiddleware, photoController.getRandomPhoto);
router.post('/photos/:photoId/rate', authMiddleware, photoController.ratePhoto);
router.get('/photos/my', authMiddleware, photoController.getUserPhotos);

// Default Routes
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from API!' });
});

router.get('/status', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
