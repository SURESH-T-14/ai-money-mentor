# Specademy: Backend Implementation Guide
## For Backend Developers

---

## 🎯 Your Role in Spec-Driven Development

As the **provider** (backend developer), you are responsible for:

1. **Build the contract** - Work with frontend to define OpenAPI spec
2. **Implement the specification** - Ensure your code matches the spec exactly
3. **Write contract tests** - Validate every endpoint works per spec
4. **Provide the service** - Make the API available to consumers

---

## 📋 Quick Start: Run Contract Tests

### 1. Start Your Server

```bash
cd server
npm install
npm start
```

Server runs on `http://localhost:5000`

### 2. Run Contract Tests

```bash
# In another terminal
cd server
npm run test:contract
```

**Expected Output:**
```
✅ POST /api/auth/register - PASSED
✅ POST /api/auth/login - PASSED  
✅ GET /api/users/me - PASSED
✅ POST /api/transactions - PASSED
✅ GET /api/transactions - PASSED
✅ GET /api/dashboard/summary - PASSED
... (all endpoints pass)
```

If any fail, your implementation doesn't match the spec!

---

## 🔍 Understanding Contract Testing

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ Contract Testing Flow                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Read OpenAPI Spec                                      │
│     specs/openapi.yaml                                     │
│           ↓                                                 │
│  2. Load Example Data                                      │
│     examples/*.json                                        │
│           ↓                                                 │
│  3. Generate Tests                                         │
│     POST /api/auth/register → Test 1                       │
│     POST /api/auth/login → Test 2                          │
│     GET /api/users/me → Test 3                             │
│           ↓                                                 │
│  4. Run Tests Against Your Implementation                  │
│     Send request to your server                            │
│     Check response matches spec schema                     │
│     Verify status code is correct                          │
│           ↓                                                 │
│  5. Report Results                                         │
│     ✅ PASS - Response matches spec                        │
│     ❌ FAIL - Response doesn't match spec                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### What Gets Tested

For each endpoint and example:
- ✅ Request is sent exactly as specified
- ✅ Response status code matches spec
- ✅ Response body schema matches spec
- ✅ All required fields are present
- ✅ Field types are correct
- ✅ Enum values are valid

---

## 📐 Implementation Pattern

### Step 1: Review the Specification

Find your endpoint in `specs/openapi.yaml`:

```yaml
/api/transactions:
  post:
    summary: Record a new transaction
    tags:
      - Transactions
    security:
      - BearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required:                    # ← MUST include these
              - description
              - amount
              - category
              - type
            properties:
              description:
                type: string
                example: "Grocery shopping"
              amount:
                type: number
                minimum: 0.01
                example: 45.99
              category:
                type: string
                enum: ['food', 'transport', 'utilities', 'entertainment']
              type:
                type: string
                enum: ['income', 'expense']
    responses:
      201:                              # ← MUST return this status
        description: Transaction created successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                success:
                  type: boolean
                transaction:
                  $ref: '#/components/schemas/Transaction'
```

### Step 2: Implement the Endpoint

```javascript
// server/controllers/transactionController.js
exports.createTransaction = async (req, res) => {
  try {
    const { description, amount, category, type } = req.body;

    // 1. VALIDATE per spec
    // These are REQUIRED per spec
    if (!description || !amount || !category || !type) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Missing required fields: description, amount, category, type'
      });
    }

    // 2. VALIDATE enum values
    const validCategories = ['food', 'transport', 'utilities', 'entertainment'];
    const validTypes = ['income', 'expense'];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_CATEGORY',
        message: `Category must be one of: ${validCategories.join(', ')}`
      });
    }

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_TYPE',
        message: `Type must be one of: ${validTypes.join(', ')}`
      });
    }

    // 3. VALIDATE amount
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_AMOUNT',
        message: 'Amount must be a positive number'
      });
    }

    // 4. CREATE transaction
    const transaction = new Transaction({
      userId: req.user.id,
      description,
      amount,
      category,
      type,
      createdAt: new Date()
    });

    await transaction.save();

    // 5. RETURN per spec format
    // Status MUST be 201 per spec
    // Response MUST have 'success' and 'transaction' fields
    return res.status(201).json({
      success: true,
      transaction: {
        _id: transaction._id,
        userId: transaction.userId,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        type: transaction.type,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to create transaction'
    });
  }
};
```

### Step 3: Register the Route

```javascript
// server/routes/transactions.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const transactionController = require('../controllers/transactionController');

// POST /api/transactions - create
router.post('/', authenticate, transactionController.createTransaction);

module.exports = router;
```

### Step 4: Create Test Example

```json
// server/examples/transaction_add.json
{
  "http-request": {
    "method": "POST",
    "path": "/api/transactions",
    "headers": {
      "Authorization": "Bearer (string)"
    },
    "body": {
      "description": "Grocery shopping",
      "amount": 45.99,
      "category": "food",
      "type": "expense"
    }
  },
  "http-response": {
    "status": 201,
    "body": {
      "success": true,
      "transaction": {
        "_id": "(string)",
        "userId": "(string)",
        "description": "Grocery shopping",
        "amount": 45.99,
        "category": "food",
        "type": "expense",
        "createdAt": "(datetime)"
      }
    }
  }
}
```

### Step 5: Run Contract Tests

```bash
npm run test:contract
```

**Result**:
- ✅ PASS - Your implementation matches the spec!
- ❌ FAIL - Fix the discrepancy

---

## ✍️ Writing Test Examples

### What's a Test Example?

A JSON file in `server/examples/` that defines:
- **http-request** - What the test sends
- **http-response** - What the test expects to receive

Specmatic uses these to generate automated tests.

### Example File Format

```json
{
  "http-request": {
    "method": "POST",
    "path": "/api/auth/register",
    "body": {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "password123"
    }
  },
  "http-response": {
    "status": 201,
    "body": {
      "success": true,
      "user": {
        "_id": "(string)",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "viewer",
        "status": "active",
        "createdAt": "(datetime)"
      },
      "token": "(string)"
    }
  }
}
```

### Pattern Matchers

Use these patterns for dynamic values:

| Pattern | Matches | Example |
|---------|---------|---------|
| `(string)` | Any string | `"507f1f77bcf86cd799439011"` |
| `(number)` | Any number | `45.99` |
| `(integer)` | Any integer | `42` |
| `(boolean)` | true or false | `true` |
| `(email)` | Valid email | `user@example.com` |
| `(datetime)` | ISO 8601 date | `2024-01-15T10:30:00Z` |
| `(uuid)` | UUID format | `550e8400-e29b-41d4-a716-446655440000` |

### Creating Multiple Scenarios

#### Happy Path (Success Case)

```json
// examples/user_update_success.json
{
  "http-request": {
    "method": "PATCH",
    "path": "/api/users/507f1f77bcf86cd799439011",
    "headers": {
      "Authorization": "Bearer (string)"
    },
    "body": {
      "role": "analyst",
      "status": "active"
    }
  },
  "http-response": {
    "status": 200,
    "body": {
      "success": true,
      "user": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "(string)",
        "email": "(email)",
        "role": "analyst",
        "status": "active",
        "createdAt": "(datetime)"
      }
    }
  }
}
```

#### Error Case (Unauthorized)

```json
// examples/user_update_unauthorized.json
{
  "http-request": {
    "method": "PATCH",
    "path": "/api/users/507f1f77bcf86cd799439011",
    "headers": {
      "Authorization": "Bearer invalid-token"
    },
    "body": {
      "role": "analyst"
    }
  },
  "http-response": {
    "status": 401,
    "body": {
      "success": false,
      "error": "UNAUTHORIZED",
      "message": "Invalid or expired token"
    }
  }
}
```

#### Validation Error

```json
// examples/transaction_invalid_amount.json
{
  "http-request": {
    "method": "POST",
    "path": "/api/transactions",
    "headers": {
      "Authorization": "Bearer (string)"
    },
    "body": {
      "description": "Test",
      "amount": -10,
      "category": "food",
      "type": "expense"
    }
  },
  "http-response": {
    "status": 400,
    "body": {
      "success": false,
      "error": "VALIDATION_ERROR",
      "message": "Amount must be positive"
    }
  }
}
```

---

## 🔄 Common Response Patterns

### Success Response (Single Resource)

```javascript
res.status(200).json({
  success: true,
  user: {...}
});
```

### Success Response (List)

```javascript
res.status(200).json({
  success: true,
  transactions: [{...}, {...}],
  total: 42,
  page: 1,
  pages: 5
});
```

### Creation Response

```javascript
res.status(201).json({
  success: true,
  user: {...}
});
```

### Error Response (Validation)

```javascript
res.status(400).json({
  success: false,
  error: 'VALIDATION_ERROR',
  message: 'Email is invalid'
});
```

### Error Response (Authorization)

```javascript
res.status(401).json({
  success: false,
  error: 'UNAUTHORIZED',
  message: 'Invalid or expired token'
});
```

### Error Response (Forbidden)

```javascript
res.status(403).json({
  success: false,
  error: 'FORBIDDEN',
  message: 'Admin role required'
});
```

### Error Response (Not Found)

```javascript
res.status(404).json({
  success: false,
  error: 'NOT_FOUND',
  message: 'User not found'
});
```

### Error Response (Server Error)

```javascript
res.status(500).json({
  success: false,
  error: 'SERVER_ERROR',
  message: 'Internal server error'
});
```

---

## 🔒 Validation Patterns

### Always Validate Input

```javascript
// ❌ DON'T - Trust user input
exports.createUser = (req, res) => {
  const user = new User(req.body);  // Dangerous!
  user.save();
};

// ✅ DO - Validate everything
exports.createUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Check presence
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  // Check types
  if (typeof name !== 'string' || typeof email !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Fields must be strings'
    });
  }

  // Check format
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  // Check length constraints
  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Name must be 2-100 characters'
    });
  }

  // Proceed with creation
  const user = new User({ name, email, password });
  await user.save();
  
  res.status(201).json({ success: true, user });
};
```

### Validate Enum Values

```javascript
const ROLES = ['viewer', 'analyst', 'admin'];
const STATUSES = ['active', 'inactive'];

if (!ROLES.includes(role)) {
  return res.status(400).json({
    success: false,
    message: `Role must be one of: ${ROLES.join(', ')}`
  });
}
```

### Validate Arrays

```javascript
if (!Array.isArray(ids) || ids.length === 0) {
  return res.status(400).json({
    success: false,
    message: 'IDs must be a non-empty array'
  });
}
```

---

## 🧪 Debugging Failing Tests

### Test Fails: Status Code Mismatch

**Error**:
```
POST /api/auth/register
Expected: 201
Actual: 500
```

**Solution**:
1. Check server logs: `npm start` (and watch the output)
2. Run endpoint manually: `curl -X POST http://localhost:5000/api/auth/register ...`
3. Check MongoDB connection
4. Check environment variables

### Test Fails: Response Schema Mismatch

**Error**:
```
Response does not match schema
Expected: {success: boolean, user: {...}, token: string}
Actual: {user: {...}}
```

**Solution**:
```javascript
// ❌ Current (incomplete response)
res.json({ user: {...} });

// ✅ Fixed (matches spec)
res.json({
  success: true,
  user: {...},
  token: tokenValue
});
```

### Test Fails: Missing Required Field

**Error**:
```
Missing required field: email
```

**Solution**:
```javascript
// Make sure all required fields from spec are included
res.json({
  _id: user._id,
  name: user.name,
  email: user.email,        // ← Was missing
  role: user.role,
  status: user.status,
  createdAt: user.createdAt
});
```

### Test Fails: Invalid Enum Value

**Error**:
```
Field 'role' has invalid value 'superadmin'
Expected one of: ['viewer', 'analyst', 'admin']
```

**Solution**:
Check your code only returns valid enum values:
```javascript
// ❌ Wrong
const role = 'superadmin';

// ✅ Correct
const role = 'analyst';  // Must be from the enum
```

---

## 📊 Example Walkthrough: Complete Feature

### Feature: List Transactions with Filters

#### Step 1: Check the Spec

```yaml
GET /api/transactions:
  parameters:
    - name: category
      in: query
      enum: ['food', 'transport', 'utilities', 'entertainment']
    - name: type
      in: query
      enum: ['income', 'expense']
    - name: page
      in: query
      type: integer
      default: 1
    - name: limit
      in: query
      type: integer
      default: 10
  responses:
    200:
      properties:
        success: boolean
        transactions: array
        total: integer
        page: integer
        pages: integer
```

#### Step 2: Implement

```javascript
// server/controllers/transactionController.js
exports.listTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const category = req.query.category;
    const type = req.query.type;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Build filter
    const filter = { userId };
    if (category) filter.category = category;
    if (type) filter.type = type;

    // Query with pagination
    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Calculate pages
    const pages = Math.ceil(total / limit);

    // Return per spec
    res.json({
      success: true,
      transactions,
      total,
      page,
      pages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to list transactions'
    });
  }
};
```

#### Step 3: Create Test Examples

```json
// examples/transaction_list_all.json
{
  "http-request": {
    "method": "GET",
    "path": "/api/transactions",
    "headers": {
      "Authorization": "Bearer (string)"
    }
  },
  "http-response": {
    "status": 200,
    "body": {
      "success": true,
      "transactions": [
        {
          "_id": "(string)",
          "userId": "(string)",
          "description": "(string)",
          "amount": "(number)",
          "category": "(string)",
          "type": "(string)",
          "createdAt": "(datetime)"
        }
      ],
      "total": "(number)",
      "page": 1,
      "pages": "(number)"
    }
  }
}
```

```json
// examples/transaction_list_filtered.json
{
  "http-request": {
    "method": "GET",
    "path": "/api/transactions?category=food&type=expense",
    "headers": {
      "Authorization": "Bearer (string)"
    }
  },
  "http-response": {
    "status": 200,
    "body": {
      "success": true,
      "transactions": [
        {
          "_id": "(string)",
          "userId": "(string)",
          "description": "(string)",
          "amount": "(number)",
          "category": "food",
          "type": "expense",
          "createdAt": "(datetime)"
        }
      ],
      "total": "(number)",
      "page": 1,
      "pages": "(number)"
    }
  }
}
```

#### Step 4: Test

```bash
npm run test:contract
```

Both examples should pass ✅

---

## 🚀 Best Practices

### 1. Match Spec Exactly

```javascript
// ❌ Don't add extra fields not in spec
res.json({
  user: {...},
  timestamp: new Date(),  // Extra!
  internalId: 12345       // Extra!
});

// ✅ Only include spec fields
res.json({
  success: true,
  user: {...}
});
```

### 2. Use Consistent Status Codes

```javascript
// ✅ Standard status codes per REST
res.status(201).json({...});  // Created
res.status(200).json({...});  // OK
res.status(400).json({...});  // Bad request
res.status(401).json({...});  // Unauthorized
res.status(403).json({...});  // Forbidden
res.status(404).json({...});  // Not found
res.status(500).json({...});  // Server error
```

### 3. Use Consistent Error Format

```javascript
// ✅ Always follow same error structure
res.status(400).json({
  success: false,
  error: 'ERROR_CODE',      // Machine readable
  message: 'Human message'   // Human readable
});
```

### 4. Test Before Merging

Always run contract tests before committing:

```bash
npm run test:contract
npm run test:contract:validate
```

### 5. Add Examples for Edge Cases

```json
// examples/auth_register_weak_password.json - Validation error
// examples/user_not_found.json - 404 case
// examples/insufficient_permissions.json - 403 case
```

---

## 📋 Changelog: When Changing the API

### Minor Changes (Backward Compatible)

✅ Add new optional field
```yaml
# Old schema
name: string
role: string

# New schema (optional field added)
name: string
role: string
department: string (optional)  # ← New, optional
```

✅ Add new status code
```yaml
responses:
  201: ...  # Existing
  202: ...  # ← New status code
```

### Major Changes (Breaking)

❌ Remove required field
❌ Change status code
❌ Change response structure
❌ Change field type

**For breaking changes**:
1. Increment version in spec: `version: 2.0.0`
2. Consider new endpoint: `/api/v2/users`
3. Update documentation
4. Notify consumers
5. Provide migration guide

---

## 🧪 Contract Test Commands

```bash
# Validate spec syntax
npm run test:contract:validate

# Run all contract tests (verbose)
npm run test:contract:verbose

# Run contract tests (quiet)
npm run test:contract

# Run specific test file
npm run test:contract examples/auth_login.json
```

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] All contract tests pass
- [ ] OpenAPI spec is valid
- [ ] Example test data covers happy paths and error cases
- [ ] Error responses follow the standard format
- [ ] Status codes are correct per REST standards
- [ ] Required fields are always returned
- [ ] Response formats match spec exactly
- [ ] Authentication endpoints are secure
- [ ] Rate limiting is in place
- [ ] Logging is configured
- [ ] Monitoring is configured

---

## 📚 Related Resources

- [Specademy Integration Guide](./SPECADEMY_INTEGRATION_GUIDE.md) - Overview
- [Frontend Consumer Guide](./CONSUMER_DRIVEN_DEVELOPMENT.md) - How frontend uses the API
- [OpenAPI Spec](./specs/openapi.yaml) - Full reference
- [Quick Start](./QUICK_START.md) - General setup

---

**Remember**: The spec is the source of truth. Your implementation must honor it completely!
