import express   from 'express';
import mongoose  from 'mongoose';
import cors      from 'cors';
import morgan    from 'morgan';
import dotenv    from 'dotenv';
import os        from 'os';
import rateLimit from 'express-rate-limit';

import authRoutes        from './src/backend/routes/auth.js';
import bookRoutes        from './src/backend/routes/books.js';
import transactionRoutes from './src/backend/routes/transactions.js';
import userRoutes        from './src/backend/routes/users.js';
import reviewRoutes      from './src/backend/routes/reviews.js';
import adminRoutes       from './src/backend/routes/admin.js';
import { verifyToken, requireRole } from './src/backend/middleware/auth.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Circuit Breaker Middleware (3.3) ─────────────────────────────────────────
// Tracks requests per IP. If an IP exceeds the limit within the window,
// the circuit "trips" — all further requests from that IP are blocked with 429
// until the window resets. Acts as an automatic temporary disconnect.

// Layer 1 — Global limiter: max 100 requests per 15 min per IP (all routes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minute window
  max: 100,                    // trip the breaker after 100 requests
  standardHeaders: true,       // send RateLimit-* headers so client knows state
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`⚡ Circuit tripped for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      error:   'Too many requests — circuit breaker triggered.',
      retryIn: Math.ceil(req.rateLimit.resetTime / 1000) + 's',
    });
  },
});

// Layer 2 — Auth limiter: max 5 login attempts per 15 min per IP
// Protects specifically against brute-force on the login endpoint
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    console.warn(`🔒 Auth circuit tripped for IP: ${req.ip}`);
    res.status(429).json({
      error:   'Too many login attempts — your IP has been temporarily blocked.',
      retryIn: '15 minutes',
    });
  },
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(globalLimiter);                        // apply global circuit breaker to all routes
app.use('/api/auth/login', authLimiter);       // apply stricter breaker on login specifically

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bibliovault')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err.message));

app.use('/api/auth',         authRoutes);
app.use('/api/books',        bookRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/reviews',      reviewRoutes);
app.use('/api/admin',        adminRoutes);

app.get('/api/monitor/system', verifyToken, requireRole('admin'), (req, res) => {
  const cpus    = os.cpus();
  const total   = os.totalmem();
  const free    = os.freemem();
  const used    = total - free;
  const usage   = cpus.map(c => {
    const t = Object.values(c.times).reduce((a, b) => a + b, 0);
    return ((1 - c.times.idle / t) * 100).toFixed(2);
  });
  res.json({
    hostname: os.hostname(), platform: os.platform(), arch: os.arch(),
    uptime: os.uptime(), nodeVersion: process.version, pid: process.pid,
    cpu:    { model: cpus[0]?.model, cores: cpus.length, usage, avgUsage: (usage.reduce((a,b) => a + parseFloat(b), 0) / usage.length).toFixed(2) },
    memory: { total, used, free, usagePercent: ((used/total)*100).toFixed(2) },
    loadAvg: os.loadavg(),
  });
});

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, '127.0.0.1', () =>
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`)
);