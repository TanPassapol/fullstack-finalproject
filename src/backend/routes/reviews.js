// routes/reviews.js
const router = require('express').Router();
const { Review, Book } = require('../models/index');
const { verifyToken } = require('../middleware/auth');

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
    // Update book average
    const stats = await Review.aggregate([
      { $match: { book: require('mongoose').Types.ObjectId(bookId) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length) {
      await Book.findByIdAndUpdate(bookId, { avgRating: stats[0].avg.toFixed(1), ratingCount: stats[0].count });
    }
    res.json(review);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
