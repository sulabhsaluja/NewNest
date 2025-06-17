const mongoose = require('mongoose');

const FavoriteCitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  city: { type: String, required: true }
});

module.exports = mongoose.model('FavoriteCity', FavoriteCitySchema);
