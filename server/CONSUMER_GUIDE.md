# Contract-Based Frontend Development

## For Frontend/Consumer Teams

This guide explains how to use the API contract to develop your frontend independently without waiting for the backend to be fully implemented.

---

## 🎯 Overview

The backend is now developed using **Contract-Driven Development**. This means:

1. **API Contract is Source of Truth**: The `specs/openapi.yaml` defines exactly what the API will do
2. **Frontend Can Work in Parallel**: Use the mocked API while backend is being implemented
3. **Guaranteed Compatibility**: Your frontend code will work with the real API
4. **Early Error Detection**: Catch integration issues before deployment

---

## 🚀 Getting Started with Mock API

### Start the Mock Server

```bash
cd server

# Install dependencies (first time only)
npm install

# Start the mock server
npm run mock
# Mock API runs on http://localhost:8080
```

### Use Mock API in Your Frontend

Update your API configuration:

```javascript
// src/config.js
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// During development
const API_BASE_URL = 'http://localhost:8080'; // Mock server

// In production
const API_BASE_URL = 'https://api.aimoneymentor.com'; // Real server
```

### Update API Client

```javascript
// src/services/api.js
const API_BASE_URL = 'http://localhost:8080';

export const authService = {
  register: (name, email, password) => 
    fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    }).then(r => r.json()),

  login: (email, password) =>
    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(r => r.json())
};
```

---

## 📖 API Documentation

### Interactive API Documentation

View the interactive API spec:

1. **Option A**: Using Swagger UI
   ```bash
   # After starting mock server
   open http://localhost:8080/api-docs
   ```

2. **Option B**: Using Swagger Online Editor
   - Go to https://editor.swagger.io/
   - Click "File" → "Import URL"
   - Paste: `http://localhost:5000/specs/openapi.yaml`

3. **Option C**: Read Raw Spec
   ```bash
   # View the OpenAPI spec
   cat server/specs/openapi.yaml
   ```

---

## 🔐 Authentication

### JWT Tokens

All protected endpoints require JWT token in Authorization header:

```javascript
const token = localStorage.getItem('authToken');

fetch('/api/transactions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Getting a Token

Use the mock API to get a test token:

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response includes token:
```json
{
  "success": true,
  "user": { /* user object */ },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 📚 API Endpoints Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/google` | Google OAuth login |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/me` | Get current user | ✓ |
| GET | `/api/users` | List all users | Admin |
| POST | `/api/users` | Create user | Admin |
| PATCH | `/api/users/{id}` | Update user | Admin |

### Transactions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/transactions` | Get user's transactions | ✓ |
| POST | `/api/transactions` | Add transaction | ✓ |
| GET | `/api/transactions/summary` | Get summary (income/expense) | ✓ |
| PUT | `/api/transactions/{id}` | Update transaction | ✓ |
| DELETE | `/api/transactions/{id}` | Delete transaction | ✓ |

### AI Advisor

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai/chat` | Get financial advice | ✓ |

---

## 💻 Example: Building a Login Form

```javascript
// Login.js
import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Save token
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Navigate to dashboard
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

---

## 🧪 Testing with Mock Data

### Using Postman

1. **Import OpenAPI Spec**:
   - Open Postman → Collections → Import
   - Select "Link" tab
   - Paste: `http://localhost:5000/specs/openapi.yaml`

2. **Select Mock Environment**:
   - Create new environment variable:
     ```
     api_url: http://localhost:8080
     token: (paste token from login)
     ```

3. **Make Requests**:
   ```
   GET {{api_url}}/api/users/me
   Header: Authorization: Bearer {{token}}
   ```

### Using curl

```bash
# Register
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123"
  }')

TOKEN=$(echo $TOKEN_RESPONSE | jq -r '.token')

# Get profile using token
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔄 Switching to Real API

When backend is ready:

```javascript
// Update config
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.aimoneymentor.com'
  : 'http://localhost:5000'; // Real backend during dev
```

**No other code changes needed!** ✓

---

## ❌ Error Handling

The API returns standard error responses:

```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "Email or password incorrect"
}
```

### Common Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Fix request data |
| 401 | Unauthorized | Get new token or login |
| 403 | Forbidden | Check user permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Retry or contact backend |

---

## 📋 Checklist: Before Connecting to Real API

- [ ] All API calls working with mock API
- [ ] Error handling implemented for all endpoints
- [ ] Authentication token properly managed
- [ ] CORS configuration ready (if needed)
- [ ] Environment variables configured correctly
- [ ] Loading states shown while fetching
- [ ] User feedback for errors and success
- [ ] API calls use correct methods (GET, POST, etc.)
- [ ] Request/response data matches OpenAPI spec
- [ ] Token refresh handled (if expired)

---

## 🚀 Tips for Success

1. **Use the Mock Server During Development**
   ```bash
   npm run mock  # In server directory
   ```

2. **Validate Against the Spec**
   - Before sending requests, check the spec
   - Ensure required fields are included
   - Use correct HTTP methods

3. **Keep Authentication Simple at First**
   ```javascript
   // Store token in localStorage during development
   localStorage.setItem('token', response.token);
   ```

4. **Handle Errors Gracefully**
   ```javascript
   .catch(error => console.error('API Error:', error))
   ```

5. **Mock Errors for Testing UI**
   ```javascript
   // Simulate 401 error
   if (mockError) {
     return Promise.reject({ status: 401 });
   }
   ```

---

## 🐛 Debugging

### Enable Debug Logging

```javascript
// src/config.js
export const DEBUG = true;

// In API client
if (DEBUG) {
  console.log('Request:', method, url, body);
  console.log('Response:', response);
}
```

### Network Inspection

1. Open Browser DevTools (F12)
2. Go to "Network" tab
3. Make API call
4. Click request to see:
   - Request headers and body
   - Response status and data
   - Response time

### Common Issues

| Issue | Solution |
|-------|----------|
| CORS error | Use same origin or enable CORS |
| 401 error | Token expired, login again |
| 400 error | Missing required fields |
| Mock server not responding | Check `npm run mock` is running |

---

## 📞 Support

- **API Spec Issues**: Check `server/specs/openapi.yaml`
- **Contract Questions**: Read `server/SPEC_DRIVEN_DEVELOPMENT.md`
- **Backend Help**: Contact backend team

---

## 🔗 Useful Links

- OpenAPI Spec: `server/specs/openapi.yaml`
- Full Guide: `server/SPEC_DRIVEN_DEVELOPMENT.md`
- Quick Reference: `server/QUICK_START.md`

---

**Remember**: The API contract is your guarantee that your frontend will work with the real API! ✓
