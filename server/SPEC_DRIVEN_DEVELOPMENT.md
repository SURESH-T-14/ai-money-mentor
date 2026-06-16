# Spec Driven Development Integration Guide

## AI Money Mentor - OpenAPI & Specmatic Integration

This guide explains how Spec Driven Development has been integrated into the AI Money Mentor project using OpenAPI specifications and Specmatic contract testing.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Key Concepts](#key-concepts)
5. [Running Contract Tests](#running-contract-tests)
6. [API Specification](#api-specification)
7. [Writing Test Examples](#writing-test-examples)
8. [CI/CD Integration](#cicd-integration)
9. [Best Practices](#best-practices)
10. [Resources](#resources)

---

## Overview

Spec Driven Development (SDD) is a methodology that places the API specification at the center of development. This approach:

- **Ensures API contracts are explicit and agreed upon** before development starts
- **Enables parallel development** of consumer and provider services
- **Provides early feedback** through contract testing
- **Improves API quality** and reduces integration issues
- **Acts as living documentation** for the API

The AI Money Mentor project now uses:
- **OpenAPI 3.0** for API specification
- **Specmatic** for contract testing and service virtualization
- **Example-driven test data** for comprehensive coverage

---

## Project Structure

```
server/
├── specs/
│   └── openapi.yaml              # Main OpenAPI specification
├── specmatic.yaml                # Specmatic configuration
├── examples/                      # Contract test examples
│   ├── auth_register.json
│   ├── auth_login.json
│   ├── user_profile.json
│   ├── transaction_add.json
│   ├── transaction_list.json
│   ├── transaction_summary.json
│   └── ai_chat.json
├── controllers/                   # Implementation
├── models/
├── routes/
├── middleware/
└── server.js
```

---

## Getting Started

### Prerequisites

- Node.js (v14+)
- Docker (for running Specmatic)
- Specmatic CLI installed globally or locally

### Installation

1. **Install Specmatic CLI** (if not already installed):
   ```bash
   npm install -g @specmatic/cli
   # or
   npm install --save-dev @specmatic/cli
   ```

2. **Install server dependencies**:
   ```bash
   cd server
   npm install
   ```

3. **Verify OpenAPI specification**:
   ```bash
   specmatic validate ./specs/openapi.yaml
   ```

---

## Key Concepts

### 1. API Specification (openapi.yaml)

The OpenAPI specification defines:
- **Endpoints**: All available API routes
- **Request schemas**: Expected input formats, required fields, data types
- **Response schemas**: Expected output formats and status codes
- **Security**: Authentication mechanisms (JWT Bearer tokens)
- **Examples**: Sample request/response pairs

**Location**: `server/specs/openapi.yaml`

### 2. Contract Testing

Contract testing verifies that:
- The provider (server) implementation matches the OpenAPI spec
- Request/response structures conform to the specification
- HTTP status codes are correct
- Data types and constraints are enforced

**Examples**: `server/examples/*.json`

### 3. Test Examples

Each example file contains:
- **http-request**: The request to send
- **http-response**: Expected response structure and values

Specmatic generates tests from these examples to validate the API implementation.

**Example structure**:
```json
{
  "http-request": {
    "method": "POST",
    "path": "/api/auth/login",
    "body": {
      "email": "user@example.com",
      "password": "password123"
    }
  },
  "http-response": {
    "status": 200,
    "body": {
      "success": true,
      "user": { /* user object */ },
      "token": "(string)"
    }
  }
}
```

---

## Running Contract Tests

### Start the Server

```bash
cd server
npm install
npm start
# Server runs on http://localhost:5000
```

### Run Specmatic Tests

**In a new terminal:**

```bash
cd server

# Run contract tests against the running server
specmatic test

# Or with specific configuration
specmatic test --spec specs/openapi.yaml --examples examples/

# Run with contract validation only (no examples)
specmatic test --spec specs/openapi.yaml

# Run with verbose output
specmatic test --verbose
```

### Run Tests with Docker

For isolated testing environment:

```bash
# Create a docker-compose.yaml for the server and tests
docker-compose up
```

### Expected Output

Successful test run:
```
✓ Auth - Register User
✓ Auth - Login User
✓ User - Get Profile
✓ Transaction - Add Transaction
✓ Transaction - List Transactions
✓ Transaction - Get Summary
✓ AI - Chat Advisor
```

---

## API Specification

### Authentication Endpoints

#### Register
- **POST** `/api/auth/register`
- Register a new user with name, email, and password
- Returns user object and JWT token

#### Login
- **POST** `/api/auth/login`
- Authenticate with email and password
- Returns user object and JWT token

#### Google OAuth
- **POST** `/api/auth/google`
- Authenticate using Google OAuth token
- Returns user object and JWT token

### User Management Endpoints

#### Get Current Profile
- **GET** `/api/users/me`
- Requires authentication
- Returns current user's profile

#### List Users (Admin)
- **GET** `/api/users`
- Requires admin role
- Returns all users

#### Create User (Admin)
- **POST** `/api/users`
- Requires admin role
- Creates new user with specified role

#### Update User (Admin)
- **PATCH** `/api/users/{id}`
- Requires admin role
- Updates user information

### Transaction Endpoints

#### Get Transactions
- **GET** `/api/transactions`
- Requires authentication
- Returns user's transactions

#### Add Transaction
- **POST** `/api/transactions`
- Requires authentication
- Creates new transaction

#### Get Summary
- **GET** `/api/transactions/summary`
- Requires authentication
- Returns income, expenses, balance, and breakdown by category

#### Update Transaction
- **PUT** `/api/transactions/{id}`
- Requires authentication
- Updates existing transaction

#### Delete Transaction
- **DELETE** `/api/transactions/{id}`
- Requires authentication
- Deletes transaction

### AI Advisor Endpoints

#### Chat with AI
- **POST** `/api/ai/chat`
- Requires authentication
- Send financial question, receive AI-powered advice and suggestions

---

## Writing Test Examples

### Adding New Test Case

1. **Create new example file** in `server/examples/`:
   ```json
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
           { /* transaction schema */ }
         ]
       }
     }
   }
   ```

2. **Use Specmatic matchers for dynamic values**:
   - `(string)` - Any string value
   - `(number)` - Any number
   - `(boolean)` - Any boolean
   - `(email)` - Valid email format
   - `(uuid)` - UUID format
   - `(date-time)` - ISO 8601 datetime
   - `(regex: pattern)` - Custom regex pattern

3. **Run tests** to validate:
   ```bash
   specmatic test
   ```

### Example: Testing Error Cases

```json
{
  "http-request": {
    "method": "POST",
    "path": "/api/auth/login",
    "body": {
      "email": "nonexistent@example.com",
      "password": "wrongpassword"
    }
  },
  "http-response": {
    "status": 401,
    "body": {
      "success": false,
      "message": "(string)"
    }
  }
}
```

---

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/contract-tests.yml`:

```yaml
name: Contract Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:5
        options: >-
          --health-cmd "mongosh --eval 'db.adminCommand(\"ping\")'"
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
      
      - name: Start server
        env:
          MONGO_URI: mongodb://localhost:27017/aimoneymentor
          PORT: 5000
        run: |
          cd server
          npm start &
          sleep 5
      
      - name: Install Specmatic
        run: npm install -g @specmatic/cli
      
      - name: Run contract tests
        run: |
          cd server
          specmatic test
```

### Manual Testing in CI

```bash
# Validate spec syntax
specmatic validate ./specs/openapi.yaml

# Run tests with coverage
specmatic test --coverage

# Generate HTML report
specmatic test --html-report
```

---

## Best Practices

### 1. Keep Specs in Sync

- Update `openapi.yaml` **before** implementing changes
- Run contract tests on every PR
- Use spec-first development approach

### 2. Comprehensive Examples

- Cover happy paths and error cases
- Include validation failures
- Test boundary conditions
- Example: negative amounts, invalid emails, missing required fields

### 3. Use Meaningful Names

```
✓ auth_register_success.json
✓ auth_login_invalid_credentials.json
✓ transaction_negative_amount.json
```

### 4. Document Constraints

In the spec:
- Mark required fields
- Set `minLength`, `maxLength` constraints
- Use `format` validators (email, uuid, date-time)
- Define enums for status fields

### 5. Version Your API

Include version in API spec:
```yaml
info:
  version: 1.0.0
```

Increment version when making breaking changes.

### 6. Security First

- Define authentication in security schemes
- Mark protected endpoints with `security: BearerAuth`
- Test authentication failures

### 7. Backward Compatibility

- Test changes don't break existing consumers
- Use Specmatic's backward compatibility testing
- Add new fields as optional

---

## Specmatic Features for AI Money Mentor

### 1. Contract Testing
Verify implementation matches specification
```bash
specmatic test
```

### 2. Service Virtualization
Mock the API for consumer testing
```bash
specmatic start --spec specs/openapi.yaml --port 8080
```

### 3. API Coverage
Check if all implemented endpoints are documented
```bash
specmatic coverage --spec specs/openapi.yaml
```

### 4. Backward Compatibility
Ensure changes don't break existing API consumers
```bash
specmatic backward-compatibility-check
```

---

## Troubleshooting

### Test Failure: "Path not found"
- Verify server is running on correct port
- Check `specmatic.yaml` has correct `baseUrl`
- Ensure routes are registered in `server.js`

### Test Failure: "Type mismatch"
- Check response field types match the spec
- Use Specmatic matchers correctly: `(string)`, `(number)`, etc.
- Verify example JSON syntax is valid

### Schema Validation Error
- Validate spec syntax: `specmatic validate ./specs/openapi.yaml`
- Check for missing required fields
- Ensure proper indentation in YAML

### Authorization Errors
- Verify token is being passed correctly
- Check `Authorization: Bearer token` format
- Ensure auth middleware is working

---

## Next Steps

1. **Run contract tests** to verify current implementation
2. **Add error case examples** for comprehensive coverage
3. **Integrate into CI/CD** pipeline
4. **Document API endpoints** for frontend team
5. **Use for consumer-driven testing** with client app
6. **Enable service mocking** for parallel frontend development

---

## Resources

- [Specmatic Documentation](https://docs.specmatic.in)
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.0)
- [Contract Testing](https://docs.specmatic.in/documentation/contract)
- [Specmatic CLI Reference](https://docs.specmatic.in/documentation/cli)
- [Best Practices for API Design](https://docs.specmatic.in/documentation/best-practices)

---

## Support & Questions

For questions about Specmatic integration:
1. Check [Specmatic Documentation](https://docs.specmatic.in)
2. Review examples in `server/examples/`
3. Run `specmatic help` for CLI options
4. Visit [Specmatic GitHub Issues](https://github.com/zeta-dev-store/specmatic/issues)

---

## Team Roles

### Frontend Team (Consumers)
- Use mocked API via `specmatic start`
- Validate requests match spec before sending
- Report missing or incorrect fields

### Backend Team (Providers)
- Implement endpoints according to spec
- Run `specmatic test` before commits
- Keep spec updated with changes
- Ensure backward compatibility

### QA/Testing Team
- Run contract tests in CI/CD
- Add new test examples
- Validate error cases
- Monitor API coverage

### API Design Team
- Create and maintain OpenAPI spec
- Review spec changes in PRs
- Ensure consistency across APIs
- Document security and authentication

---

**Created**: 2024
**Version**: 1.0
**Status**: Active Implementation
