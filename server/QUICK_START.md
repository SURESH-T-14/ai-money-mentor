# Quick Start: Running Spec Driven Development Tests

## 🚀 Quick Start (5 minutes)

### Option 1: Local Testing (Recommended for Development)

1. **Terminal 1 - Start the Server**
   ```bash
   cd server
   npm install
   npm start
   ```
   Server runs on http://localhost:5000

2. **Terminal 2 - Run Contract Tests**
   ```bash
   cd server
   npm run test:contract
   ```

**Expected Output:**
```
✓ POST /api/auth/register
✓ POST /api/auth/login
✓ GET /api/users/me
✓ GET /api/transactions
✓ POST /api/transactions
✓ GET /api/transactions/summary
✓ POST /api/ai/chat
```

### Option 2: Docker Testing (Isolated Environment)

```bash
cd server

# Run tests in Docker
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

---

## 📋 Common Commands

### Validate OpenAPI Spec
```bash
cd server
npm run test:contract:validate
```

### Run Tests with Details
```bash
cd server
npm run test:contract:verbose
```

### Start Mock Server
```bash
cd server
npm run mock
# Mock API runs on http://localhost:8080
```

### View API Documentation
```bash
# Open in Swagger UI
open http://localhost:8080/api-docs

# Or use online editor
# https://editor.swagger.io/
# Load: ./specs/openapi.yaml
```

---

## 🔍 Troubleshooting

### Tests Fail: "Connection refused"
**Problem**: Server not running
**Solution**: Start server in another terminal
```bash
cd server
npm start
```

### Tests Fail: "Spec not found"
**Problem**: OpenAPI file location incorrect
**Solution**: Check path in `specmatic.yaml`
```yaml
definition:
  specPath: ./specs/openapi.yaml  # Must be correct path
```

### Tests Fail: "Type mismatch"
**Problem**: Response doesn't match spec
**Solution**: Check implementation returns correct data types

---

## 📚 Next Steps

1. **Read the full guide**: `SPEC_DRIVEN_DEVELOPMENT.md`
2. **Add more examples**: Edit files in `examples/` directory
3. **Integrate in CI/CD**: Use `npm run test:contract` in pipeline
4. **Mock for frontend**: Run `npm run mock` for parallel development

---

## 🎯 API Endpoints

- **Auth**: POST `/api/auth/register`, `/api/auth/login`
- **Users**: GET `/api/users/me`, GET `/api/users`, POST `/api/users`
- **Transactions**: GET/POST `/api/transactions`, GET `/api/transactions/summary`
- **AI**: POST `/api/ai/chat`

See `specs/openapi.yaml` for full details.

---

## 💡 Tips

- Update spec **before** implementing changes
- Run tests on every commit
- Use mock server for frontend development
- Keep examples updated with new scenarios

---

For detailed information, see [SPEC_DRIVEN_DEVELOPMENT.md](./SPEC_DRIVEN_DEVELOPMENT.md)
