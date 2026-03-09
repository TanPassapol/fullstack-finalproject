import { Router } from 'express';
import mongoose from 'mongoose';
import { Review, Book } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/book/:bookId', async (req, res) => {
  const reviews = await Review.find({ book: req.params.bookId }).populate('user', 'name avatar').sort('-createdAt');
  res.json(reviews);
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;
    const review = await Review.findOneAndUpdate(
      { user: req.user.id, book: bookId },
      { rating, comment },
      { upsert: true, new: true, runValidators: true }
    );
    const stats = await Review.aggregate([
      { $match: { book: new mongoose.Types.ObjectId(bookId) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length) {
      await Book.findByIdAndUpdate(bookId, { avgRating: stats[0].avg.toFixed(1), ratingCount: stats[0].count });
    }
    res.json(review);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;