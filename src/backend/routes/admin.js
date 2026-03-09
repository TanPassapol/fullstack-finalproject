import { Router } from 'express';
import { Book, Transaction } from '../models/index.js';
import User from '../models/User.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/stats', verifyToken, requireRole('admin', 'librarian'), async (req, res) => {
  try {
    const [totalBooks, totalUsers, activeBorrows, overdueCount, recentTransactions] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments(),
      Transaction.countDocuments({ status: 'borrowed' }),
      Transaction.countDocuments({ status: 'borrowed', dueDate: { $lt: new Date() } }),
      Transaction.find({ status: 'borrowed' }).populate('book', 'title').populate('user', 'name email').sort('-createdAt').limit(10),
    ]);
    res.json({ totalBooks, totalUsers, activeBorrows, overdueCount, recentTransactions });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/overdue', verifyToken, requireRole('admin', 'librarian'), async (req, res) => {
  const overdue = await Transaction.find({ status: 'borrowed', dueDate: { $lt: new Date() } })
    .populate('book', 'title author')
    .populate('user', 'name email')
    .sort('dueDate');
  res.json(overdue);
});

export default router;
