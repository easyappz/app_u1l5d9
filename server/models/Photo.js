const mongoose = require('mongoose');
const db = require('../db');

const PhotoSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  ratings: [
    {
      rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      score: { type: Number, required: true },
      raterGender: { type: String, enum: ['male', 'female', 'other'] },
      raterAge: { type: Number }
    }
  ]
});

const Photo = db.mongoDb.model('Photo', PhotoSchema);

module.exports = Photo;
