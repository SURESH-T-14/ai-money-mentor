# AI Money Mentor - Spec Driven Development

## 🎯 Welcome to Contract-Driven Development!

The **AI Money Mentor** project now uses **Spec Driven Development** with OpenAPI and Specmatic. This enables:

✅ **Parallel Development** - Frontend and backend work simultaneously  
✅ **Early Integration** - Catch issues before deployment  
✅ **Living Documentation** - API spec is always up-to-date  
✅ **Quality Assurance** - Automated contract testing  
✅ **Consumer-Friendly** - Mock API available for client testing  

---

## 📚 Documentation Overview

### For Backend Developers
👉 **[SPEC_DRIVEN_DEVELOPMENT.md](./SPEC_DRIVEN_DEVELOPMENT.md)** - Complete integration guide
- How to run contract tests
- Writing test examples
- API specification details
- CI/CD integration
- Best practices

### For Frontend Developers
👉 **[CONSUMER_GUIDE.md](./CONSUMER_GUIDE.md)** - Frontend development guide
- How to use the mock API
- API endpoint reference
- Authentication setup
- Example code
- Testing with mock data

### Quick Start
👉 **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- Run local tests
- Docker testing
- Common commands
- Troubleshooting

### API Specification
👉 **[specs/openapi.yaml](./specs/openapi.yaml)** - Full OpenAPI 3.0 specification
- All endpoints
- Request/response schemas
- Authentication
- Error responses

---

## 🚀 Quick Start (Choose Your Role)

### Backend Developer - Run Contract Tests

```bash
cd server

# Terminal 1: Start the server
npm install
npm start

# Terminal 2: Run contract tests
npm run test:contract
```

**Result**: ✓ All endpoints validated against specification

### Frontend Developer - Use Mock API

```bash
cd server

# Start the mock API
npm install
npm run mock
# API runs on http://localhost:8080
```

**Use in your code**:
```javascript
const API_BASE_URL = 'http://localhost:8080';
```

### QA/Testing - Run Everything

```bash
cd server

# Run tests with Docker
docker-compose -f docker-compose.test.yml up
```

---

## 📂 Project Structure

```
server/
├── specs/
│   └── openapi.yaml                    # ← Main API Contract
├── specmatic.yaml                      # ← Specmatic Configuration
├── examples/                           # ← Contract Test Data
│   ├── auth_register.json
│   ├── auth_login.json
│   ├── user_profile.json
│   ├── transaction_add.json
│   ├── transaction_list.json
│   ├── transaction_summary.json
│   └── ai_chat.json
├── SPEC_DRIVEN_DEVELOPMENT.md          # ← Complete Guide (Backend)
├── CONSUMER_GUIDE.md                   # ← Consumer Guide (Frontend)
├── QUICK_START.md                      # ← Quick Reference
├── package.json                        # ← npm scripts for testing
├── Dockerfile                          # ← Docker configuration
├── docker-compose.test.yml             # ← Docker Compose setup
├── controllers/                        # ← API Implementation
├── routes/                             # ← API Routes
├── models/                             # ← Data Models
├── middleware/                         # ← Auth & Middleware
└── server.js                           # ← Express App
```

---

## 🔄 Development Workflow

### Phase 1: Design (Spec First)
1. Create/update `specs/openapi.yaml`
2. Define all endpoints, request/response schemas
3. Get team consensus on contract

### Phase 2: Parallel Development
**Backend**: 
- Implement endpoints per spec
- Run `npm run test:contract` continuously
- Update spec if needed

**Frontend**: 
- Use `npm run mock` API
- Build components
- No blocking on backend

### Phase 3: Integration
1. Backend: Ensure all tests pass
2. Frontend: Switch from mock to real API
3. Run full system tests

### Phase 4: Deployment
1. Validate spec is current
2. Run all tests in CI/CD
3. Deploy with confidence

---

## 🧪 Testing

### Contract Testing (Verify Implementation Matches Spec)

```bash
cd server

# Run all contract tests
npm run test:contract

# With verbose output
npm run test:contract:verbose

# Validate spec syntax
npm run test:contract:validate
```

