# Specademy: Consumer-Driven Development Guide
## For Frontend Developers

---

## 🎯 Your Role in Spec-Driven Development

As a **consumer** (frontend developer), you're at the center of contract-first development:

1. **Define what you need** - Specify API requirements in OpenAPI
2. **Develop independently** - Use mock API immediately without waiting for backend
3. **Validate contracts** - Ensure backend meets your expectations
4. **Provide feedback** - Influence API design to match consumer needs

---

## 📋 Quick Start: 5 Minutes

### 1. Get the Mock API Running

```bash
cd server
npm install
npm run mock
```

The mock API starts on `http://localhost:8080`

### 2. Use It in Your Code

```javascript
// client/src/config.js
export const API_BASE_URL = 'http://localhost:8080';

// client/src/services/api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000
});

export const authService = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data)
};
```

### 3. That's It!

You can now develop your entire frontend without the backend running. The mock API provides realistic responses based on the OpenAPI spec.

---

## 🔍 Understanding the API Contract

The **OpenAPI specification** is your reference. It's located at:

```
server/specs/openapi.yaml
```

### What's in It?

```yaml
paths:
  /api/auth/register:          # Endpoint path
    post:                      # HTTP method
      summary: Register        # Human description
      requestBody:             # What you send
        schema:
          properties:
            name: string
            email: string
            password: string
      responses:
        201:                   # Success status
          schema:
            properties:
              success: boolean
              user: {...}
              token: string
        400:                   # Error status
          schema:
            properties:
              error: string
              message: string
```

### Example: Register a User

**From the spec:**
```yaml
POST /api/auth/register
Request:
  name: string
  email: string (email format)
  password: string (min 6 chars)
Response (201):
  success: true
  user: {_id, name, email, role, status, createdAt}
  token: string
```

**In your code:**
```javascript
const registerUser = async (name, email, password) => {
  try {
    const response = await api.post('/api/auth/register', {
      name,
      email,
      password  // Must be 6+ chars per spec
    });
    
    return {
      user: response.data.user,
      token: response.data.token
    };
  } catch (error) {
    // Handle per spec - 400 for validation, 500 for server
    console.error(error.response?.data?.message);
  }
};
```

---

## 🚀 Workflow: Request → Implementation → Integration

```
Your Need                Backend Implements         Integration
─────────────────────────────────────────────────────────────────

1. You request
   "POST /transactions"
   ↓
2. Backend adds to spec
   /api/transactions
   POST
   ↓
3. You test against mock
   (returns spec-based response)
   ↓
4. Backend implements
   + tests against spec
   ↓
5. Integration test
   (frontend + backend together)
```

### Step-by-Step Example: Adding a New Endpoint

#### Step 1: You Specify the Need

**Tell backend**: "I need to list transactions with filters and pagination"

#### Step 2: Backend Updates the Spec

Backend adds to `specs/openapi.yaml`:

```yaml
/api/transactions:
  get:
    summary: List transactions
    parameters:
      - name: category
        in: query
        schema:
          type: string
          enum: ['food', 'transport', 'utilities', 'entertainment']
      - name: type
        in: query
        schema:
          type: string
          enum: ['income', 'expense']
      - name: page
        in: query
        schema:
          type: integer
          default: 1
      - name: limit
        in: query
        schema:
          type: integer
          default: 10
    responses:
      200:
        schema:
          properties:
            transactions: array of Transaction
            total: integer
            page: integer
            pages: integer
```

#### Step 3: You Start Development Against Mock

```javascript
// client/src/pages/Transactions.js
import { api } from '../services/api';

export const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    category: 'food',
    type: 'expense',
    page: 1,
    limit: 10
  });

  useEffect(() => {
    // Call the mock API
    api.get('/api/transactions', { params: filters })
      .then(res => {
        setTransactions(res.data.transactions);
      });
  }, [filters]);

  return (
    <div>
      <h1>Transactions</h1>
      <FilterBar onChange={setFilters} />
      <TransactionList items={transactions} />
    </div>
  );
};
```

