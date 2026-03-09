const mongoose = require('mongoose');

// ─── Book ─────────────────────────────────────────────────────────────────────
const BookSchema = new mongoose.Schema({
  title:       { type: String, required: true, index: 'text' },
  author:      { type: String, required: true, index: 'text' },
  isbn:        { type: String, unique: true, sparse: true },
  genre:       { type: String },
  description: { type: String },
  coverImage:  { type: String, default: '' },
  totalCopies: { type: Number, required: true, min: 0 },
  available:   { type: Number, required: true, min: 0 },
  publishYear: { type: Number },
  publisher:   { type: String },
  language:    { type: String, default: 'English' },
  pages:       { type: Number },
  tags:        [String],
  avgRating:   { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  // Soft delete
  deletedAt:   { type: Date, default: null },
  isDeleted:   { type: Boolean, default: false },
  // Scryfall-like external ID mapping
  externalId:  { type: String },
}, { timestamps: true });

BookSchema.index({ title: 'text', author: 'text', genre: 'text', tags: 'text' });

// Only return non-deleted books by default
BookSchema.pre(/^find/, function(next) {
  if (!this._mongooseOptions.includeDeleted) {
    this.where({ isDeleted: false });
  }
  next();
});

// ─── Transaction ──────────────────────────────────────────────────────────────
const TransactionSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book:        { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  status:      { type: String, enum: ['borrowed', 'returned', 'overdue', 'reserved'], default: 'borrowed' },
  borrowedAt:  { type: Date, default: Date.now },
  dueDate:     { type: Date, required: true },
  returnedAt:  { type: Date },
  renewCount:  { type: Number, default: 0 },
  fine:        { type: Number, default: 0 },
  notes:       { type: String },
}, { timestamps: true });

// ─── Token Blacklist ──────────────────────────────────────────────────────────
const TokenBlacklistSchema = new mongoose.Schema({
  token:     { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
}, { expires: '7d' }); // TTL index - auto-purge

// ─── Review ───────────────────────────────────────────────────────────────────
const ReviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book:    { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  rating:  { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 1000 },
}, { timestamps: true });

ReviewSchema.index({ user: 1, book: 1 }, { unique: true }); // one review per user per book

// Cart (client-side, but persist server-side per user)
const CartSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{ book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }, addedAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

module.exports = {
  Book:           mongoose.model('Book', BookSchema),
  Transaction:    mongoose.model('Transaction', TransactionSchema),
  TokenBlacklist: mongoose.model('TokenBlacklist', TokenBlacklistSchema),
  Review:         mongoose.model('Review', ReviewSchema),
  Cart:           mongoose.model('Cart', CartSchema),
};
