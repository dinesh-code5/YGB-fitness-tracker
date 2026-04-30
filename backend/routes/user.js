const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, updatePassword, getWeightHistory, logWeight,
  searchUsers, getPublicProfile, addProgressPhoto, getProgressPhotos, togglePrivacy,
  deleteProgressPhoto, verifyPromo
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.get('/weight-history', getWeightHistory);
router.post('/weight', logWeight);
router.get('/search', searchUsers);
// IMPORTANT: specific routes BEFORE /:param routes
router.post('/progress-photo', addProgressPhoto);
router.get('/progress-photos', getProgressPhotos);
router.delete('/progress-photo/:id', deleteProgressPhoto);
router.post('/verify-promo', verifyPromo);
router.post('/privacy', togglePrivacy);
// Param route LAST
router.get('/u/:username', getPublicProfile);

module.exports = router;

