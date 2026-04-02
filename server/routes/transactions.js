const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { 
  getTransactions, 
  addTransaction, 
  updateTransaction,
  getSummary,
  deleteTransaction 
} = require('../controllers/transactionController');

// @route   GET/POST api/transactions
// @desc    Get all user transactions / Add new transaction
// @access  Private
router.route('/')
  .get(auth, authorize('viewer', 'analyst', 'admin'), getTransactions)
  .post(auth, authorize('admin'), addTransaction);

// @route   GET api/transactions/summary
// @desc    Get dashboard summary for current user
// @access  Private
router.get('/summary', auth, authorize('viewer', 'analyst', 'admin'), getSummary);

// @route   PUT/DELETE api/transactions/:id
// @desc    Update/Delete a transaction
// @access  Private
router.route('/:id')
  .put(auth, authorize('admin'), updateTransaction)
  .delete(auth, authorize('admin'), deleteTransaction);

module.exports = router;