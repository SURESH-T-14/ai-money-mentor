const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
  getTransactions, 
  addTransaction, 
  deleteTransaction 
} = require('../controllers/transactionController');

// @route   GET/POST api/transactions
// @desc    Get all user transactions / Add new transaction
// @access  Private
router.route('/')
  .get(auth, getTransactions)
  .post(auth, addTransaction);

// @route   DELETE api/transactions/:id
// @desc    Delete a transaction
// @access  Private
router.route('/:id').delete(auth, deleteTransaction);

module.exports = router;