### Test Coverage

The example files cover:
- ✅ Registration and login
- ✅ User profile retrieval
- ✅ Transaction management (add, list, update, delete)
- ✅ Financial summary
- ✅ AI advisor chat

### Adding More Test Cases

1. Create new JSON file in `examples/` directory
2. Follow structure in existing files
3. Use Specmatic matchers: `(string)`, `(number)`, `(uuid)`, etc.
4. Run tests: `npm run test:contract`

---

## 🎪 Mock Server

For frontend development without backend:

```bash
cd server
npm run mock
```

Mock server:
- Runs on http://localhost:8080
- Returns realistic data from examples
- Supports all API endpoints
- Available immediately after startup

**Use with Postman or curl**:
```bash
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer (any-token)"
```

---

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/google` - Google OAuth

### Users  
- `GET /api/users/me` - Current user
- `GET /api/users` - List (admin)
- `POST /api/users` - Create (admin)
- `PATCH /api/users/{id}` - Update (admin)

### Transactions
- `GET /api/transactions` - List
- `POST /api/transactions` - Create
- `GET /api/transactions/summary` - Dashboard
- `PUT /api/transactions/{id}` - Update
- `DELETE /api/transactions/{id}` - Delete

### AI Advisor
- `POST /api/ai/chat` - Get advice

**See [specs/openapi.yaml](./specs/openapi.yaml) for full details**

---

## 🔐 Authentication

All protected endpoints require JWT token:

```javascript
fetch('/api/transactions', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOi...'
  }
});
```

Get token via:
1. `POST /api/auth/register` - Sign up
2. `POST /api/auth/login` - Sign in
3. `POST /api/auth/google` - OAuth

---

## 📦 Available npm Scripts

```bash
npm start              # Start server
npm run dev            # Start with nodemon
npm run seed           # Seed database
npm run test:contract  # Run contract tests
npm run test:contract:verbose  # Tests with details
npm run test:contract:validate # Validate OpenAPI spec
npm run mock           # Start mock API server
```

---

## 🐳 Docker

### Run Tests in Docker

```bash
cd server

# Build and run
docker-compose -f docker-compose.test.yml up

