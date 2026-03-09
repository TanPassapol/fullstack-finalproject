import { Router } from 'express';
import axios from 'axios';
import { Book } from '../models/index.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { q, genre, page = 1, limit = 12, sort = '-createdAt' } = req.query;
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (genre) filter.genre = genre;
    const skip = (page - 1) * limit;
    const [books, total] = await Promise.all([
      Book.find(filter).sort(sort).skip(skip).limit(+limit),
      Book.countDocuments(filter),
    ]);
    res.json({ books, total, page: +page, totalPages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', verifyToken, requireRole('admin', 'librarian'), async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', verifyToken, requireRole('admin', 'librarian'), async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', verifyToken, requireRole('admin', 'librarian'), async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book soft-deleted', book });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/restore/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, { isDeleted: false, deletedAt: null }, { new: true });
    res.json(book);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/bulk', verifyToken, requireRole('admin', 'librarian'), async (req, res) => {
  try {
    const { books } = req.body;
    if (!Array.isArray(books) || books.length === 0)
      return res.status(400).json({ error: 'Books array required' });
    const results = { created: 0, failed: [], total: books.length };
    for (const bookData of books) {
      try { await Book.create(bookData); results.created++; }
      catch (e) { results.failed.push({ data: bookData, error: e.message }); }
    }
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/external/scryfall/:marketId', verifyToken, requireRole('admin', 'librarian'), async (req, res) => {
  try {
    const { marketId } = req.params;
    const response = await axios.get(`https://api.scryfall.com/cards/cardmarket/${marketId}`, {
      timeout: 10000,
      headers: { 'User-Agent': 'BiblioVault/1.0 (book-catalog-enrichment)' },
    });
    const card = response.data;
    const mapped = {
      title: card.name, author: card.artist || 'Unknown',
      description: card.oracle_text || card.flavor_text || '',
      genre: card.type_line || 'Uncategorized',
      coverImage: card.image_uris?.normal || card.image_uris?.large || '',
      externalId: `scryfall:${card.id}`, tags: card.keywords || [],
      publishYear: card.released_at ? new Date(card.released_at).getFullYear() : null,
      publisher: card.set_name || 'Unknown Publisher', totalCopies: 1, available: 1,
    };
    res.json({ source: 'bibliovault-scryfall-catalog', raw: card, mapped });
  } catch (err) {
    if (err.response) return res.status(err.response.status).json({ error: 'External catalog error', details: err.response.data });
    res.status(500).json({ error: 'Failed to fetch from external catalog' });
  }
});

export default router;
