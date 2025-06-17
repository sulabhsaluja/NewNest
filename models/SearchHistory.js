const mongoose = require('mongoose');
const SearchHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  city: String,
  searchedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('SearchHistory', SearchHistorySchema);