const router = require('express').Router();
const User = require('../models/User');
const { TokenBlacklist } = require('../models/index');
const { generateTokens, verifyToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000; // 30 min

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already in use' });

    const user = await User.create({ name, email, password });
    const { accessToken, refreshToken } = generateTokens({ id: user._id, email: user.email, role: user.role, name: user.name });

    res.status(201).json({ accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Brute force check
    if (user.isLocked()) {
      const wait = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(429).json({ error: `Account locked. Try again in ${wait} minutes.` });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME);
        user.loginAttempts = 0;
      }
      await user.save();
      return res.status(401).json({ error: 'Invalid credentials', attemptsLeft: MAX_ATTEMPTS - user.loginAttempts });
    }

    // Reset on success
    user.loginAttempts = 0;
    user.lockUntil    = undefined;
    await user.save();

    const { accessToken, refreshToken } = generateTokens({ id: user._id, email: user.email, role: user.role, name: user.name });
    res.json({ accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/logout - blacklist token
router.post('/logout', verifyToken, async (req, res) => {
  try {
    const decoded = jwt.decode(req.token);
    await TokenBlacklist.create({
      token: req.token,
      expiresAt: new Date(decoded.exp * 1000),
    });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, (process.env.JWT_SECRET || 'bibliovault_super_secret_key_2024') + '_refresh');
    const { accessToken, refreshToken: newRefresh } = generateTokens({ id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name });
    res.json({ accessToken, refreshToken: newRefresh });
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;
