# Specademy: Spec Driven Development Integration Guide
## AI Money Mentor Project

**Last Updated**: 2026-06-16  
**Status**: Complete Specademy Integration

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Specademy Principles](#specademy-principles)
3. [Project Structure](#project-structure)
4. [Quick Start](#quick-start)
5. [Consumer-Driven Contracts](#consumer-driven-contracts)
6. [Contract Testing](#contract-testing)
7. [Mock API for Frontend](#mock-api-for-frontend)
8. [CI/CD Integration](#cicd-integration)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)
11. [Resources](#resources)

---

## Overview

This guide implements **Specademy's Spec Driven Development** methodology in the AI Money Mentor project. Spec Driven Development (SDD) is a collaborative approach where:

- 📝 **API contracts** are defined upfront in OpenAPI
- 🚀 **Frontend and backend** develop in parallel
- ✅ **Contract tests** ensure compliance and catch breaking changes early
- 📚 **Living documentation** is always in sync with implementation
- 🎯 **Consumer needs** drive API design

### Benefits

| Benefit | Impact |
|---------|--------|
| **Parallel Development** | Frontend doesn't wait for backend; backend doesn't wait for frontend requirements |
| **Early Feedback** | Catch integration issues before they reach production |
| **Living Documentation** | API spec is always the source of truth |
| **Quality Assurance** | Automated validation of every API response |
| **Consumer Focus** | API design driven by consumer needs, not just provider convenience |
| **Reduced Rework** | Clear contracts prevent surprise breaking changes |

---

## Specademy Principles

### 1. **Contract-First Development**
The API contract (OpenAPI spec) is created **before implementation begins**. This enables:
- Frontend team to use mock API immediately
- Backend team to understand exact requirements
- Clear communication between teams

### 2. **Consumer-Driven Contracts (CDC)**
The consumer defines what they need. Providers must honor the contract.

**Workflow**:
1. Consumer specifies requirements → OpenAPI spec
2. Provider implements against the spec
3. Specmatic validates provider conforms
4. Both teams work in parallel

### 3. **Living Documentation**
The OpenAPI spec is the single source of truth. It:
- Lives with the code (version controlled)
- Gets reviewed like code (via pull requests)
- Evolves with the API

### 4. **Shift-Left Testing**
Contract tests run early and often:
- Before implementation is done
- On every code change (CI/CD)
- Against both mock and real implementations

### 5. **Provider-Consumer Separation**
Clear roles and responsibilities:
- **Provider (Backend)**: Implements and publishes the contract
- **Consumer (Frontend)**: Uses the contract to develop against mock API
- **Both**: Use contract tests for integration validation

---

## Project Structure

```
ai-money-mentor/
├── server/
│   ├── specs/
│   │   └── openapi.yaml                    ← 📝 THE CONTRACT
│   ├── specmatic.yaml                      ← 🧪 Test Configuration
│   ├── examples/                           ← 📊 Contract Test Data
│   │   ├── auth_register.json
│   │   ├── auth_login.json
│   │   ├── user_profile.json
│   │   ├── transaction_add.json
│   │   ├── transaction_list.json
│   │   ├── transaction_summary.json
│   │   └── ai_chat.json
│   ├── controllers/                        ← Implementation
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── server.js                           ← Main app
│   ├── package.json                        ← Scripts & dependencies
│   ├── .env                                ← Configuration
│   └── README_SPEC_DRIVEN_DEV.md
│
├── client/
│   └── src/
│       └── ...                             ← Uses mock API during dev
│
└── .github/
    └── workflows/
        └── contract-tests.yml              ← CI/CD Pipeline (recommended)
```

### Key Files

| File | Purpose | Owner | Usage |
|------|---------|-------|-------|
| `specs/openapi.yaml` | API Contract | Both teams (consensus) | Reference for all API interactions |
| `specmatic.yaml` | Test Configuration | Backend | Configures how tests run |
| `examples/*.json` | Test Data | Backend (with frontend input) | Provides realistic test scenarios |
| `controllers/` | API Implementation | Backend | Implements the contract |
| `client/src/` | Frontend App | Frontend | Consumes the API |

---

## Quick Start

### For Backend Developers

#### 1. Start the Server
```bash
cd server
npm install
npm start
```

The server runs on `http://localhost:5000`

#### 2. Run Contract Tests
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
... (all tests pass)
```

**What Happens**: Specmatic reads the OpenAPI spec and runs tests using the example data. It validates that:
- Requests match the spec
- Responses match the spec
- Status codes are correct
- Response schemas are valid

#### 3. Validate the Spec
```bash
npm run test:contract:validate
```

Ensures the OpenAPI spec itself is valid before running tests.

---

### For Frontend Developers

#### 1. Start the Mock API
```bash
cd server
npm install
npm run mock
```

The mock API runs on `http://localhost:8080` and serves responses based on the OpenAPI spec.

#### 2. Use in Your Frontend Code
```javascript
// client/src/config.js
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.aimoneymentor.com'
  : 'http://localhost:8080'; // Mock API during development

export const api = {
  register: (userData) => 
    fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }),
  // ... other endpoints
};
```

#### 3. No Backend Required
You can develop the entire frontend without the backend running. The mock API returns realistic responses.

---

## Consumer-Driven Contracts

### Process

```
Frontend Team                    Backend Team
─────────────────────────────────────────────
1. Identify API needs    ──────>
2. Create PR with spec    ───────> Review & discuss
                          <────── Feedback/suggestions
3. Spec approved (merge)
4. Frontend develops           Backend implements
   against mock API            against spec
                               5. Run contract tests
                               6. Confirm compliance
                               
7. Integration testing
8. Deploy together
```

### Step-by-Step: Adding a New Endpoint

#### Frontend Says "We need..."
```
Endpoint: POST /api/transactions
Purpose: Record a financial transaction
```

#### 1. **Backend Creates Spec** (with frontend input)

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
            required:
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
                example: "food"
              type:
                type: string
                enum: ['income', 'expense']
                example: "expense"
    responses:
      201:
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

#### 2. **Frontend Uses Mock API**

```javascript
// client/src/services/transactionService.js
const createTransaction = async (data) => {
  const response = await fetch('http://localhost:8080/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      description: data.description,
      amount: data.amount,
      category: data.category,
      type: data.type
    })
  });
  
  return response.json();
};

// Use it
const result = await createTransaction({
  description: "Grocery shopping",
  amount: 45.99,
  category: "food",
  type: "expense"
});
```

#### 3. **Backend Implements**

```javascript
// server/controllers/transactionController.js
exports.createTransaction = async (req, res) => {
  const { description, amount, category, type } = req.body;
  
  // Validation per spec
  if (!description || !amount || !category || !type) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields' 
    });
  }
  
  // Create and save
  const transaction = new Transaction({
    userId: req.user.id,
    description,
    amount,
    category,
    type
  });
  
  await transaction.save();
  
  res.status(201).json({
    success: true,
    transaction
  });
};
```

#### 4. **Backend Creates Test Example**

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
        "createdAt": "(string)"
      }
    }
  }
}
```

#### 5. **Run Contract Tests**

```bash
npm run test:contract
```

If it passes ✅, the implementation matches the contract!

---

## Contract Testing

### How Specmatic Contract Tests Work

```
OpenAPI Spec              Example Data              Implementation
      │                        │                           │
      │   Specmatic reads      │                           │
      ├────────────────────────┼───────────────────────────┤
      │                        │                           │
      ▼                        ▼                           ▼
 Endpoints            Test scenarios              Running Server
 Request/Response     Request/Response            (http://localhost:5000)
 Schemas              Examples
      │
      ├── Generate tests from spec
      ├── Use example data as test cases
      ├── Send requests to running server
      ├── Validate responses against spec
      │
      └── Report: ✅ PASS or ❌ FAIL
```

### Running Tests

#### Basic Test Run
```bash
cd server
npm run test:contract
```

#### Verbose Output (for debugging)
```bash
npm run test:contract:verbose
```

#### Validate Spec Only (no running server needed)
```bash
npm run test:contract:validate
```

### Understanding Test Results

**✅ PASS - Example**
```
✅ POST /api/auth/register - PASSED
  Request: {"name": "John Doe", "email": "john@example.com", "password": "password123"}
  Response: 201 - {"success": true, "user": {...}, "token": "..."}
  ✓ Status code matches
  ✓ Response schema matches
```

**❌ FAIL - Example**
```
❌ POST /api/auth/register - FAILED
  Expected status code: 201
  Actual status code: 500
  Error: Database connection failed
  
  Fix: Check MongoDB connection string in .env
```

### Adding More Test Coverage

Create new files in `examples/` directory:

```json
// examples/user_update.json
{
  "http-request": {
    "method": "PATCH",
    "path": "/api/users/507f1f77bcf86cd799439011",
    "headers": {
      "Authorization": "Bearer (string)"
    },
    "body": {
      "role": "analyst",
      "status": "inactive"
    }
  },
  "http-response": {
    "status": 200,
    "body": {
      "success": true,
      "user": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "(string)",
        "email": "(string)",
        "role": "analyst",
        "status": "inactive",
        "createdAt": "(string)"
      }
    }
  }
}
```

Specmatic automatically picks it up and runs tests!

---

## Mock API for Frontend

### Why Mock API?

| Scenario | Mock API | Real API |
|----------|----------|----------|
| **Development** | ✅ Works immediately | ❌ Backend not ready |
| **Demos** | ✅ No setup needed | ❌ Requires full stack |
| **Testing** | ✅ Predictable responses | ❌ Network issues |
| **CI/CD** | ✅ Fast, reliable | ❌ External dependency |

### Starting the Mock API

```bash
cd server
npm run mock
```

Output:
```
🚀 Mock API server started on http://localhost:8080
📖 Spec: ./specs/openapi.yaml
⏱️ Ready to serve requests based on your API specification
```

### Using in Frontend

#### Option 1: Environment Variables

```javascript
// client/.env.development
REACT_APP_API_URL=http://localhost:8080

// client/.env.production
REACT_APP_API_URL=https://api.aimoneymentor.com
```

```javascript
// client/src/config.js
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
```

#### Option 2: Conditional Based on Environment

```javascript
// client/src/services/apiClient.js
const baseURL = process.env.NODE_ENV === 'production'
  ? 'https://api.aimoneymentor.com'
  : 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL,
  timeout: 5000
});
```

### Mock API Behavior

The mock API:
- ✅ Returns valid responses matching the spec
- ✅ Respects request/response schemas
- ✅ Validates request data
- ✅ Returns appropriate status codes
- ❌ Does NOT persist data (stateless)
- ❌ Does NOT run business logic

### Example: Testing with Mock API

```javascript
// test/api.integration.test.js
describe('API Integration with Mock', () => {
  beforeAll(() => {
    // Point to mock API
    process.env.REACT_APP_API_URL = 'http://localhost:8080';
  });

  test('should register a user', async () => {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.user.email).toBe('test@example.com');
    expect(data.token).toBeDefined();
  });
});
```

---

## CI/CD Integration

### Why CI/CD for Contract Tests?

✅ **Automated Validation** - Every commit is tested  
✅ **Fail Fast** - Breaking changes caught immediately  
✅ **Quality Gate** - Prevents merging broken specs or implementations  
✅ **Documentation** - Test results show spec compliance  

### GitHub Actions Pipeline

Create `.github/workflows/contract-tests.yml`:

```yaml
name: Contract Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  contract-tests:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:latest
        options: >-
          --health-cmd mongo
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd server
          npm install
      
      - name: Validate OpenAPI Spec
        run: |
          cd server
          npm run test:contract:validate
      
      - name: Start server
        run: |
          cd server
          npm start &
          sleep 5
        env:
          MONGO_URI: mongodb://localhost:27017/aimoneymentor
          JWT_SECRET: test-secret
      
      - name: Run contract tests
        run: |
          cd server
          npm run test:contract
        env:
          APP_URL: http://localhost:5000
      
      - name: Report results
        if: always()
        run: |
          echo "✅ Contract tests completed"
          echo "Check logs for details"
```

### Docker-based CI/CD

Alternatively, use Docker for easier setup:

```bash
# Run tests in isolated Docker environment
cd server
docker-compose -f docker-compose.test.yml up --exit-code-from test
```

### Quality Gates

Add these checks to your PR requirements:

1. ✅ Spec validation passes
2. ✅ Contract tests pass
3. ✅ No breaking changes to API
4. ✅ Documentation updated

---

## Best Practices

### 1. **Keep Spec and Implementation in Sync**

**❌ Don't**:
```javascript
// Response doesn't match spec
exports.getUser = (req, res) => {
  res.json({
    user: { id: 123 } // Missing required fields!
  });
};
```

**✅ Do**:
```javascript
// Matches spec exactly
exports.getUser = (req, res) => {
  res.json({
    success: true,
    user: {
      id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    }
  });
};
```

### 2. **Version Your API**

```yaml
info:
  version: 1.0.0  # Increment when making breaking changes

paths:
  /api/v1/users:  # Consider versioning in path for major versions
    get: ...
```

### 3. **Document Response Examples**

```yaml
responses:
  200:
    description: User retrieved successfully
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/User'
        examples:
          full:
            summary: User with all fields
            value:
              _id: "507f1f77bcf86cd799439011"
              name: "John Doe"
              email: "john@example.com"
              role: "analyst"
              status: "active"
              createdAt: "2024-01-15T10:30:00Z"
```

### 4. **Use Meaningful Error Codes**

**❌ Poor**:
```javascript
res.status(500).json({ msg: 'Error' });
```

**✅ Good**:
```javascript
res.status(400).json({ 
  success: false,
  error: 'INVALID_EMAIL',
  message: 'Email is not valid'
});
```

### 5. **Schema Consistency**

Always define reusable schemas in `components/schemas`:

```yaml
components:
  schemas:
    User:
      type: object
      required:
        - _id
        - name
        - email
        - role
        - status
      properties:
        _id:
          type: string
        name:
          type: string
        email:
          type: string
          format: email
        role:
          type: string
          enum: ['viewer', 'analyst', 'admin']
        status:
          type: string
          enum: ['active', 'inactive']
        createdAt:
          type: string
          format: date-time

    Transaction:
      type: object
      required:
        - _id
        - userId
        - description
        - amount
        - category
        - type
      properties:
        _id:
          type: string
        userId:
          type: string
        description:
          type: string
        amount:
          type: number
          minimum: 0
        category:
          type: string
          enum: ['food', 'transport', 'utilities', 'entertainment']
        type:
          type: string
          enum: ['income', 'expense']
        createdAt:
          type: string
          format: date-time
```

### 6. **Example Data Pattern Matching**

In `examples/*.json`, use patterns for dynamic values:

```json
{
  "http-response": {
    "status": 200,
    "body": {
      "_id": "(string)",           // Any string
      "email": "(email)",          // Valid email format
      "amount": "(number)",        // Any number
      "createdAt": "(datetime)",   // ISO 8601 date
      "active": "(boolean)"        // true or false
    }
  }
}
```

---

## Troubleshooting

### Issue: Contract Tests Fail with "Connection Refused"

**Cause**: Server not running

**Solution**:
```bash
# Terminal 1: Start server
cd server
npm start

# Terminal 2: Run tests (after server is up)
npm run test:contract
```

### Issue: Mock API Returns 404

**Cause**: Spec doesn't match request path

**Solution**:
1. Check the exact path in `openapi.yaml`
2. Verify request URL matches exactly
3. Run validation: `npm run test:contract:validate`

### Issue: Example File Not Being Picked Up

**Cause**: Wrong file format or location

**Solution**:
- Files must be in `examples/` directory
- Must be valid JSON
- Must have `http-request` and `http-response` properties
- Path must match spec exactly

### Issue: "Unauthorized" on Authenticated Endpoints

**Cause**: Mock API doesn't validate tokens

**Solution**:
- Mock API doesn't validate JWT tokens
- Use any string for `Authorization` header
- Use test token: `Bearer test-token-123`

### Issue: Schema Validation Fails

**Cause**: Response doesn't match spec schema

**Solution**:
```javascript
// ❌ Missing required field
res.json({ name: 'John' });

// ✅ Includes all required fields
res.json({
  success: true,
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt
  }
});
```

---

## Advanced Topics

### Backward Compatibility

When updating the spec:

```yaml
# ✅ SAFE - Backward compatible
- Add new optional field
- New response status code (201, 202)
- Deprecate endpoint

# ❌ BREAKING - Not backward compatible
- Remove required field
- Change existing status code (200 → 201)
- Change request/response schema
- Rename field
```

### Matchers for Complex Data

Use special matchers in examples:

```json
{
  "http-request": {
    "method": "POST",
    "path": "/api/transactions",
    "body": {
      "amount": "(number)",
      "category": "(string)"
    }
  },
  "http-response": {
    "status": 201,
    "body": {
      "_id": "(string)",
      "createdAt": "(datetime)"
    }
  }
}
```

### Conditional Examples

Test multiple scenarios:

```
examples/
├── auth_register_success.json        # Happy path
├── auth_register_duplicate_email.json # Error case
├── auth_register_weak_password.json  # Validation error
└── auth_register_missing_fields.json # Missing data
```

---

## Resources

### Official Documentation
- [Specmatic Documentation](https://specmatic.io)
- [OpenAPI 3.0 Spec](https://spec.openapis.org/oas/v3.0.3)
- [Specademy Learning Platform](https://specademy.io)

### Contract Testing Patterns
- Consumer-Driven Contracts (CDC)
- Provider Contracts
- Sync vs Async Contract Testing

### Related Tools
- **Specmatic**: Contract testing framework
- **Swagger UI**: Interactive spec documentation
- **Insomnia/Postman**: Manual API testing
- **Prism**: Alternative mock server

### Team Guides
- [Backend Developer Guide](./SPEC_DRIVEN_DEVELOPMENT.md)
- [Frontend Developer Guide](./CONSUMER_GUIDE.md)
- [Quick Start](./QUICK_START.md)

---

## Checklist: Contract-First Development

### Before Implementation
- [ ] Spec reviewed and approved by both teams
- [ ] Example test cases created
- [ ] Mock API validated
- [ ] Frontend can work against mock

### During Development
- [ ] Contract tests pass on every commit
- [ ] Examples cover success and error cases
- [ ] Response schemas match exactly
- [ ] Status codes are correct

### Before Integration
- [ ] Spec validation passes
- [ ] All contract tests pass
- [ ] No breaking changes
- [ ] Documentation updated
- [ ] Both teams tested together

### Before Deployment
- [ ] CI/CD pipeline successful
- [ ] Production spec matches implementation
- [ ] Rollback plan documented
- [ ] Team trained on spec-driven approach

---

## Getting Help

**Questions about the spec?**
→ Check `specs/openapi.yaml`

**Frontend not connecting?**
→ See [CONSUMER_GUIDE.md](./CONSUMER_GUIDE.md)

**Backend tests failing?**
→ See [SPEC_DRIVEN_DEVELOPMENT.md](./SPEC_DRIVEN_DEVELOPMENT.md)

**Need to add an endpoint?**
→ Follow the [Consumer-Driven Contracts](#consumer-driven-contracts) section

**Contact**: Reach out to your team's API lead

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-06-16 | 1.0 | Initial Specademy integration guide |

---

**Remember**: The specification is the contract. Keep it updated, and everything else follows!
