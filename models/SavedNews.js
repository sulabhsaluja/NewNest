const mongoose = require('mongoose');
const SavedNewsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  link: String,
  savedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('SavedNews', SavedNewsSchema);