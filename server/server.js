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

// Seed function for test mode
async function seedTestData() {
  const bcrypt = require('bcryptjs');
  const User = require('./models/User');
  const Transaction = require('./models/Transaction');
  const Budget = require('./models/Budget');

  try {
    // Clear all data for test mode (fresh start)
    await Promise.all([
      Transaction.deleteMany({}),
      Budget.deleteMany({}),
      User.deleteMany({})  // Clear ALL users for fresh test state
    ]);

    // Hash passwords
    const hashPassword = async (password) => {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(password, salt);
    };

    const [adminPassword, analystPassword, viewerPassword, testPassword] = await Promise.all([
      hashPassword('Admin@123'),
      hashPassword('Analyst@123'),
      hashPassword('Viewer@123'),
      hashPassword('password123')
    ]);

    // Create test users
    await User.create([
      {
        name: 'Finance Admin',
        email: 'admin@finance.local',
        password: adminPassword,
        role: 'admin',
        status: 'active'
      },
      {
        name: 'Finance Analyst',
        email: 'analyst@finance.local',
        password: analystPassword,
        role: 'analyst',
        status: 'active'
      },
      {
        name: 'Finance Viewer',
        email: 'viewer@finance.local',
        password: viewerPassword,
        role: 'viewer',
        status: 'active'
      },
      {
        name: 'John Doe',
        email: 'test@example.com',
        password: testPassword,
        role: 'viewer',
        status: 'active'
      }
    ]);

    console.log('Test data seeded successfully');
  } catch (err) {
    console.error('Seed error:', err);
  }
}

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@mongodb:27017/aimoneymentor?authSource=admin';

mongoose.connect(MONGO_URI)
  .then(async () => {
    if (process.env.NODE_ENV !== 'test') {
      console.log('MongoDB connected');
    } else {
      // Seed test data
      await seedTestData();
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