**The mock API returns:**
```json
{
  "transactions": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "description": "Groceries",
      "amount": 45.99,
      "category": "food",
      "type": "expense",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pages": 5
}
```

You can now develop filters, pagination, UI without the backend!

#### Step 4: Backend Implements

Backend developer writes the actual implementation and creates example test data.

#### Step 5: Integration

```bash
# Start backend
npm start

# Change API_BASE_URL in your code
export const API_BASE_URL = 'http://localhost:5000';

# Test together
npm start (from client)
```

---

## 🎭 Working with the Mock API

### What the Mock API Does ✅

- ✅ Returns responses matching the OpenAPI spec
- ✅ Validates your request against the spec
- ✅ Returns appropriate status codes (200, 201, 400, 401, etc.)
- ✅ Respects authentication headers (doesn't validate, just echoes)
- ✅ Returns data in the exact format specified

### What the Mock API Doesn't Do ❌

- ❌ Persist data (stateless - each response is fresh)
- ❌ Validate JWT tokens (any token is accepted)
- ❌ Run business logic (no actual calculations)
- ❌ Connect to database
- ❌ Execute complex workflows

### Using Auth with Mock API

```javascript
// Any token works
const token = 'any-string-here-works';

api.get('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Mock response (always succeeds):
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "analyst",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Error Responses

When you send invalid data, the mock API returns the error as specified:

```javascript
// Invalid email format
api.post('/api/auth/register', {
  name: 'John',
  email: 'invalid',  // Not an email!
  password: 'password123'
});

// Mock returns 400 (per spec):
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid email format"
}
```

---

## 📱 Complete Example: Build a Feature

Let's build a "Recent Transactions" widget using the mock API.

### 1. Define the Need (Discuss with Backend)

"I need the 5 most recent transactions for the dashboard"

### 2. Check the Spec

In `specs/openapi.yaml`, find:
```yaml
GET /api/transactions
  parameters:
    - name: limit
      type: integer
    - name: sort
      type: string (recent, oldest)
```

### 3. Develop Against Mock

```javascript
// client/src/components/RecentTransactions.js
import { useEffect, useState } from 'react';
import { api } from '../services/api';

