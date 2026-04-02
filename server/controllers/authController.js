const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const ensureDbConnected = (res) => {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ msg: 'Database unavailable. Please try again shortly.' });
    return false;
  }
  return true;
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'name, email and password are required' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }

  if (!ensureDbConnected(res)) return;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }
    user = new User({ name, email, password });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    // Create and return token
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    });
  } catch (err) {
    console.error(err.message);
    if (err.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ msg: 'Database unavailable. Please try again shortly.' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'email and password are required' });
  }

  if (!ensureDbConnected(res)) return;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ msg: 'User is inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create and return token
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    });
  } catch (err) {
    console.error(err.message);
    if (err.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ msg: 'Database unavailable. Please try again shortly.' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ msg: 'Missing credential' });

    if (!ensureDbConnected(res)) return;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name || email;

    let user = await User.findOne({ email });
    if (!user) {
      // Create a user without a traditional password (mark provider)
      user = new User({ name, email, password: `google:${payload.sub}` });
      await user.save();
    }

    if (user.status !== 'active') {
      return res.status(403).json({ msg: 'User is inactive' });
    }

    const jwtPayload = { user: { id: user.id } };
    jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    });
  } catch (err) {
    console.error(err.message);
    if (err.name === 'MongooseServerSelectionError') {
      return res.status(503).json({ msg: 'Database unavailable. Please try again shortly.' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
};