/* eslint-disable no-undef */
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import os from 'os';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Brute force protection on login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);

// ─── Database ─────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bibliovault')
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB error:', err));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./src/backend/routes/auth'));
app.use('/api/books',        require('./src/backend/routes/books'));
app.use('/api/transactions', require('./src/backend/routes/transactions'));
app.use('/api/users',        require('./src/backend/routes/users'));
app.use('/api/reviews',      require('./src/backend/routes/reviews'));
app.use('/api/admin',        require('./src/backend/routes/admin'));

// ─── System Monitor ───────────────────────────────────────────────────────────
const { verifyToken, requireRole } = require('./src/backend/middleware/auth');

app.get('/api/monitor/system', verifyToken, requireRole('admin'), (req, res) => {
  const cpus     = os.cpus();
  const totalMem = os.totalmem();
  const freeMem  = os.freemem();
  const usedMem  = totalMem - freeMem;

  const cpuUsage = cpus.map((cpu) => {
    const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
    return ((1 - cpu.times.idle / total) * 100).toFixed(2);
  });

  res.json({
    hostname:    os.hostname(),
    platform:    os.platform(),
    arch:        os.arch(),
    uptime:      os.uptime(),
    cpu: {
      model:    cpus[0]?.model,
      cores:    cpus.length,
      usage:    cpuUsage,
      avgUsage: (cpuUsage.reduce((a, b) => a + parseFloat(b), 0) / cpuUsage.length).toFixed(2),
    },
    memory: {
      total:        totalMem,
      used:         usedMem,
      free:         freeMem,
      usagePercent: ((usedMem / totalMem) * 100).toFixed(2),
    },
    loadAvg:     os.loadavg(),
    nodeVersion: process.version,
    pid:         process.pid,
  });
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
);

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 BiblioVault API running on http://localhost:${PORT}`)
);