export const RecentTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await api.get('/api/transactions', {
          params: {
            limit: 5,
            sort: 'recent'
          }
        });
        setTransactions(response.data.transactions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="recent-transactions">
      <h3>Recent Transactions</h3>
      <ul>
        {transactions.map(tx => (
          <li key={tx._id}>
            <span>{tx.description}</span>
            <span>${tx.amount}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### 4. Test with Mock

```bash
cd client
npm start
# Component shows mock data immediately
```

### 5. Integrate with Real Backend

When backend is ready:
```javascript
// client/src/config.js
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.example.com'
  : 'http://localhost:5000';  // Real backend
```

No code changes needed! The component works with both mock and real APIs.

---

## 🔐 Authentication with Mock API

### Mock Authentication Flow

The mock API doesn't validate tokens, so you can work with any token:

```javascript
// 1. "Register"
const registerRes = await api.post('/api/auth/register', {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});

const token = registerRes.data.token;  // Any string from mock

// 2. Store token
localStorage.setItem('token', token);

// 3. Use in authenticated requests
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// 4. Get user profile
const profileRes = await api.get('/api/users/me');
console.log(profileRes.data.user);  // Mock returns a user
```

### Real Authentication (with Backend)

When backend is running, authentication actually validates:

```javascript
// Credentials must be correct
const loginRes = await api.post('/api/auth/login', {
  email: 'john@example.com',
  password: 'password123'  // Must match registered password
});

// Invalid credentials return 401
```

---

## 🧪 Testing Your Consumer Implementation

### Unit Tests (Mock API)

```javascript
// client/src/__tests__/RecentTransactions.test.js
import { render, screen, waitFor } from '@testing-library/react';
import { RecentTransactions } from '../components/RecentTransactions';

// Mock the API
jest.mock('../services/api', () => ({
  api: {
    get: jest.fn(() => Promise.resolve({
      data: {
        transactions: [
          {
            _id: '1',
            description: 'Groceries',
            amount: 45.99
          }
        ]
      }
    }))
  }
}));

test('displays recent transactions', async () => {
  render(<RecentTransactions />);
  
  await waitFor(() => {
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('$45.99')).toBeInTheDocument();
  });
});
```

### Integration Tests (Real Mock API)

```javascript
// client/src/__tests__/integration.test.js
describe('Frontend Integration with Mock API', () => {
  beforeAll(() => {
    // Use actual mock API running on 8080
    process.env.REACT_APP_API_URL = 'http://localhost:8080';
  });

  test('can register and login', async () => {
    const registerRes = await fetch(
      'http://localhost:8080/api/auth/register',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
      }
    );

    const data = await registerRes.json();
    expect(registerRes.status).toBe(201);
    expect(data.token).toBeDefined();
  });
});
```

---

## 🔄 Environment Switching

### Development (Mock API)

```javascript
// client/.env.development
REACT_APP_API_URL=http://localhost:8080
```

### Staging (Real Backend)

```javascript
// client/.env.staging
REACT_APP_API_URL=http://staging-api.example.com
```

### Production

```javascript
// client/.env.production
REACT_APP_API_URL=https://api.example.com
```

---

## ❓ FAQ

### Q: Why use mock API if I could just wait for backend?

**A:** Because with mock API you can:
- Start immediately, don't wait for backend
- Develop in parallel with backend team
- Test edge cases and errors easily
- Verify your understanding of the API early
- Catch integration issues before they reach production

### Q: What if I need an endpoint that's not in the spec?

**A:** 
1. Create a GitHub issue describing the need
2. Discuss with backend team
3. Update the spec together
4. Regenerate the mock API
5. Continue developing

### Q: How do I test error cases with mock API?

**A:** Send invalid data and the mock will return the error response from the spec:

```javascript
// Test validation error
await api.post('/api/auth/register', {
  name: 'John',
  email: 'invalid',  // Wrong format
  password: 'pass'   // Too short
});

// Mock returns 400 with error details
```

### Q: Can I modify mock responses?

**A:** No, but you can:
- Add new test examples (in `server/examples/`)
- Update the spec (with team consensus)
- Ask backend to update example data
- Run the real backend instead

### Q: Why does mock API not persist data?

**A:** Because it's meant for **developing** frontend logic, not testing data persistence. For that, use the real backend or a test database.

---

## 🛠️ Troubleshooting

### Mock API Returns 404

**Cause**: Endpoint doesn't exist in spec

**Solution**:
```bash
cd server
npm run test:contract:validate  # Check spec is valid
```

### Getting CORS Errors

**Cause**: Browser blocking cross-origin requests

**Solution**: Use proxy in development:
```javascript
// client/package.json
{
  "proxy": "http://localhost:8080"
}
```

### Mock Returns Same Data Every Time

**That's expected!** Mock API is stateless. For stateful testing, use real backend.

### Can't Connect to Mock API

**Check**:
1. Is it running? `npm run mock`
2. Is it on port 8080? `curl http://localhost:8080`
3. Check firewall
4. Try `http://127.0.0.1:8080` instead of `http://localhost:8080`

---

## 📚 Related Resources

- [Specademy Integration Guide](./SPECADEMY_INTEGRATION_GUIDE.md) - Overview for all teams
- [Backend Developer Guide](./SPEC_DRIVEN_DEVELOPMENT.md) - How backend implements
- [OpenAPI Spec](./specs/openapi.yaml) - Full API reference
- [Quick Start](./QUICK_START.md) - General quick start

---

## ✅ Checklist: Frontend Development

- [ ] Mock API is running (`npm run mock`)
- [ ] Can call endpoints successfully
- [ ] Understand request/response format from spec
- [ ] Implemented with proper error handling
- [ ] Tested with mock API
- [ ] Ready for backend integration testing

---

**Remember**: The spec is the contract. It tells you exactly what the API will do. Use the mock API to develop confidently!
