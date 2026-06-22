const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@mongodb:27017/aimoneymentor?authSource=admin';

mongoose.connect(MONGO_URI)
  .then(() => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('MongoDB connected');
    }
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/ai', require('./routes/ai'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ msg: 'Server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ msg: 'Not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`Server is running on port ${PORT}`);
  }
});

module.exports = app;
