const mongoose = require('mongoose');
const db = require('../db');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
  age: { type: Number, default: 0 },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null }
});

const User = db.mongoDb.model('User', UserSchema);

module.exports = User;
