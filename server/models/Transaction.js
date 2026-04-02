const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  notes: { type: String },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true, default: 'expense' },
  category: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
