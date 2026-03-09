import { Router } from 'express';
import mongoose from 'mongoose';
import { Transaction, Book, Cart } from '../models/index.js';
import User from '../models/User.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, async (req, res) => {
  try {
    const filter = req.user.role === 'user' ? { user: req.user.id } : {};
    const { status, page = 1, limit = 20 } = req.query;
    if (status) filter.status = status;
    const [transactions, total] = await Promise.all([
      Transaction.find(filter).populate('book', 'title author coverImage').populate('user', 'name email').sort('-createdAt').skip((page - 1) * limit).limit(+limit),
      Transaction.countDocuments(filter),
    ]);
    res.json({ transactions, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/borrow', verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { bookId, dueDate } = req.body;
    const book = await Book.findOne({ _id: bookId, available: { $gt: 0 }, isDeleted: false }).session(session);
    if (!book) { await session.abortTransaction(); return res.status(400).json({ error: 'Book not available' }); }

    const existing = await Transaction.findOne({ user: req.user.id, book: bookId, status: 'borrowed' }).session(session);
    if (existing) { await session.abortTransaction(); return res.status(409).json({ error: 'You already have this book borrowed' }); }

    book.available -= 1;
    await book.save({ session });

    const transaction = await Transaction.create([{
      user: req.user.id, book: bookId, status: 'borrowed',
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    }], { session });

    await Cart.updateOne({ user: req.user.id }, { $pull: { items: { book: bookId } } }, { session });
    await session.commitTransaction();
    res.status(201).json(transaction[0]);
  } catch (err) { await session.abortTransaction(); res.status(500).json({ error: err.message }); }
  finally { session.endSession(); }
});

router.post('/return/:id', verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id, status: 'borrowed',
      ...(req.user.role === 'user' ? { user: req.user.id } : {}),
    }).session(session);
    if (!transaction) { await session.abortTransaction(); return res.status(404).json({ error: 'Transaction not found or already returned' }); }

    const book = await Book.findById(transaction.book).session(session);
    if (!book) { await session.abortTransaction(); return res.status(404).json({ error: 'Book not found' }); }

    book.available += 1;
    await book.save({ session });

    transaction.status     = 'returned';
    transaction.returnedAt = new Date();
    if (new Date() > transaction.dueDate) {
      const days = Math.ceil((Date.now() - transaction.dueDate) / (24 * 60 * 60 * 1000));
      transaction.fine = days * 0.5;
    }
    await transaction.save({ session });
    await session.commitTransaction();
    res.json(transaction);
  } catch (err) { await session.abortTransaction(); res.status(500).json({ error: err.message }); }
  finally { session.endSession(); }
});

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