# Stop containers
docker-compose -f docker-compose.test.yml down
```

### Dockerfile Features
- Node 18 Alpine image (lightweight)
- Auto-installs dependencies
- Exposes port 5000
- Ready for production

---

## 🚨 Troubleshooting

### "Connection refused" error
→ Server not running. Start with `npm start`

### "Type mismatch" in tests
→ Response doesn't match spec. Check implementation

### "Path not found" error
→ Route not registered. Check `server.js`

### Mock server not starting
→ Check port 8080 not in use. Or use different port with: `npm run mock -- --port 9000`

### CORS errors from frontend
→ Frontend using different port. Check API_BASE_URL config

**See detailed troubleshooting in [SPEC_DRIVEN_DEVELOPMENT.md](./SPEC_DRIVEN_DEVELOPMENT.md#troubleshooting)**

---

## 🎓 Learning Resources

### Specmatic
- [Specmatic Documentation](https://docs.specmatic.in)
- [Contract Testing](https://docs.specmatic.in/documentation/contract)
- [OpenAPI Support](https://docs.specmatic.in/documentation/openapi)

### OpenAPI
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.0)
- [OpenAPI Best Practices](https://swagger.io/resources/articles/best-practices-in-api-design/)

### Contract-Driven Development
- [Contract Testing Basics](https://docs.specmatic.in/documentation/contract)
- [Why Contract Testing Matters](https://docs.specmatic.in/documentation/why-cdc)

---

## 👥 Team Roles

### Backend Team
- **Responsibility**: Implement endpoints per spec
- **Tools**: `npm run test:contract`
- **Deliverable**: Passing tests + working API
- **Example**: Implementation of auth, transactions, AI

### Frontend Team
- **Responsibility**: Build UI/components
- **Tools**: `npm run mock`
- **Deliverable**: Working UI integrated with API
- **Example**: Login form, transaction list, dashboard

### QA/Testing Team
- **Responsibility**: Validate entire system
- **Tools**: All contract tests + integration tests
- **Deliverable**: Test report + coverage metrics
- **Example**: End-to-end workflows, performance testing

### API Design Team
- **Responsibility**: Maintain OpenAPI spec
- **Tools**: OpenAPI editor (Swagger Editor)
- **Deliverable**: Current, accurate specification
- **Example**: Designing new endpoints, versioning

---

## 📈 Next Steps

1. ✅ **Read this README** (you are here!)
2. 📖 **Choose your guide**:
   - Backend? → [SPEC_DRIVEN_DEVELOPMENT.md](./SPEC_DRIVEN_DEVELOPMENT.md)
   - Frontend? → [CONSUMER_GUIDE.md](./CONSUMER_GUIDE.md)
3. ⚡ **Quick start**: [QUICK_START.md](./QUICK_START.md)
4. 🧪 **Run tests/mock**: Use npm scripts
5. 💻 **Start coding!**

---

## 🤝 Contributing

When contributing:

1. **Update spec first**: Edit `specs/openapi.yaml`
2. **Add test examples**: Create files in `examples/`
3. **Run tests**: `npm run test:contract`
4. **Ensure compliance**: All tests must pass
5. **Document changes**: Update relevant guide

---

## ⚙️ Configuration

### Environment Variables

```bash
# .env file
MONGO_URI=mongodb://localhost:27017/aimoneymentor
PORT=5000
NODE_ENV=development
```

### Specmatic Config

Edit `specmatic.yaml` for:
- Base URL
- Test mode (positive/negative)
- Timeout settings
- Security schemes

---

## 📊 Metrics & Monitoring

### Test Results
```bash
npm run test:contract:verbose
```
Output shows:
- ✓ Passed tests
- ✗ Failed tests
- Test coverage
- Response times

### API Coverage
Verify all implemented endpoints are documented:
```bash
specmatic coverage --spec specs/openapi.yaml
```

---

## 🔐 Security

### API Security
- JWT token authentication
- Role-based access control (viewer, analyst, admin)
- Protected endpoints require token
- CORS enabled for frontend

### Secure Development
- Don't commit `.env` with real credentials
- Use environment variables
- Validate all inputs
- Test error cases

---

## 📞 Support & Questions

| Question | Resource |
|----------|----------|
| How do I run tests? | [QUICK_START.md](./QUICK_START.md) |
| How do I use mock API? | [CONSUMER_GUIDE.md](./CONSUMER_GUIDE.md) |
| What's the API spec? | [specs/openapi.yaml](./specs/openapi.yaml) |
| Full integration guide? | [SPEC_DRIVEN_DEVELOPMENT.md](./SPEC_DRIVEN_DEVELOPMENT.md) |
| Specmatic documentation? | [docs.specmatic.in](https://docs.specmatic.in) |

---

## 🎉 Success Indicators

Your Spec Driven Development is working when:

- ✅ `npm run test:contract` passes
- ✅ Mock API responds to requests
- ✅ Frontend works with mock API
- ✅ Backend tests pass in CI/CD
- ✅ Teams can work in parallel
- ✅ Integration happens smoothly
- ✅ No "works on my machine" issues
- ✅ API documentation stays current

---

## 📅 Version History

- **v1.0** (2024) - Initial Spec Driven Development setup
  - OpenAPI 3.0 specification
  - Contract testing with Specmatic
  - Example-driven test data
  - Mock API support
  - Consumer and developer guides

---

**Status**: ✨ Active Implementation

**Last Updated**: 2024-06-16

**Maintainers**: AI Money Mentor Development Team

---

Start your journey with Spec Driven Development! Choose your guide below:

🔹 **Backend Developer** → [SPEC_DRIVEN_DEVELOPMENT.md](./SPEC_DRIVEN_DEVELOPMENT.md)  
🔹 **Frontend Developer** → [CONSUMER_GUIDE.md](./CONSUMER_GUIDE.md)  
🔹 **Quick Start** → [QUICK_START.md](./QUICK_START.md)
