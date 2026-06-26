const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', auth, authController.getCurrentUser);
router.put('/profile', auth, authController.updateProfile);
router.post('/change-password', auth, authController.changePassword);
router.post('/forgot-password', authController.forgotPassword);
router.get('/login-history', auth, authController.getLoginHistory);
router.post('/reset-device', auth, authController.resetDevice);

module.exports = router;
