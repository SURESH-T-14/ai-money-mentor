const Transaction = require('../models/Transaction');

// Get all transactions for a user
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Add a new transaction
exports.addTransaction = async (req, res) => {
  const { description, amount, category, date } = req.body;
  try {
    const newTransaction = new Transaction({
      user: req.user.id,
      description,
      amount,
      category,
      date
    });
    const transaction = await newTransaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    let transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }
    // Check user
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Transaction removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
