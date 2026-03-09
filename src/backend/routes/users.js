// routes/users.js
const router = require('express').Router();
const User = require('../models/User');
const { Cart, Transaction } = require('../models/index');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/users/me
router.get('/me', verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password -loginAttempts -lockUntil');
  res.json(user);
});

// Cart operations
router.get('/cart', verifyToken, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.book', 'title author coverImage available avgRating');
  res.json(cart || { items: [] });
});

router.post('/cart', verifyToken, async (req, res) => {
  const { bookId } = req.body;
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { $addToSet: { items: { book: bookId } } },
    { upsert: true, new: true }
  ).populate('items.book', 'title author coverImage available');
  res.json(cart);
});

router.delete('/cart/:bookId', verifyToken, async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { $pull: { items: { book: req.params.bookId } } },
    { new: true }
  ).populate('items.book', 'title author coverImage available');
  res.json(cart);
});

// Admin: list all users
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  const { page = 1, limit = 20, q } = req.query;
  const filter = q ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] } : {};
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').skip((page - 1) * limit).limit(+limit),
    User.countDocuments(filter),
  ]);
  res.json({ users, total });
});

// Admin: change user role
router.patch('/:id/role', verifyToken, requireRole('admin'), async (req, res) => {
  const { role } = req.body;
  if (!['user', 'librarian', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  res.json(user);
});

module.exports = router;
