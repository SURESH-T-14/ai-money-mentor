# Specademy: Contract Testing Best Practices
## Comprehensive Testing Guide

---

## 📚 Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Example Patterns](#example-patterns)
3. [Edge Cases](#edge-cases)
4. [Error Scenarios](#error-scenarios)
5. [Performance Considerations](#performance-considerations)
6. [CI/CD Best Practices](#cicd-best-practices)
7. [Debugging Tips](#debugging-tips)
8. [Advanced Techniques](#advanced-techniques)

---

## Testing Strategy

### Testing Pyramid

```
                    ▲
                   /|\
                  / | \
                 /  |  \
                /   |   \         E2E Tests (Few)
               /    |    \        Real frontend + Backend
              /     |     \       Real DB (if needed)
             ──────────────       ~5-10% of tests
            /       |       \
           /        |        \
          /         |         \   Integration Tests
         /          |          \  Multiple systems
        /           |           \ Mock parts
       ──────────────────────────  ~20-30% of tests
      /             |             \
     /              |              \
    /               |               \  Unit Tests (Most)
   /                |                \ Single components
  ───────────────────────────────────  ~60-70% of tests
```

### Specmatic's Role

Specmatic handles **Contract Tests**:
- Validates Provider (Backend) against the contract
- Tests at API boundary (HTTP level)
- Covers happy paths, errors, validation
- Acts as quality gate before integration

```
                    ▲
                   /|\
                  / | \
                 /  |  \
                /   |   \ ← E2E: Full system
               /    |    \
              /     |     \
             ──────────────
            /       |       \
           /        |        \ ← Integration: Spec + Backend
          /         |         \
         /          |          \
        ──────────────────────── ← Contract Tests (Specmatic) ✓
       /             |             \
      /              |              \ ← Unit Tests
     /               |               \
    ───────────────────────────────────
```

---

## Example Patterns

### Pattern 1: Success Cases (Happy Path)

**Purpose**: Verify normal operation works

```json
// examples/user_profile_success.json
{
  "http-request": {
    "method": "GET",
    "path": "/api/users/me",
    "headers": {
      "Authorization": "Bearer (string)"
    }
  },
  "http-response": {
    "status": 200,
    "body": {
      "success": true,
      "user": {
        "_id": "(string)",
        "name": "(string)",
        "email": "(email)",
        "role": "(string)",
        "status": "(string)",
        "createdAt": "(datetime)"
      }
    }
  }
}
```

**What This Tests**:
- ✓ Request with valid auth header succeeds
- ✓ Returns 200 status
- ✓ Response has required fields
- ✓ Field types are correct

### Pattern 2: Required Fields Validation

**Purpose**: Ensure backend validates required fields

```json
// examples/user_create_missing_name.json
{
  "http-request": {
    "method": "POST",
    "path": "/api/users",
    "headers": {
      "Authorization": "Bearer (string)"
    },
    "body": {
      "email": "test@example.com",
      "password": "password123"
      // ← Missing: name
    }
  },
  "http-response": {
    "status": 400,
    "body": {
      "success": false,
      "error": "VALIDATION_ERROR",
      "message": "(string)"
    }
  }
}
```

**What This Tests**:
- ✓ Missing required field is caught
- ✓ Returns 400 (bad request)
- ✓ Error structure matches spec

### Pattern 3: Format Validation

**Purpose**: Ensure format constraints are enforced

```json
// examples/user_register_invalid_email.json
{
  "http-request": {
    "method": "POST",
    "path": "/api/auth/register",
    "body": {
      "name": "John Doe",
      "email": "not-an-email",  // ← Invalid format
      "password": "password123"
    }
  },
  "http-response": {
    "status": 400,
    "body": {
      "success": false,
      "error": "VALIDATION_ERROR",
      "message": "(string)"
    }
  }
}
```

**What This Tests**:
- ✓ Email format is validated
- ✓ Invalid format rejected with 400
- ✓ Error response is proper

### Pattern 4: Enum Validation

**Purpose**: Ensure only valid enum values accepted

```json
// examples/transaction_invalid_category.json
{
  "http-request": {
    "method": "POST",
    "path": "/api/transactions",
    "headers": {
      "Authorization": "Bearer (string)"
    },
    "body": {
      "description": "Test",
      "amount": 100,
      "category": "shopping",  // ← Invalid enum
      "type": "expense"
    }
  },
  "http-response": {
    "status": 400,
    "body": {
      "success": false,
      "error": "VALIDATION_ERROR",
      "message": "(string)"
    }
  }
}
```

**What This Tests**:
- ✓ Only spec-defined enums accepted
- ✓ Invalid enum rejected with 400
- ✓ Error indicates what went wrong

### Pattern 5: Authorization Failures

**Purpose**: Ensure auth requirements enforced

```json
// examples/user_profile_unauthorized.json
{
  "http-request": {
    "method": "GET",
    "path": "/api/users/me",
    "headers": {
      "Authorization": "Bearer invalid-token"
    }
  },
  "http-response": {
    "status": 401,
    "body": {
      "success": false,
      "error": "UNAUTHORIZED",
      "message": "(string)"
    }
  }
}
```

**What This Tests**:
- ✓ Missing/invalid token rejected
- ✓ Returns 401 (unauthorized)
- ✓ Error indicates auth issue

### Pattern 6: Permission Failures

**Purpose**: Ensure permission checks enforced

```json
// examples/admin_create_user_forbidden.json
{
  "http-request": {
    "method": "POST",
    "path": "/api/users",
    "headers": {
      "Authorization": "Bearer (string)"
    },
    "body": {
      "name": "New User",
      "email": "new@example.com",
      "password": "password123",
      "role": "viewer"
    }
  },
  "http-response": {
    "status": 403,
    "body": {
      "success": false,
      "error": "FORBIDDEN",
      "message": "(string)"
    }
  }
}
```

**Note**: Mock API doesn't validate permissions, but this documents what real backend should do.

### Pattern 7: Not Found

**Purpose**: Verify 404 when resource doesn't exist

```json
// examples/user_not_found.json
{
  "http-request": {
    "method": "GET",
    "path": "/api/users/nonexistent-id",
    "headers": {
      "Authorization": "Bearer (string)"
    }
  },
  "http-response": {
    "status": 404,
    "body": {
      "success": false,
      "error": "NOT_FOUND",
      "message": "User not found"
    }
  }
}
```

**What This Tests**:
- ✓ Missing resource returns 404
- ✓ Error structure follows spec

### Pattern 8: Pagination

**Purpose**: Test list endpoints with pagination

```json
// examples/transactions_paginated.json
{
  "http-request": {
    "method": "GET",
    "path": "/api/transactions?page=1&limit=10",
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

**What This Tests**:
- ✓ Pagination parameters accepted
- ✓ Response includes pagination info
- ✓ Data array format correct

### Pattern 9: Filtering

**Purpose**: Test list endpoints with filters

```json
// examples/transactions_filtered.json
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

**What This Tests**:
- ✓ Filter parameters accepted
- ✓ Response reflects filters
- ✓ Only matching data returned

### Pattern 10: Empty Results

**Purpose**: Test behavior with no results

```json
// examples/transactions_empty.json
{
  "http-request": {
    "method": "GET",
    "path": "/api/transactions?category=nonexistent",
    "headers": {
      "Authorization": "Bearer (string)"
    }
  },
  "http-response": {
    "status": 200,
    "body": {
      "success": true,
      "transactions": [],
      "total": 0,
      "page": 1,
      "pages": 0
    }
  }
}
```

**What This Tests**:
- ✓ Empty results handled gracefully
- ✓ Returns 200 (not 404)
- ✓ Returns empty array

---

## Edge Cases

### Boundary Values

```json
// Test minimum valid values
{
  "http-request": {
    "method": "POST",
    "path": "/api/transactions",
    "body": {
      "description": "A",  // ← Minimum length
      "amount": 0.01,      // ← Minimum value
      "category": "food",
      "type": "expense"
    }
  },
  "http-response": {
    "status": 201,
    "body": {
      "success": true,
      "transaction": {...}
    }
  }
}
```

```json
// Test maximum valid values
{
  "http-request": {
    "method": "POST",
    "path": "/api/transactions",
    "body": {
      "description": "A very long transaction description that is at the maximum allowed length...",
      "amount": 999999.99,  // ← Maximum value
      "category": "food",
      "type": "expense"
    }
  },
  "http-response": {
    "status": 201,
    "body": {
      "success": true,
      "transaction": {...}
    }
  }
}
```

### Special Characters

```json
// Test Unicode and special characters
{
  "http-request": {
    "method": "POST",
    "path": "/api/auth/register",
    "body": {
      "name": "José García 🎉",  // ← Unicode
      "email": "josé@example.com",
      "password": "pässw0rd!@#$"  // ← Special chars
    }
  },
  "http-response": {
    "status": 201,
    "body": {
      "success": true,
      "user": {
        "name": "José García 🎉",
        "email": "josé@example.com"
      }
    }
  }
}
```

### Null vs Empty

```json
// Null value (invalid)
{
  "http-request": {
    "method": "POST",
    "path": "/api/transactions",
    "body": {
      "description": null,  // ← Null, not empty string
      "amount": 100,
      "category": "food",
      "type": "expense"
    }
  },
  "http-response": {
    "status": 400,
    "body": {
      "success": false,
      "error": "VALIDATION_ERROR",
      "message": "(string)"
    }
  }
}
```

```json
// Empty string (might be valid)
{
  "http-request": {
    "method": "POST",
    "path": "/api/transactions",
    "body": {
      "description": "",  // ← Empty string
      "amount": 100,
      "category": "food",
      "type": "expense"
    }
  },
  "http-response": {
    "status": 400,
    "body": {
      "success": false,
      "error": "VALIDATION_ERROR",
      "message": "Description cannot be empty"
    }
  }
}
```

---

## Error Scenarios

### Common HTTP Status Codes

| Status | When | Example |
|--------|------|---------|
| **200** | Request succeeded | GET user |
| **201** | Resource created | POST new transaction |
| **204** | No content | DELETE with no body |
| **400** | Bad request (validation) | Invalid email |
| **401** | Unauthorized (auth) | Invalid token |
| **403** | Forbidden (permissions) | Non-admin endpoint |
| **404** | Not found | User ID doesn't exist |
| **409** | Conflict | Email already used |
| **500** | Server error | Database crash |
| **503** | Service unavailable | Maintenance |

### Standard Error Response Format

```javascript
// Always use this format for errors
{
  "success": false,           // ← Always false for errors
  "error": "ERROR_CODE",      // ← Machine readable
  "message": "Human message"  // ← User friendly
}
```

---

## Performance Considerations

### Response Time Testing

Document acceptable response times in comments:

```json
// examples/user_profile.json
// Expected: < 100ms
// SLA: < 500ms
{
  "http-request": {
    "method": "GET",
    "path": "/api/users/me",
    "headers": {
      "Authorization": "Bearer (string)"
    }
  },
  "http-response": {
    "status": 200,
    "body": {
      "success": true,
      "user": {...}
    }
  }
}
```

### Large Data Sets

```json
// examples/transactions_large_list.json
// Test with many items (pagination should handle)
{
  "http-request": {
    "method": "GET",
    "path": "/api/transactions?page=10&limit=100",
    "headers": {
      "Authorization": "Bearer (string)"
    }
  },
  "http-response": {
    "status": 200,
    "body": {
      "success": true,
      "transactions": [
        {...},
        {...},
        // ... 100 items total
      ],
      "total": 1000,
      "page": 10,
      "pages": 10
    }
  }
}
```

---

## CI/CD Best Practices

### Pre-commit Checks

```bash
#!/bin/bash
# .githooks/pre-commit

# Validate spec
npm run test:contract:validate || exit 1

# Run contract tests locally
npm run test:contract || exit 1

exit 0
```

### GitHub Actions Workflow

Key elements:

1. **Trigger on relevant changes**
```yaml
on:
  push:
    branches: [main, develop]
    paths:
      - 'server/**'
      - '.github/workflows/**'
```

2. **Parallel jobs for speed**
```yaml
jobs:
  validate-spec:
    # Fast: just validates YAML
    
  contract-tests:
    # Slower: runs full tests
    needs: validate-spec
```

3. **Clear status reporting**
```yaml
- name: Report results
  if: always()  # Run even if tests fail
  run: echo "Test status: ${{ job.status }}"
```

### Protected Branches

Configure GitHub branch protection:

```
Branch: main
- ✓ Require pull request reviews
- ✓ Require passing CI checks
  - Spec validation
  - Contract tests
  - Tests must pass before merge
```

---

## Debugging Tips

### Test Fails: Understanding Error Messages

**Error**: `Response does not match schema`

```
Expected:  {success: boolean, user: {...}, token: string}
Actual:    {user: {...}}
Missing:   success, token
```

**Fix**: Add missing fields to response

**Error**: `Invalid enum value`

```
Field: category
Expected one of: ['food', 'transport', 'utilities', 'entertainment']
Actual: 'shopping'
```

**Fix**: Use valid enum value

### Enable Verbose Output

```bash
npm run test:contract:verbose
```

Shows:
- Request sent to server
- Response received
- What validation failed
- Helpful error messages

### Check Server Logs

Terminal where you ran `npm start`:

```
POST /api/transactions
Body: {description: "...", amount: 100, ...}
Error: Invalid category value
```

### Test Locally First

```bash
# Before pushing, run everything locally

# 1. Validate spec
npm run test:contract:validate

# 2. Start server
npm start &

# 3. Run tests
npm run test:contract

# 4. Fix any failures
# 5. Commit and push
```

---

## Advanced Techniques

### Conditional Tests

Create variations for different scenarios:

```
examples/
├── dashboard_admin.json           # Admin view
├── dashboard_analyst.json         # Analyst view
├── dashboard_viewer.json          # Viewer view
└── dashboard_unauthenticated.json # No auth
```

### Scenario-Based Testing

Group related tests:

```
examples/
├── auth/
│   ├── register_success.json
│   ├── register_duplicate.json
│   ├── login_success.json
│   └── login_invalid_creds.json
│
├── transactions/
│   ├── create_success.json
│   ├── create_invalid.json
│   ├── list_success.json
│   └── list_filtered.json
│
└── users/
    ├── profile_success.json
    ├── update_success.json
    └── delete_success.json
```

### Custom Matchers

```json
// Use built-in matchers for precision
{
  "http-response": {
    "body": {
      "userId": "(uuid)",        // UUID format
      "email": "(email)",        // Email format
      "date": "(datetime)",      // ISO 8601
      "count": "(number)",       // Any number
      "name": "(string)",        // Any string
      "active": "(boolean)"      // true or false
    }
  }
}
```

### Testing Race Conditions

```json
// Create transaction twice rapidly
// Verify idempotency
{
  "http-request": {
    "method": "POST",
    "path": "/api/transactions",
    "body": {
      "description": "Test",
      "idempotencyKey": "unique-key-123"
    }
  }
}
```

### Performance Benchmarking

Add timing annotations:

```json
// examples/performance_baseline.json
// Expected max response time: 500ms
// Alert if exceeds: 1000ms
{
  "http-request": {
    "method": "GET",
    "path": "/api/dashboard/summary"
  },
  "http-response": {
    "status": 200,
    "body": {...}
  }
}
```

---

## Testing Checklist

Before deploying new endpoint:

- [ ] Happy path test added (success case)
- [ ] Error case tests added (400, 401, 403, 404)
- [ ] Validation tests added (required fields, format)
- [ ] Enum validation tests added
- [ ] Pagination tests added (if list endpoint)
- [ ] Filter tests added (if searchable)
- [ ] Empty results test added
- [ ] Edge case tests added (null, empty, special chars)
- [ ] Response matches spec schema exactly
- [ ] Status codes are correct
- [ ] All required fields present
- [ ] All tests pass locally
- [ ] All tests pass in CI/CD
- [ ] No breaking changes to other endpoints

---

## Summary

**Good contract tests**:
- ✓ Cover happy path and errors
- ✓ Test validation rules
- ✓ Verify response schema matches
- ✓ Use meaningful example data
- ✓ Document edge cases
- ✓ Run automatically in CI/CD

**Poor contract tests**:
- ✗ Only test one success scenario
- ✗ Ignore error cases
- ✗ Use unrealistic data
- ✗ Miss edge cases
- ✗ Allow breaking changes

The goal: **Every endpoint works exactly as specified, every time.**

---

*See also: [BACKEND_IMPLEMENTATION_GUIDE.md](./BACKEND_IMPLEMENTATION_GUIDE.md) for implementation details*
