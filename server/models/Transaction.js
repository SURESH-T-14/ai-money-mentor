const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: String,
  notes: String,
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    default: 'expense'
  },
  category: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: false },
  toObject: { virtuals: false }
});

TransactionSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.__v;
    delete ret.id;
    delete ret.createdAt;
    return ret;
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
