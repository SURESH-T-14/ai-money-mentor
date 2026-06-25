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

// Normalize all error responses (4xx/5xx) to match the OpenAPI ErrorResponse schema
app.use((req, res, next) => {
  const originalJson = res.json;

  res.json = function (body) {
    if (res.statusCode >= 400) {
      let message = 'An error occurred';
      let errorDetail;

      if (body && typeof body === 'object') {
        if (body.msg !== undefined) {
          message = body.msg;
        } else if (body.message !== undefined) {
          message = body.message;
        }

        if (body.errors !== undefined) {
          errorDetail = Array.isArray(body.errors) ? body.errors.join(', ') : String(body.errors);
        } else if (body.error !== undefined) {
          errorDetail = String(body.error);
        }
      } else if (body !== undefined && body !== null) {
        message = String(body);
      }

      const cleanBody = {
        success: false,
        message: String(message)
      };

      if (errorDetail !== undefined) {
        cleanBody.error = String(errorDetail);
      }

      body = cleanBody;
    }
    return originalJson.call(this, body);
  };

  next();
});

// Connect to MongoDB
console.log('\n[DB] Connecting to MongoDB...');
console.log(`[DB] MONGO_URI: ${process.env.MONGO_URI ? process.env.MONGO_URI.replace(/\/\/.*:.*@/, '//***:***@') : 'NOT SET'}`);

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('[DB] ✓ MongoDB connected successfully');
    
    // If in test mode, seed test data
    if (process.env.NODE_ENV === 'test') {
      console.log('[TEST] Test mode detected - seeding test data...');
      try {
        await seedTestData();
      } catch (seedErr) {
        console.error('[TEST] ERROR during seeding:', seedErr.message);
        // Don't exit - continue and let requests fail gracefully
      }
    }
  })
  .catch(err => {
    console.error('[DB] ERROR connecting to MongoDB:', err.message);
    console.error('[DB] This may cause API failures - continuing anyway...');
  });

