// ─── models/User.js ──────────────────────────────────────────────────────────
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  password:     { type: String, required: true, minlength: 6 },
  role:         { type: String, enum: ['user', 'librarian', 'admin'], default: 'user' },
  avatar:       { type: String, default: '' },
  borrowedBooks:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  isActive:     { type: Boolean, default: true },
  loginAttempts:{ type: Number, default: 0 },
  lockUntil:    { type: Date },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = mongoose.model('User', UserSchema);
