const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  getMyProfile,
  listUsers,
  createUser,
  updateUser
} = require('../controllers/userController');

router.get('/me', auth, getMyProfile);

router.route('/')
  .get(auth, authorize('admin'), listUsers)
  .post(auth, authorize('admin'), createUser);

router.patch('/:id', auth, authorize('admin'), updateUser);

module.exports = router;