// Seed test data for contract testing
async function seedTestData() {
  try {
    console.log('\n[SEED] Starting test data seeding...');
    const User = require('./models/User');
    const Transaction = require('./models/Transaction');
    
    // Clear existing test data
    console.log('[SEED] Clearing existing test data...');
    const deletedUsers = await User.deleteMany({ email: { $in: ['admin@finance.local', 'test@example.com', 'newuser@example.com', 'newuser.test@specmatic.local'] } });
    const deletedTransactions = await Transaction.deleteMany({});
    console.log(`[SEED] Deleted ${deletedUsers.deletedCount} test users and ${deletedTransactions.deletedCount} test transactions`);
    
    // Create test admin user (matching the mock ID from auth middleware)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);
    
    let adminUser;
    try {
      // Try to create with explicit ID (must be valid MongoDB ObjectId)
      console.log('[SEED] Attempting to create admin user with explicit ID: 6a351082da1b125a5c4644c3');
      adminUser = await User.create({
        _id: new mongoose.Types.ObjectId('6a351082da1b125a5c4644c3'),
        name: 'Finance Admin',
        email: 'admin@finance.local',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      console.log(`[SEED] ✓ Created admin user with explicit ID: ${adminUser._id}`);
    } catch (idErr) {
      console.warn(`[SEED] Could not create user with explicit ID (${idErr.message}), falling back to auto-generated ID...`);
      // Fallback: create user with auto-generated ID
      adminUser = await User.create({
        name: 'Finance Admin',
        email: 'admin@finance.local',
        password: hashedPassword,
        role: 'admin',
        status: 'active'
      });
      console.log(`[SEED] ✓ Created admin user with auto-generated ID: ${adminUser._id.toString()}`);
    }
    
    console.log(`[SEED] ✓ Admin user created: ${adminUser.email} (ID: ${adminUser._id})`);
    
    // Create test user with ID expected by update example
    console.log('[SEED] Creating test user for update example (ID: 000000000000000000000001)...');
    try {
      const updateTestUser = await User.findByIdAndUpdate(
        new mongoose.Types.ObjectId('000000000000000000000001'),
        {
          name: 'Update Test User',
          email: 'updatetest@example.com',
          password: hashedPassword,
          role: 'viewer',
          status: 'active'
        },
        { upsert: true, new: true }
      );
      console.log(`[SEED] ✓ Created/Updated user for update tests: ${updateTestUser._id}`);
    } catch (err) {
      console.error(`[SEED] ERROR creating user: ${err.message}`);
    }
    
    // Create a test transaction for the admin user
    console.log('[SEED] Creating test transactions...');
    const Transaction_Model = require('./models/Transaction');
    
    // Create transaction with ID expected by update/delete examples
    console.log('[SEED] Creating transaction for update/delete tests (ID: 000000000000000000000002)...');
    try {
      const updateDeleteTestTransaction = await Transaction_Model.findByIdAndUpdate(
        new mongoose.Types.ObjectId('000000000000000000000002'),
        {
          user: '6a351082da1b125a5c4644c3',
          description: 'Transaction for update/delete test',
          amount: 250.00,
          type: 'expense',
          category: 'Testing',
          date: new Date(),
          notes: 'Used for update and delete example tests'
        },
        { upsert: true, new: true }
      );
      console.log(`[SEED] ✓ Created/Updated transaction for update/delete tests: ${updateDeleteTestTransaction._id}`);
    } catch (err) {
      console.error(`[SEED] ERROR creating transaction: ${err.message}`);
    }
    
    // Create a generic test transaction (using explicit test mode user ID for update/delete to work)
    const testTransaction = await Transaction_Model.create({
      user: '6a351082da1b125a5c4644c3',  // Store as STRING, not ObjectId
      description: 'Test transaction',
      amount: 100.00,
      type: 'expense',
      category: 'Testing',
      date: new Date(),
      notes: 'Auto-created test transaction'
    });
    console.log(`[SEED] ✓ Created generic test transaction: ${testTransaction._id}`);
    console.log('[SEED] ✓ Test data seeding completed successfully\n');
    
  } catch (err) {
    console.error('[SEED] ERROR:', err.message);
    console.error('[SEED] Stack:', err.stack);
    throw err; // Re-throw so we know seeding failed
  }
};

// Test Route 
app.get('/', (req, res) => {
  res.send('AI Money Mentor API is running!');
});

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// Import Routes - wrap each in its own try/catch to ensure all load even if one fails
console.log('\n[ROUTES] Starting to load API routes...');

try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✓ Auth routes mounted at /api/auth');
} catch (err) {
  console.error('✗ ERROR loading auth routes:', err.message);
  console.error('  Stack:', err.stack);
}

try {
  const userRoutes = require('./routes/users');
  app.use('/api/users', userRoutes);
  console.log('✓ Users routes mounted at /api/users');
} catch (err) {
  console.error('✗ ERROR loading users routes:', err.message);
  console.error('  Stack:', err.stack);
}

try {
  const transactionRoutes = require('./routes/transactions');
  app.use('/api/transactions', transactionRoutes);
  console.log('✓ Transactions routes mounted at /api/transactions');
} catch (err) {
  console.error('✗ ERROR loading transactions routes:', err.message);
  console.error('  Stack:', err.stack);
}

try {
  const aiRoutes = require('./routes/ai');
  app.use('/api/ai', aiRoutes);
  console.log('✓ AI routes mounted at /api/ai');
} catch (err) {
  console.error('✗ ERROR loading AI routes:', err.message);
  console.error('  Stack:', err.stack);
}

console.log('[ROUTES] Route loading complete\n');

// Catch-all 404 handler
app.use((req, res) => {
  console.error(`[404] No route found for ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`, err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV === 'test' && { stack: err.stack })
  });
});

const server = app.listen(PORT, () => {
  console.log(`\n✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ MongoDB URI: ${process.env.MONGO_URI ? 'configured' : 'NOT configured'}`);
  console.log(`\n=== Available Endpoints ===`);
  console.log('POST   /api/auth/register');
  console.log('POST   /api/auth/login');
  console.log('POST   /api/auth/google');
  console.log('GET    /api/users/me');
  console.log('GET    /api/users');
  console.log('POST   /api/users');
  console.log('PATCH  /api/users/:id');
  console.log('GET    /api/transactions');
  console.log('POST   /api/transactions');
  console.log('GET    /api/transactions/summary');
  console.log('PUT    /api/transactions/:id');
  console.log('DELETE /api/transactions/:id');
  console.log('POST   /api/ai/chat');
  console.log('===========================\n');
});
