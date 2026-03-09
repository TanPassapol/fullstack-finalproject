import { Router } from 'express';
import { Transaction, Book, Cart } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// ─── GET all transactions ─────────────────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = req.user.role === 'user' ? { user: req.user.id } : {};
    const { status, page = 1, limit = 20 } = req.query;
    if (status) filter.status = status;
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('book', 'title author coverImage genre')
        .populate('user', 'name email')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(+limit),
      Transaction.countDocuments(filter),
    ]);
    res.json({ transactions, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── BORROW (no session — works on standalone MongoDB) ───────────────────────
router.post('/borrow', verifyToken, async (req, res) => {
  try {
    const { bookId, dueDate } = req.body;

    // Check book exists and has copies
    const book = await Book.findOne({ _id: bookId, available: { $gt: 0 }, isDeleted: { $ne: true } });
    if (!book) return res.status(400).json({ error: 'Book not available' });

    // Check not already borrowed
    const existing = await Transaction.findOne({ user: req.user.id, book: bookId, status: 'borrowed' });
    if (existing) return res.status(409).json({ error: 'You already have this book borrowed' });

    // Decrement available count
    await Book.findByIdAndUpdate(bookId, { $inc: { available: -1 } });

    // Create transaction
    const transaction = await Transaction.create({
      user:   req.user.id,
      book:   bookId,
      status: 'borrowed',
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    // Remove from cart if present
    await Cart.updateOne({ user: req.user.id }, { $pull: { items: { book: bookId } } });

    // Return populated transaction
    const populated = await Transaction.findById(transaction._id)
      .populate('book', 'title author coverImage genre')
      .populate('user', 'name email');

    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── RETURN (no session) ──────────────────────────────────────────────────────
router.post('/return/:id', verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      status: 'borrowed',
      ...(req.user.role === 'user' ? { user: req.user.id } : {}),
    });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found or already returned' });

    // Increment available count
    await Book.findByIdAndUpdate(transaction.book, { $inc: { available: 1 } });

    // Update transaction
    transaction.status     = 'returned';
    transaction.returnedAt = new Date();
    if (new Date() > transaction.dueDate) {
      const days = Math.ceil((Date.now() - transaction.dueDate) / (24 * 60 * 60 * 1000));
      transaction.fine = days * 0.5;
    }
    await transaction.save();

    const populated = await Transaction.findById(transaction._id)
      .populate('book', 'title author coverImage genre')
      .populate('user', 'name email');

    res.json(populated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── RENEW ────────────────────────────────────────────────────────────────────
router.post('/renew/:id', verifyToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id, status: 'borrowed' });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (transaction.renewCount >= 2) return res.status(400).json({ error: 'Maximum renewals reached' });

    transaction.dueDate    = new Date(transaction.dueDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    transaction.renewCount += 1;
    await transaction.save();
    res.json(transaction);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;