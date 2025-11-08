const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BudgetSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  goal: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model('Budget', BudgetSchema);
