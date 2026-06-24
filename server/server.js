const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());   // To parse JSON request bodies 

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected...');
    
    // If in test mode, seed test data
    if (process.env.NODE_ENV === 'test') {
      console.log('Test mode detected - seeding test data...');
      await seedTestData();
    }
  })
  .catch(err => console.log(err));

// Seed test data for contract testing
async function seedTestData() {
  try {
    const User = require('./models/User');
    const Transaction = require('./models/Transaction');
    
    // Clear existing test data
    await User.deleteMany({ email: { $in: ['admin@finance.local', 'test@example.com', 'newuser@example.com', 'newuser.test@specmatic.local'] } });
    await Transaction.deleteMany({});
    
    // Create test admin user (matching the mock ID from auth middleware)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    let adminUser;
    try {
      // Try to create with explicit ID (must be valid MongoDB ObjectId)
      adminUser = await User.create({
        _id: mongoose.Types.ObjectId('6a351082da1b125a5c4644c3'),
        name: 'Finance Admin',
        email: 'admin@finance.local',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
    } catch (idErr) {
      console.warn('Could not create user with explicit ID, creating with auto-generated ID:', idErr.message);
      // Fallback: create user with auto-generated ID
      adminUser = await User.create({
        name: 'Finance Admin',
        email: 'admin@finance.local',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      console.log('Created admin user with auto-generated ID:', adminUser._id.toString());
    }
    
    console.log('✓ Test data seeded successfully');
    console.log(`✓ Created admin user: ${adminUser.email} (ID: ${adminUser._id})`);
    
    // Create a test transaction for the admin user
    const Transaction_Model = require('./models/Transaction');
    const testTransaction = await Transaction_Model.create({
      user: adminUser._id,
      description: 'Test transaction',
      amount: 100.00,
      type: 'expense',
      category: 'Testing',
      date: new Date(),
      notes: 'Auto-created test transaction'
    });
    console.log(`✓ Created test transaction: ${testTransaction._id}`);
    
  } catch (err) {
    console.error('Error seeding test data:', err.message);
  }
};

// Test Route 
app.get('/', (req, res) => {
  res.send('AI Money Mentor API is running!');
});

//Import Routes (we will create these next) 
 app.use('/api/auth', require('./routes/auth'));
 app.use('/api/users', require('./routes/users'));
 app.use('/api/transactions', require('./routes/transactions'));
 app.use('/api/ai', require('./routes/ai'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
