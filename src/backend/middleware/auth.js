import jwt from 'jsonwebtoken';
import TokenBlacklist from '../models/TokenBlacklist.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bibliovault_super_secret_key_2024';

export const generateTokens = (payload) => {
  const accessToken  = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign(payload, JWT_SECRET + '_refresh', { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  const isBlacklisted = await TokenBlacklist.findOne({ token });
  if (isBlacklisted)
    return res.status(401).json({ error: 'Token has been revoked. Please log in again.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user  = decoded;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role))
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  next();
};