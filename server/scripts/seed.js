require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

async function connectDb() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in environment');
  }

  await mongoose.connect(process.env.MONGO_URI);
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function runSeed() {
  await connectDb();

  try {
    await Promise.all([
      Transaction.deleteMany({}),
      Budget.deleteMany({}),
      User.deleteMany({ email: { $in: ['admin@finance.local', 'analyst@finance.local', 'viewer@finance.local'] } })
    ]);

    const [adminPassword, analystPassword, viewerPassword] = await Promise.all([
      hashPassword('Admin@123'),
      hashPassword('Analyst@123'),
      hashPassword('Viewer@123')
    ]);

    const [adminUser, analystUser, viewerUser] = await User.create([
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
      }
    ]);

    await Budget.insertMany([
      { user: adminUser._id, category: 'Food', goal: 12000 },
      { user: adminUser._id, category: 'Rent', goal: 25000 },
      { user: adminUser._id, category: 'Transport', goal: 4000 },
      { user: adminUser._id, category: 'Salary', goal: 60000 }
    ]);

    const now = new Date();
    await Transaction.insertMany([
      {
        user: adminUser._id,
        description: 'Monthly Salary',
        notes: 'Primary income',
        amount: 60000,
        type: 'income',
        category: 'Salary',
        date: new Date(now.getFullYear(), now.getMonth(), 1)
      },
      {
        user: adminUser._id,
        description: 'House Rent',
        notes: 'Fixed monthly expense',
        amount: 25000,
        type: 'expense',
        category: 'Rent',
        date: new Date(now.getFullYear(), now.getMonth(), 3)
      },
      {
        user: adminUser._id,
        description: 'Groceries',
        notes: 'Weekly grocery purchase',
        amount: 4500,
        type: 'expense',
        category: 'Food',
        date: new Date(now.getFullYear(), now.getMonth(), 7)
      },
      {
        user: adminUser._id,
        description: 'Freelance Payment',
        notes: 'Side project income',
        amount: 12000,
        type: 'income',
        category: 'Freelance',
        date: new Date(now.getFullYear(), now.getMonth(), 10)
      },
      {
        user: adminUser._id,
        description: 'Cab Charges',
        notes: 'Work commute',
        amount: 1800,
        type: 'expense',
        category: 'Transport',
        date: new Date(now.getFullYear(), now.getMonth(), 14)
      }
    ]);

    console.log('Seed completed successfully.');
    console.log('Demo users:');
    console.log('admin@finance.local / Admin@123');
    console.log('analyst@finance.local / Analyst@123');
    console.log('viewer@finance.local / Viewer@123');
    console.log('Use /api/auth/login to get JWT for each role.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runSeed();
