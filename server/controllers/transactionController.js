const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

const TRANSACTION_TYPES = ['income', 'expense'];

function parseDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildTransactionPayload(body, isUpdate = false) {
  const payload = {};
  const errors = [];

  const hasAmount = body.amount !== undefined;
  const hasCategory = body.category !== undefined;
  const hasType = body.type !== undefined;
  const hasDate = body.date !== undefined;

  if (!isUpdate || hasAmount) {
    if (body.amount === undefined || body.amount === null || Number.isNaN(Number(body.amount))) {
      errors.push('amount must be a valid number');
    } else {
      payload.amount = Number(body.amount);
    }
  }

  if (!isUpdate || hasCategory) {
    if (!body.category || typeof body.category !== 'string') {
      errors.push('category is required');
    } else {
      payload.category = body.category.trim();
    }
  }

  if (!isUpdate || hasType) {
    const type = body.type || 'expense';
    if (!TRANSACTION_TYPES.includes(type)) {
      errors.push('type must be one of income or expense');
    } else {
      payload.type = type;
    }
  }

  if (!isUpdate || hasDate) {
    const dateValue = body.date || new Date();
    const parsedDate = parseDate(dateValue);
    if (!parsedDate) {
      errors.push('date must be a valid date');
    } else {
      payload.date = parsedDate;
    }
  }

  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== 'string') {
      errors.push('description must be a string');
    } else {
      payload.description = body.description || '';
    }
  }

  if (body.notes !== undefined) {
    if (body.notes !== null && typeof body.notes !== 'string') {
      errors.push('notes must be a string');
    } else {
      payload.notes = body.notes || '';
    }
  }

  return { payload, errors };
}

function buildQueryFilters(query) {
  const filters = {};
  const errors = [];

  if (query.category) {
    filters.category = query.category;
  }

  if (query.type) {
    if (!TRANSACTION_TYPES.includes(query.type)) {
      errors.push('type filter must be income or expense');
    } else {
      filters.type = query.type;
    }
  }

  if (query.startDate || query.endDate) {
    filters.date = {};

    if (query.startDate) {
      const startDate = parseDate(query.startDate);
      if (!startDate) {
        errors.push('startDate must be valid');
      } else {
        filters.date.$gte = startDate;
      }
    }

    if (query.endDate) {
      const endDate = parseDate(query.endDate);
      if (!endDate) {
        errors.push('endDate must be valid');
      } else {
        filters.date.$lte = endDate;
      }
    }

    if (Object.keys(filters.date).length === 0) {
      delete filters.date;
    }
  }

  if (query.minAmount || query.maxAmount) {
    filters.amount = {};

    if (query.minAmount) {
      const minAmount = Number(query.minAmount);
      if (Number.isNaN(minAmount)) {
        errors.push('minAmount must be a valid number');
      } else {
        filters.amount.$gte = minAmount;
      }
    }

    if (query.maxAmount) {
      const maxAmount = Number(query.maxAmount);
      if (Number.isNaN(maxAmount)) {
        errors.push('maxAmount must be a valid number');
      } else {
        filters.amount.$lte = maxAmount;
      }
    }

    if (Object.keys(filters.amount).length === 0) {
      delete filters.amount;
    }
  }

  return { filters, errors };
}

// Get all transactions for a user
exports.getTransactions = async (req, res) => {
  try {
    const { filters, errors } = buildQueryFilters(req.query);
    if (errors.length) {
      return res.status(400).json({ msg: 'Invalid query filters', errors });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const query = { user: req.user.id, ...filters };

    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort({ date: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments(query)
    ]);

    res.json({
      data: transactions,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Add a new transaction
exports.addTransaction = async (req, res) => {
  const { payload, errors } = buildTransactionPayload(req.body, false);
  if (errors.length) {
    return res.status(400).json({ msg: 'Invalid transaction payload', errors });
  }

  try {
    const newTransaction = new Transaction({
      user: req.user.id,
      ...payload
    });

    const transaction = await newTransaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  const { payload, errors } = buildTransactionPayload(req.body, true);

  if (errors.length) {
    return res.status(400).json({ msg: 'Invalid transaction payload', errors });
  }

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({ msg: 'No fields provided for update' });
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ msg: 'Invalid transaction id' });
  }

  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      payload,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    return res.json(transaction);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ msg: 'Invalid transaction id' });
  }

  try {
    let transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ msg: 'Transaction not found' });
    }

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Transaction removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Dashboard summary endpoint
exports.getSummary = async (req, res) => {
  try {
    const userMatch = { user: new mongoose.Types.ObjectId(req.user.id) };

    const [totalsAgg, categoryTotals, recentActivity, monthlyTrends] = await Promise.all([
      Transaction.aggregate([
        { $match: userMatch },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' }
          }
        }
      ]),
      Transaction.aggregate([
        { $match: userMatch },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' }
          }
        },
        { $sort: { total: -1 } }
      ]),
      Transaction.find({ user: req.user.id }).sort({ date: -1 }).limit(5),
      Transaction.aggregate([
        { $match: userMatch },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' }
            },
            income: {
              $sum: {
                $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0]
              }
            },
            expense: {
              $sum: {
                $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0]
              }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const totals = totalsAgg.reduce(
      (acc, item) => {
        acc[item._id] = item.total;
        return acc;
      },
      { income: 0, expense: 0 }
    );

    const summary = {
      totalIncome: totals.income,
      totalExpenses: totals.expense,
      netBalance: totals.income - totals.expense,
      categoryTotals: categoryTotals.map((item) => ({
        category: item._id,
        total: item.total
      })),
      recentActivity,
      monthlyTrends: monthlyTrends.map((item) => ({
        year: item._id.year,
        month: item._id.month,
        income: item.income,
        expense: item.expense,
        net: item.income - item.expense
      }))
    };

    return res.json(summary);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ msg: 'Server error' });
  }
};
