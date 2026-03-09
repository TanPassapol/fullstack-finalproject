const jwt = require('jsonwebtoken');
const TokenBlacklist = require('../models/TokenBlacklist');

const JWT_SECRET = process.env.JWT_SECRET || 'bibliovault_super_secret_key_2024';

// Generate tokens
exports.generateTokens = (payload) => {
  const accessToken  = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_SECRET + '_refresh', { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// Verify access token + check blacklist
exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];

  // Check if token is blacklisted (logged out)
  const isBlacklisted = await TokenBlacklist.findOne({ token });
  if (isBlacklisted)
    return res.status(401).json({ error: 'Token has been revoked. Please log in again.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// RBAC role guard
exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role))
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  next();
};
